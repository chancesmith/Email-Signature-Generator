import { parse } from "csv-parse";
import fs from "fs";
import handlebars from "handlebars";
import inlineCss from "inline-css";
import jszip from "jszip";

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
const processedRows: string[] = [];

async function setupFolders() {
  // create ./dist/signatures if it doesn't exist
  if (!fs.existsSync("./dist")) {
    await fs.promises.mkdir("./dist");
  }
  if (!fs.existsSync("./dist/signatures")) {
    await fs.promises.mkdir("./dist/signatures");
  }
}

async function getTemplate() {
  const og_template = await fs.promises.readFile(TEMPLATE, "utf8");

  const inlinedTemplate = await inlineCss(og_template, {
    url: "./",
    removeHtmlSelectors: true,
  });

  // Compile the template
  return handlebars.compile<TemplateData>(inlinedTemplate);
}

async function generateSignatures(
  template: HandlebarsTemplateDelegate<TemplateData>
) {
  const contacts = await getCSVRows(CSV_FILE);

  // filter out the first row
  const filteredContacts = contacts.filter((contact) => {
    // @ts-ignore - a hack to skip the first row
    return contact["Brand*"] !== "use dropdown to select a brand";
  });

  // check if all required fields are present and log out skipped rows
  const filteredContactsWithRequiredFields = filteredContacts.filter(
    (contact) => {
      const hasRequiredData = checkRequiredFields(contact);
      if (!hasRequiredData) {
        skippedRows.push(contact["Full Name*"]);
      } else {
        processedRows.push(contact["Full Name*"]);
      }
      return hasRequiredData;
    }
  );

  // generate signatures
  filteredContactsWithRequiredFields.forEach(async (contact) => {
    const logoId = contact["Brand*"];
    const logoUrl = LOGOS[logoId];
    const fullName = contact["Full Name*"];
    const credentials = contact["Credentials"];
    const title = contact["Title*"];
    const officePhone = contact["Office Phone*"];
    const mobilePhone = contact["Mobile Phone"];
    const calendly = contact["Calendly Link"];

    const html = template({
      logoUrl,
      fullName,
      credentials,
      title,
      officePhone,
      mobilePhone,
      calendly,
    });

    await fs.promises.writeFile(
      `./dist/signatures/${fullName.split(" ").join("")}.htm`,
      html
    );
  });

  console.log("Number of signatures processed", processedRows.length);
  console.log("Number of signatures skipped", skippedRows.length);
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

async function checkHeadersToBeSame() {
  const expectedHeaders = [
    "Brand*",
    "Full Name*",
    "Credentials",
    "Title*",
    "Office Phone*",
    "Mobile Phone",
    "Calendly Link",
  ];

  const contacts = await getCSVRows(CSV_FILE);
  const firstContact = contacts[0];

  const headersMatch = expectedHeaders.every((expectedHeader) => {
    return Object.keys(firstContact).includes(expectedHeader);
  });

  if (headersMatch) {
    console.log("CSV Headers match 👍");
  } else {
    throw new Error("CSV Headers do not match 🙅‍♂️");
  }
}

async function zipUpFile() {
  console.log("Zipping up files...");

  const folderPath = "./dist/signatures";
  const files = fs.readdirSync(folderPath);
  const filesHtm = files.filter(
    (file) => file.endsWith(".htm") || file.endsWith(".txt")
  );

  const zip = new jszip();

  filesHtm.forEach(async (file) => {
    try {
      const filePath = `${folderPath}/${file}`;
      const fileContents = await fs.promises.readFile(filePath);
      await zip.file(file, fileContents);
    } catch (error: any) {
      console.error(`Error adding file ${file}: ${error.message}`);
    }
  });

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  await fs.promises.writeFile(
    `${folderPath}-${
      new Date().toISOString().split(":").join("_").split(".")[0] // date and time
    }.zip`,
    buffer
  );
}

async function createStatusReport() {
  skippedRows.unshift("\nROWS/SIGNATURES SKIPPED:\n");
  processedRows.unshift("\nROWS/SIGNATURES PROCESSED SUCCESSFULLY:\n");
  const combinedStatus = skippedRows.concat(processedRows);
  await fs.promises.writeFile(
    "./dist/signatures/_statusReport.txt",
    combinedStatus.join("\n")
  );
  console.log("Report created 👍");
}

async function getCSVRows(path: string) {
  return new Promise((resolve: (arg: Contact[]) => void, reject) => {
    return fs.promises.readFile(path).then((fileData) => {
      parse(fileData, { columns: true }, function (err, rows) {
        resolve(rows as Contact[]);
      });
    });
  });
}

async function main() {
  await setupFolders();
  const template = await getTemplate();
  await checkHeadersToBeSame();
  await generateSignatures(template);
  await createStatusReport(); // refactoring the results specifics to be shown in a text file, instead
  await zipUpFile();
}

main().catch((err) => {
  console.log({ err });
});
