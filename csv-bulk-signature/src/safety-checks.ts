import fs from "fs";
import { SIGNATURES_PATH, CSV_FILE, CSV_EXPIRATION_DAYS } from "./config";
import { Contact } from "./types";

export async function checkFileCountWithCsvCount(
  contactsWithNewProps: Contact[]
) {
  // get files in signatures folder
  const signaturesFolder = await fs.promises.readdir(SIGNATURES_PATH);
  const signatures = signaturesFolder.filter((file) => file.endsWith(".htm"));
  const signaturesCount = signatures.length;

  // get contacts count
  const contactsCount = contactsWithNewProps.filter(
    (contact) => !contact.skip
  ).length;

  const isCountSame = signaturesCount === contactsCount;

  if (!isCountSame) {
    console.error(
      `\u001b[31m\u001b[1mError: \u001b[0m\u001b[31mSignatures count does not match contacts count. Please check the contacts.csv file or zipFilePath() and try again.\u001b[0m`
    );
  } else {
    console.log("👍 Signatures count matches CSV count");
  }
}

export async function hasContactsFile() {
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

export async function checkContactsFileCreatedAt() {
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

export async function checkZipIsNotEmpty(zipFilePath: string) {
  const stats = await fs.promises.stat(zipFilePath);
  if (stats.size <= 22) {
    console.error(
      `\u001b[31m\u001b[1mError: \u001b[0m\u001b[31mZip file is empty. Please check the contacts.csv file or zipFilePath() and try again.\u001b[0m`
    );
  }
}

export async function checkHeadersToBeSame(contact: Contact) {
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
