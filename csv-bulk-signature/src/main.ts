import csv from "csv-parser";
import fs from "fs";
import handlebars from "handlebars";
import inlineCss from "inline-css";
import jszip from "jszip";
import path from "path";

// inputs
const CSV_FILE = "./src/contacts.csv";
const TEMPLATE = "./src/email-sig-template.html";

const LOGOS = {
  "ata-cpa-advisors":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATA_LOGO-CPAAdvisor-BT-RGB.png",
  "ata-capital":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATAC_LOGO-BT-RGB.png",
  "ata-employment-solutions":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATAES_LOGO-BT-RGB.png",
} as const;

interface Contact {
  "Brand*": keyof typeof LOGOS;
  "Full Name*": string;
  Credentials: string;
  "Title*": string;
  "Office Phone*": string;
  "Mobile Phone": string;
  "Calendly Link": string;
}

interface TemplateData {
  logoUrl: string;
  fullName: string;
  credentials: string;
  title: string;
  officePhone: string;
  mobilePhone: string;
  calendly: string;
}

const skippedRows: string[] = [];
let counter = 0;

fs.readFile(TEMPLATE, "utf8", async (err, og_template) => {
  if (err) throw err;

  const inlinedTemplate = await inlineCss(og_template, {
    url: "./",
    removeHtmlSelectors: true,
  });

  // Compile the template
  const template = await handlebars.compile<TemplateData>(inlinedTemplate);

  // deleteAllSignatures();
  checkHeadersToBeSame();
  generateSignatures(template);
});

function generateSignatures(
  template: HandlebarsTemplateDelegate<TemplateData>
) {
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on("data", (row: Contact) => {
      const logoId = row["Brand*"];
      const logoUrl = LOGOS[logoId];
      const fullName = row["Full Name*"];
      const credentials = row["Credentials"];
      const title = row["Title*"];
      const officePhone = row["Office Phone*"];
      const mobilePhone = row["Mobile Phone"];
      const calendly = row["Calendly Link"];

      const hasRequiredData = checkRequiredFields(row);
      if (!hasRequiredData) {
        skippedRows.push(fullName);
        return;
      }
      if (template) {
        const html = template({
          logoUrl,
          fullName,
          credentials,
          title,
          officePhone,
          mobilePhone,
          calendly,
        });
        fs.writeFile(
          `./dist/${fullName.split(" ").join("")}.htm`,
          html,
          (err) => {
            if (err) throw err;
          }
        );
        counter = counter + 1;
      }
    })
    .on("end", () => {
      // show skipped rows
      if (skippedRows.length) console.log({ skippedRows });

      // show results summary
      console.log("Number of signatures processed", counter);
      console.log(
        "Number of signatures skipped",
        skippedRows.length,
        "for missing required fields (scroll up to see list)"
      );
    });
  zipUpFile();
}

const checkRequiredFields = (row: Contact) => {
  if (
    row["Brand*"].length &&
    row["Full Name*"].length &&
    row["Title*"].length &&
    row["Office Phone*"].length
  )
    return true;
  return false;
};

function deleteAllSignatures() {
  const folderPath = "./dist";

  fs.readdir(folderPath, (error, files) => {
    if (error) {
      console.error(error);
      return;
    }

    for (const file of files) {
      if (path.extname(file) === ".html") {
        fs.unlink(path.join(folderPath, file), (error) => {
          if (error) {
            console.error(error);
          }
        });
      }
    }
  });
}

function checkHeadersToBeSame() {
  const expectedHeaders = [
    "Brand*",
    "Full Name*",
    "Credentials",
    "Title*",
    "Office Phone*",
    "Mobile Phone",
    "Calendly Link",
  ];

  const parser = csv();

  let counter = 0;

  fs.createReadStream(CSV_FILE)
    .pipe(parser)
    .on("data", (data) => {
      if (counter === 1) return;

      const headersMatch = expectedHeaders.every((expectedHeader) =>
        data.hasOwnProperty(expectedHeader)
      );
      if (headersMatch) {
        console.log("Headers match ::thumbs::");
      } else {
        console.log("Headers do not match ::warning::");
      }
      counter = 1;
    });
}

async function zipUpFile() {
  const folderPath = "./dist";
  const files = fs.readdirSync(folderPath);
  const filesHtm = files.filter((file) => file.endsWith(".htm"));

  const zip = new jszip();

  filesHtm.forEach((file) => {
    try {
      const filePath = `${folderPath}/${file}`;
      const fileContents = fs.readFileSync(filePath);
      zip.file(file, fileContents);
    } catch (error) {
      console.error(`Error adding file ${file}: ${error.message}`);
    }
  });

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync(`signatures-${new Date().toDateString()}.zip`, buffer);
}
