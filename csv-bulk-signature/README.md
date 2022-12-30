# Bulk Email Signature Generator

Process a CSV file to build/download multiple email signatures to local computer in one step.

Styled .htm signature files contacts are created from a template, consolidated in a `/dist` directory, and zipped up for download.

## Steps to run the script

1. place a list of contacts into a `contacts.csv` file and place that file in `/src` directory
2. in this folder run: `yarn` and then ` yarn bulk` or if you are developing, `y bulk:watch`
3. expect to see a `./dist/signatures` folder created that contains all of the successfully processed signatures
4. all of the processed signature files and a `_statusReport.txt` file will be zipped up into a `/dist/signatures-[DATE/TIME].zip` file

## Notes

1. signature formatting may slightly vary based on the email client that you are using.
2. contacts in the `/dist/signatures` folder are not automatically deleted when running the script, but are overwritten if a duplicate contact is processed
