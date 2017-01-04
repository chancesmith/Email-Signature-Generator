# Email-Signature-Generator
We design email signatures at SodiumHalogen.com, this snippet helps our clients make HTML email signatures for their teams.

Uses ZeroClipboard for copying the HTML render to the user's clipboard.

Update 11/2016: [video update](http://sodiumhalogen.com/up_c/updates-email-sig-gen-2016_s-9fP8STTXWi.mp4)

##Dev setup
- start by editing the `code.html` to design the email signature and test with `localhost:8888/?test=design`
- (optional step 1) instead of writing inline styles >> write css and run the [css inline from Mailchimp](http://templates.mailchimp.com/resources/inline-css/)
- (optional step 2) paste inline export into `inline-code.html` 
- copy and divide the `code.html` into the variables of the javascript inside `variables.js`
- in variables.js look for `***` for areas to edit

##Todos
[ ]add [Juice](https://github.com/Automattic/juice) instead of gulp inliner, maybe??
