import { parse } from "csv-parse";
import fs from "fs/promises";
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
  isPath,
} from "./safety-checks";
import { TemplateData, Contact } from "./types";

/*
 * MAIN FUNCTIONS
 */
async function setupFolders() {
  await createDirIfMissing("./dist");
  await createDirIfMissing("./dist/signatures");
  await deleteOldSignatures();
}

async function createDirIfMissing(path: string) {
  if (!(await isPath(path))) {
    await fs.mkdir(path);
  }
}

async function deleteOldSignatures() {
  const signaturesFolder = await fs.readdir(SIGNATURES_PATH);
  if (signaturesFolder.length > 0) {
    let count = 0;
    for await (const file of signaturesFolder) {
      await fs.unlink(`${SIGNATURES_PATH}/${file}`);

      count++;
    }

    console.log(`🗑️  CLEAN UP: Deleted ${count} old signatures`);
  }
}

async function setupTemplate() {
  const templateFile = await fs.readFile(TEMPLATE_FILE, "utf8");

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
  console.log("📝 Generating signatures...");
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

    const fileName = getFileName(contact);
    await createSignatureFile(fileName, contact, html);
  }

  console.log("👍 Signatures generated");
}

async function createSignatureFile(
  fileName: string,
  contact: Contact,
  html: string
) {
  const { fullNameFileName, fullName } = getFullNameFileName(contact);
  const filePath = `${SIGNATURES_PATH}/${fileName}.htm`;
  const fullNameFilePath = `${SIGNATURES_PATH}/${fullNameFileName}.htm`;

  // check if files exists
  const hasFilePath = await isPath(filePath);
  const hasFullNameFile = await isPath(fullNameFilePath);

  if (!hasFilePath) {
    return createFile(filePath, html);
  }

  if (!hasFullNameFile) {
    return createFileWithFullName(fullNameFilePath, fullName, fileName, html);
  }

  console.error(
    `  🔴 ERROR: For ${fullName}, ${fileName}.htm and ${fullNameFileName}.htm already exist.`
  );
}

async function createFile(filePath: string, html: string) {
  await fs.writeFile(filePath, html);
}

async function createFileWithFullName(
  fullNameFilePath: string,
  fullName: string,
  fileName: string,
  html: string
) {
  await createFile(fullNameFilePath, html);
  console.error(
    `  🟡 WARNING: For ${fullName}, ${fileName}.htm already exists. Instead ${fileName}.htm was created.`
  );
}

export function getFullNameFileName(contact: Contact) {
  const fullName = contact["Full Name*"];
  const lowercaseFullName = fullName.toLowerCase();
  const fullNameFileName = lowercaseFullName.replace(/\s/g, "_");
  return { fullNameFileName, fullName };
}

export function getFileName(contact: Contact) {
  const nameSplit = contact["Full Name*"].split(" ");
  const firstInitial = nameSplit[0].charAt(0);

  // if has middle name, join the rest of the name
  const hasMiddleName = contact["Full Name*"].split(" ").length > 2;
  const lastName = hasMiddleName ? nameSplit.slice(1).join("") : nameSplit[1];

  const fileName = `${firstInitial}${lastName}`;
  const lowerCaseFullName = fileName.toLowerCase();
  return lowerCaseFullName;
}

export async function createZipFile(files: string[]) {
  const zip = new jszip();

  for await (const file of files) {
    const filePath = `${SIGNATURES_PATH}/${file}`;
    const fileContents = await fs.readFile(filePath);
    zip.file(file, fileContents);
  }

  return zip.generateAsync({ type: "nodebuffer" });
}

export async function zipUpFiles(files: string[]) {
  try {
    const buffer = await createZipFile(files);
    await fs.writeFile(ZIP_FILE, buffer);

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
  await fs.writeFile(STATUS_REPORT_FILE, combinedStatus.join("\n"));

  console.log("👍 Report created");
}

async function getCSVRows(path: string) {
  return new Promise(async (resolve: (arg: Contact[]) => void) => {
    const file = await fs.readFile(path);

    parse(file, { columns: true }, function (err, rows) {
      resolve(rows as Contact[]);
    });
  });
}

function skipFirstPlaceholderRow(contact: Contact) {
  // @ts-ignore - a hack to skip the first row
  return contact["Brand*"] !== "use dropdown to select a brand";
}

export function filterFilesForZip(file: string) {
  return file.endsWith(".htm") || file.endsWith(".txt");
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

  const checkRequiredFields = (row: Contact) =>
    !!row["Brand*"].length &&
    !!row["Full Name*"].length &&
    !!row["Title*"].length &&
    !!row["Office Phone*"].length;

  const contactsWithNewProps = contacts
    .filter(skipFirstPlaceholderRow)
    .map((contact) => ({ ...contact, skip: !checkRequiredFields(contact) }));

  // 4. generate signatures
  await generateSignatures(template, contactsWithNewProps);
  await checkFileCountWithCsvCount(contactsWithNewProps);

  // 5. create report
  await createStatusReport(contactsWithNewProps);

  // 6. gather files for zip
  const signatureFolder = await fs.readdir(SIGNATURES_PATH);
  const files = signatureFolder.filter(filterFilesForZip);

  // 7. zip up files
  await zipUpFiles(files);
  await checkZipIsNotEmpty(ZIP_FILE);
}

main().catch((err) => {
  console.log({ err });
});
