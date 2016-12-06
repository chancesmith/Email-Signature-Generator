# Email-Signature-Generator
We design email signatures at SodiumHalogen.com, this snippet helps our clients make HTML email signatures for their teams.

Uses ZeroClipboard for copying the HTML render to the user's clipboard.

Update 11/2016: [video update](http://sodiumhalogen.com/up_c/updates-email-sig-gen-2016_s-9fP8STTXWi.mp4)

##Dev setup
- npm install
- gulp
- start by editing the `code.html` to design the email signature
- (optional) instead of writing inline styles >> write css and run the [css inline from Mailchimp](http://templates.mailchimp.com/resources/inline-css/)
- copy and divide the `code.html` into the variables of the javascript inside `variables.js`
- in variables.js look for `***` for areas to edit
