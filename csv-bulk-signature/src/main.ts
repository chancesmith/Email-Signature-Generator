import { parse } from "csv-parse";
import fs from "fs";
import handlebars from "handlebars";
import inlineCss from "inline-css";
import jszip from "jszip";

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

/*
 * GLOBALS
 */
const CSV_FILE = "./src/contacts.csv";
const CSV_EXPERATION_DAYS = 1;
const TEMPLATE_FILE = "./src/email-sig-template.html";
const LOGOS = {
  "ata-cpa-advisors":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATA_LOGO-CPAAdvisor-BT-RGB.png",
  "ata-capital":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATAC_LOGO-BT-RGB.png",
  "ata-employment-solutions":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATAES_LOGO-BT-RGB.png",
} as const;
const skippedRows: string[] = [];
const processedRows: string[] = [];

/*
 * MAIN FUNCTIONS
 */
async function setupFolders() {
  // create ./dist/signatures if it doesn't exist
  if (!fs.existsSync("./dist")) {
    await fs.promises.mkdir("./dist");
  }
  if (!fs.existsSync("./dist/signatures")) {
    await fs.promises.mkdir("./dist/signatures");
  }
}

async function setupTemplate() {
  const templateFile = await fs.promises.readFile(TEMPLATE_FILE, "utf8");

  const inlinedTemplate = await inlineCss(templateFile, {
    url: "./",
    removeHtmlSelectors: true,
  });

  return handlebars.compile<TemplateData>(inlinedTemplate);
}

async function generateSignatures(
  template: HandlebarsTemplateDelegate<TemplateData>,
  contacts: Contact[]
) {
  contacts.forEach(async (contact) => {
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

  console.log(
    `${skippedRows.length ? "🙅‍♂️" : "👍"} Signatures:`,
    processedRows.length,
    `processed and`,
    skippedRows.length,
    `skipped`
  );
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

async function checkHeadersToBeSame(contact: Contact) {
  const expectedHeaders = [
    "Brand*",
    "Full Name*",
    "Credentials",
    "Title*",
    "Office Phone*",
    "Mobile Phone",
    "Calendly Link",
  ];

  const hasExpectedHeaders = expectedHeaders.every((expectedHeader) =>
    contact.hasOwnProperty(expectedHeader)
  );

  if (hasExpectedHeaders) {
    console.log("👍 CSV Headers match");
  } else {
    throw new Error("🙅‍♂️ CSV Headers do not match");
  }
}

async function zipUpFile() {
  const folderPath = "./dist/signatures";
  const files = fs.readdirSync(folderPath);
  const filesHtm = files.filter(
    (file) => file.endsWith(".htm") || file.endsWith(".txt")
  );

  const zip = new jszip();

  filesHtm.forEach(async (file) => {
    const fileContents = await fs.promises.readFile(`${folderPath}/${file}`);
    try {
      zip.file(file, fileContents);
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
  console.log("👍 Zip file created");
}

async function createStatusReport() {
  skippedRows.unshift(`\nROWS/SIGNATURES SKIPPED: (${skippedRows.length}) \n`);
  processedRows.unshift(
    `\nROWS/SIGNATURES PROCESSED SUCCESSFULLY: (${processedRows.length}) \n`
  );
  const combinedStatus = skippedRows.concat(processedRows);
  await fs.promises.writeFile(
    "./dist/signatures/_statusReport.txt",
    combinedStatus.join("\n")
  );
  console.log("👍 Report created");
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

async function filterCompleteContacts(contacts: Contact[]) {
  // filter out the first row (placeholder)
  const filteredContacts = contacts.filter((contact) => {
    // @ts-ignore - a hack to skip the first row
    return contact["Brand*"] !== "use dropdown to select a brand";
  });

  // check if all required fields are present and log out skipped rows
  const contactsWithRequiredFields = filteredContacts.filter((contact) => {
    const hasRequiredData = checkRequiredFields(contact);
    if (!hasRequiredData) {
      skippedRows.push(contact["Full Name*"]);
    } else {
      processedRows.push(contact["Full Name*"]);
    }
    return hasRequiredData;
  });

  return contactsWithRequiredFields;
}

async function hasContactsFile() {
  // check if the CSV file exists
  return await fs.promises
    .access(CSV_FILE)
    .then(() => {
      return true;
    })
    .catch(() => {
      console.log("🙅‍♂️ contacts.csv file does not exist");
      return false;
    });
}

async function checkContactsFileCreatedAt() {
  const stats = await fs.promises.stat(CSV_FILE);
  const createdAt = stats.birthtime;
  const now = new Date();
  const diff = Math.abs(now.getTime() - createdAt.getTime());
  const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

  if (diffDays > CSV_EXPERATION_DAYS) {
    console.log(
      `🙅‍♂️ CSV contacts file is older than ${CSV_EXPERATION_DAYS} day(s). Please update the file.`
    );
  } else {
    console.log(
      `👍 CSV contacts file is less than ${CSV_EXPERATION_DAYS} day(s) old`
    );
  }
}

/*
 * MAIN
 */
async function main() {
  await setupFolders();
  const template = await setupTemplate();

  if (!(await hasContactsFile())) return;
  await checkContactsFileCreatedAt();

  const contacts = await getCSVRows(CSV_FILE);
  await checkHeadersToBeSame(contacts[0]);
  const completeContacts = await filterCompleteContacts(contacts);
  await generateSignatures(template, completeContacts);
  await createStatusReport();
  await zipUpFile();
}

main().catch((err) => {
  console.log({ err });
});
