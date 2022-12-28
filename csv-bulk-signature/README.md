# Bulk Email Signature Generator

Process CSV file to build/download multiple email signatures to local computer at once.

You'll need to clone and add CSV to src/ then run gulp and look inside dist/index.html to export a ton of signatures. :)

![bulk-email-signature-generator](http://sodiumhalogen.com/up_c/bulk-download-Ta6vxKqPf6.gif)

## steps to run the script

1. get a list of contacts into a `src/contacts.csv`
2. in this folder run: `yarn` and then ` yarn bulk` or if you are developing `y bulk:watch`
3. expect to see a `./dist/signatures` folder show all the signatures
4. expect to see a `./dist/signature-DATE.zip` that holds a `_statusReport.txt` and every email signature.
