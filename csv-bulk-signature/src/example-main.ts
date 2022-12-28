// setup Typescript for node (change required to import)
// get csv

import fs from "fs";
import handlebars from "handlebars";
import inlineCss from "inline-css";
import csv from "csv-parser";
import zlib from "zlib";

// TODO: add counter let - Chance Smith 12/20/2022

// Read the HTML template
let template;
fs.readFile("template.html", "utf8", (err, og_template) => {
  if (err) throw err;

  const inlinedTemplate = inlineCss(og_template, {}); // need to reference the style.css ???

  console.log({ inlinedTemplate });

  // Compile the template
  // template = handlebars.compile(inlinedTemplate);
});

fs.createReadStream("contacts.csv")
  .pipe(csv())
  .on("data", (row) => {
    // Process the row
    const fullName = row.fullName; // or row['Calendly Link']
    const phone = row.phone;
    const company = row.company; // TODO: match company-id with image url (Hosted at ATAT or SH S3) - Chance Smith 12/20/2022

    // ! const hasRequiredData = checkRequredFields(row) // each field is not empty
    // ! if(!hasRequiredData) return; // skip this row
    // ! const {logo, name, phone} = getRowData(row)
    // ! ...clean up data (trim, remove space)

    // Render the template with the data from the row
    const html = template({ fullName: fullName, phone: phone });

    // Write the rendered HTML to a new file
    fs.writeFile(`dist/${fullName}.html`, html, (err) => {
      if (err) throw err;
      // TODO: add counter + 1
    });
  })
  .on("end", () => {
    // TODO: if all succfully written: log out the counter
    console.log("All rows processed");

    // TODO: zip up all html files in dist/ folder
    // Create a zip file
    const zip = zlib.createGzip();

    // Create a write stream for the zip file
    const zipWriteStream = fs.createWriteStream("signature-templates.zip");

    // Pipe the zip file through the write stream
    zip.pipe(zipWriteStream);

    // Add all the HTML files to the zip file
    // fs.readdirSync("dist").forEach((file) => {
    //   zip.append(fs.createReadStream(`dist/${file}`), { name: file });
    // });

    // Close the zip file
    // zip.finalize();

    console.log("HTML files zipped");
  });
