import fs from "fs";
import csv from "csv-parser";
import inlineCss from "inline-css";

// inputs
const CSV_FILE = "./src/contacts.csv";
const TEMPLATE = "./src/generated__email-sig-template-inline.html";

const LOGOS = {
  "ata-cpa-advisors":
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATA_LOGO-CPAAdvisor-BT-RGB.png",
  atac: "https://temp-ata-signature-assets.s3.amazonaws.com/ATAC_LOGO-BT-RGB.png",
  ataes:
    "https://temp-ata-signature-assets.s3.amazonaws.com/ATAES_LOGO-BT-RGB.png",
} as const;

interface Contact {
  "Brand*": keyof typeof LOGOS;
}

fs.createReadStream(CSV_FILE)
  .pipe(csv())
  .on("data", (row: Contact) => {
    const logoId = row["Brand*"];
    const logoUrl = LOGOS[logoId];
    // gets rest of fields from each row
    // 'Full Name*': 'Diane Willingham',
    // Credentials: '',
    // 'Title*': 'Senior Bookkeeper',
    // 'Office Phone*': '270.827.1577',
    // 'Mobile Phone': '',
    // 'Calendly Link': ''

    //
  });

fs.readFile(
  "./src/email-sig-template.html",
  "utf8",
  async (err, og_template) => {
    if (err) throw err;

    const inlinedTemplate = await inlineCss(og_template, {
      url: "./",
      removeHtmlSelectors: true,
    }); // need to reference the style.css ???

    console.log({ inlinedTemplate });

    // Compile the template
    // template = handlebars.compile(inlinedTemplate);
  }
);
