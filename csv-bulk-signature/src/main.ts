import { parse } from "csv-parse";
import fs from "fs";
import handlebars from "handlebars";
import inlineCss from "inline-css";
import jszip from "jszip";
import {
  LOGOS,
  TEMPLATE_FILE,
  SIGNATURES_PATH,
  ZIP_FILE,
  STATUS_REPORT_FILE,
  CSV_FILE,
  CSV_EXPIRATION_DAYS,
} from "./config";

interface Contact {
  "Brand*": keyof typeof LOGOS;
  "Full Name*": string;
  Credentials: string;
  "Title*": string;
  "Office Phone*": string;
  "Mobile Phone": string;
  "Calendly Link": string;
  skip?: boolean;
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

interface StatusReport {
  skippedRows: string[];
  processedRows: string[];
}

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
  for await (const contact of contacts) {
    if (contact.skip) return; // skip if missing required fields

    const html = template({
      logoUrl: LOGOS[contact["Brand*"]],
      fullName: contact["Full Name*"],
      credentials: contact["Credentials"],
      title: contact["Title*"],
      officePhone: contact["Office Phone*"],
      mobilePhone: contact["Mobile Phone"],
      calendly: contact["Calendly Link"],
    });

    const fileName = contact["Full Name*"].split(" ").join("");
    await fs.promises.writeFile(`${SIGNATURES_PATH}/${fileName}.htm`, html);
  }

  console.log("👍 Signatures generated");
}

const checkRequiredFields = (row: Contact) =>
  !!row["Brand*"].length &&
  !!row["Full Name*"].length &&
  !!row["Title*"].length &&
  !!row["Office Phone*"].length;

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
    throw new Error("🔴 CSV Headers do not match");
  }
}

async function zipUpFile() {
  const signatureFolder = await fs.promises.readdir(SIGNATURES_PATH);
  const files = signatureFolder.filter(
    (file) => file.endsWith(".htm") || file.endsWith(".txt")
  );

  const zip = new jszip();

  for await (const file of files) {
    const filePath = `${SIGNATURES_PATH}/${file}`;
    const fileContents = await fs.promises.readFile(filePath);
    zip.file(file, fileContents);
  }

  try {
    const buffer = await zip.generateAsync({ type: "nodebuffer" });

    await fs.promises.writeFile(ZIP_FILE, buffer);

    console.log("👍 Zip file created (signatures + report)");
  } catch (error) {
    console.error(error);
  }
}

async function createStatusReport(contacts: Contact[]) {
  const skippedRows: string[] = [];
  const processedRows: string[] = [];

  // 1. collect skipped and processed rows
  for (const contact of contacts) {
    if (contact.skip) {
      skippedRows.push(contact["Full Name*"]);
    } else {
      processedRows.push(contact["Full Name*"]);
    }
  }

  // 2. report in console
  console.log(
    `${skippedRows.length ? "🔴" : "👍"} Signatures:`,
    processedRows.length,
    `processed and`,
    skippedRows.length,
    `skipped`
  );

  // 3. report in file
  skippedRows.unshift(`\nROWS/SIGNATURES SKIPPED: (${skippedRows.length}) \n`);
  processedRows.unshift(
    `\nROWS/SIGNATURES PROCESSED SUCCESSFULLY: (${processedRows.length}) \n`
  );
  const combinedStatus = skippedRows.concat(processedRows);
  await fs.promises.writeFile(STATUS_REPORT_FILE, combinedStatus.join("\n"));

  console.log("👍 Report created");
}

async function getCSVRows(path: string) {
  return new Promise(async (resolve: (arg: Contact[]) => void) => {
    const file = await fs.promises.readFile(path);

    parse(file, { columns: true }, function (err, rows) {
      resolve(rows as Contact[]);
    });
  });
}

function skipFirstPlaceholderRow(contact: Contact) {
  // @ts-ignore - a hack to skip the first row
  return contact["Brand*"] !== "use dropdown to select a brand";
}

async function hasContactsFile() {
  return await fs.promises
    .access(CSV_FILE)
    .then(() => {
      return true;
    })
    .catch(() => {
      console.log("🔴 contacts.csv file does not exist");
      return false;
    });
}

async function checkContactsFileCreatedAt() {
  const stats = await fs.promises.stat(CSV_FILE);
  const createdAt = stats.birthtime;
  const now = new Date();
  const diff = Math.abs(now.getTime() - createdAt.getTime());
  const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

  if (diffDays > CSV_EXPIRATION_DAYS) {
    console.log(
      `🔴 CSV contacts file is older than ${CSV_EXPIRATION_DAYS} day(s). Please update the file.`
    );
  } else {
    console.log(
      `👍 CSV contacts file is less than ${CSV_EXPIRATION_DAYS} day(s) old`
    );
  }
}

async function checkZipIsNotEmpty(zipFilePath: string) {
  const stats = await fs.promises.stat(zipFilePath);
  if (stats.size <= 22) {
    console.error(
      `\u001b[31m\u001b[1mError: \u001b[0m\u001b[31mZip file is empty. Please check the contacts.csv file or zipFilePath() and try again.\u001b[0m`
    );
  }
}

/*
 * MAIN
 */
async function main() {
  // 1. setup folders + template
  await setupFolders();
  const template = await setupTemplate();

  // 2. check contacts file
  if (!(await hasContactsFile())) return;
  await checkContactsFileCreatedAt();

  // 3. get contacts + filter
  const contacts = await getCSVRows(CSV_FILE);
  await checkHeadersToBeSame(contacts[0]);
  const contactsWithNewProps = contacts
    .filter(skipFirstPlaceholderRow)
    .map((contact) => ({
      ...contact,
      skip: !checkRequiredFields(contact),
    }));

  // 4. generate signatures + report + zip
  await generateSignatures(template, contactsWithNewProps);
  await createStatusReport(contactsWithNewProps);
  await zipUpFile();
  await checkZipIsNotEmpty(ZIP_FILE);
}

main().catch((err) => {
  console.log({ err });
});
