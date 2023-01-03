import { parse } from "csv-parse";
import fs from "fs";
import handlebars from "handlebars";
import inlineCss from "inline-css";
import jszip from "jszip";
import {
  CSV_FILE,
  LOGOS,
  SIGNATURES_PATH,
  STATUS_REPORT_FILE,
  TEMPLATE_FILE,
  ZIP_FILE,
} from "./config";
import {
  checkContactsFileCreatedAt,
  checkFileCountWithCsvCount,
  checkHeadersToBeSame,
  checkZipIsNotEmpty,
  hasContactsFile,
} from "./safety-checks";
import { TemplateData, Contact } from "./types";

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
    const nameSplit = contact["Full Name*"].split(" ");
    const firstInitial = nameSplit[0].charAt(0);
    const lastName = nameSplit[1];
    const fileName = `${firstInitial}${lastName}`;
    await fs.promises.writeFile(`${SIGNATURES_PATH}/${fileName}.htm`, html);
  }

  console.log("👍 Signatures generated");
}

const checkRequiredFields = (row: Contact) =>
  !!row["Brand*"].length &&
  !!row["Full Name*"].length &&
  !!row["Title*"].length &&
  !!row["Office Phone*"].length;

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
    console.log("🗜", ZIP_FILE);
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

  // 4. generate signatures
  await generateSignatures(template, contactsWithNewProps);
  await checkFileCountWithCsvCount(contactsWithNewProps);

  // 5. create report
  await createStatusReport(contactsWithNewProps);

  // 6. zip up files
  await zipUpFile();
  await checkZipIsNotEmpty(ZIP_FILE);
}

main().catch((err) => {
  console.log({ err });
});
