# Email-Signature-Generator
We design email signatures at SodiumHalogen.com, this snippet helps our clients make HTML email signatures for their teams.

![](http://sodiumhalogen.com/up_c/Screen%20Shot%202017-04-02%20at%2010.35.39%20PM-rEzHZTjwo6.png)

##Dev setup
- `npm install`
- start by editing the `code.html` to design the email signature (see data javascript variables in file: `${first}`,`${last}`,`${companyName}`).
- change server path variable in `assets/js/variables.js`
- set form fields need and data retrival of fields in `assets/js/variables.js`
- run `gulp` to inline styles and create `/dist` folder.
- view `index.html` to see form and test signature
- for fast testing, use `index.html?test=1` in `assets/js/main.js` to view signature without filling out form each time

## Todos
- [ ] better erroring of generator form for required fields
- [ ] setup this app as a plugin that can be built around
- [ ] look at [Inky + Foundations](https://foundation.zurb.com/emails/docs/) for email templates
- [ ] add [Juice](https://github.com/Automattic/juice) instead of gulp inliner, maybe??

## Tech details
- Uses ZeroClipboard for copying the HTML render to the user's clipboard.

## Update Releases
Update 04/2017: video coming soon... [screenshot](http://sodiumhalogen.com/up_c/Screen%20Shot%202017-04-02%20at%2010.35.39%20PM-rEzHZTjwo6.png)

- adds select field for staff photos
- ES6 inline variables in email template `code.html` Yay!!!!

Update 11/2016: [video update](http://sodiumhalogen.com/up_c/updates-email-sig-gen-2016_s-9fP8STTXWi.mp4)