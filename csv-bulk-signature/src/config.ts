/*
 * GLOBALS
 */
export const CSV_FILE = "./src/contacts.csv";
export const CSV_EXPIRATION_DAYS = 1;
export const TEMPLATE_FILE = "./src/email-sig-template.html";
export const SIGNATURES_PATH = "./dist/signatures";
export const ZIP_FILE = `${SIGNATURES_PATH}-${
  new Date().toISOString().split(":").join("_").split(".")[0] // date and time
}.zip`;
export const STATUS_REPORT_FILE = `${SIGNATURES_PATH}/_statusReport.txt`;
export const LOGOS = {
  "ata-cpa-advisors":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATA_LOGO-CPAAdvisor-BT-RGB.png",
  "ata-capital":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATAC_LOGO-BT-RGB.png",
  "ata-employment-solutions":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATAES_LOGO-BT-RGB.png",
} as const;
