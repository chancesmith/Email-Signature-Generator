# Email-Signature-Generator
We design email signatures at SodiumHalogen.com, this snippet helps our clients make HTML email signatures for their teams.

![](http://sodiumhalogen.com/up_c/Screen%20Shot%202017-04-02%20at%2010.35.39%20PM-rEzHZTjwo6.png)

##Dev setup
- `npm install`
- start by editing the `code.html` to design the email signature (see data javascript variables in file: `${first}`,`${last}`,`${companyName}`).
- run `gulp` to inoine styles and create `/dist` folder.

## Todos
[ ] better erroring of generator form for required fields
[ ] setup this app as a plugin that can be built around

## Tech details
- Uses ZeroClipboard for copying the HTML render to the user's clipboard.

## Update Releases
Update 04/2017: video coming soon... [screenshot](http://sodiumhalogen.com/up_c/Screen%20Shot%202017-04-02%20at%2010.35.39%20PM-rEzHZTjwo6.png)

- adds select field for staff photos
- ES6 inline variables in email template `code.html` Yay!!!!

Update 11/2016: [video update](http://sodiumhalogen.com/up_c/updates-email-sig-gen-2016_s-9fP8STTXWi.mp4)