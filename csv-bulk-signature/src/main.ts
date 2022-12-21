// setup Typescript for node (change required to import)
// get csv

const fs = require("fs"); // comes with NODE
const csv = require("csv-parser"); // install me
const handlebars = require("handlebars"); // install me
const zlib = require("zlib"); // install me

// TODO: add counter let - Chance Smith 12/20/2022

fs.createReadStream("contacts.csv")
  .pipe(csv())
  .on("data", (row) => {
    // Process the row
    const fullName = row.fullName; // or row['Calendly Link']
    const phone = row.phone;
    const company = row.company; // TODO: match company-id with image url (Hosted at ATAT or SH S3) - Chance Smith 12/20/2022

    // Read the HTML template
    fs.readFile("template.html", "utf8", (err, data) => {
      if (err) throw err;

      // Compile the template
      const template = handlebars.compile(data);

      // Render the template with the data from the row
      const html = template({ fullName: fullName, phone: phone });

      // Write the rendered HTML to a new file
      fs.writeFile(`dist/${fullName}.html`, html, (err) => {
        if (err) throw err;
        // TODO: add counter + 1
      });
    });
  })
  .on("end", () => {
    // TODO: if all succfully written: log out the counter
    console.log("All rows processed");
  });

// TODO: zip up all html files in dist/ folder

// Create a zip file
const zip = zlib.createGzip();

// Create a write stream for the zip file
const zipWriteStream = fs.createWriteStream("signature-templates.zip");

// Pipe the zip file through the write stream
zip.pipe(zipWriteStream);

// Add all the HTML files to the zip file
fs.readdirSync("dist").forEach((file) => {
  zip.append(fs.createReadStream(`dist/${file}`), { name: file });
});

// Close the zip file
zip.finalize();

console.log("HTML files zipped");
