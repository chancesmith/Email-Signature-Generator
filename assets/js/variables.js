//// Global vars
// setup vars ***
var companyName = 'Dromygosh Agency';
var companyInitals = 'DMG';
var tutorialVideoLink = "#"; // custom video tutorial link
// defaults
var first, signature;

$(document).ready(function() {
  // update company name
  $('#company-name').text(companyName);
  // update tutorial link
  $('#tutorialVideo a').attr('href', tutorialVideoLink);

  // setup ZeroClipboard
  var client = new ZeroClipboard($('#copy-button'), {
      moviePath : 'util/assets/js/vendor/ZeroClipboard.swf'
  });

  // add text fields ***
  createTextField("First Name*", "first", "John");
  createTextField("Last Name", "last", "Smith");
  createTextField("Credentials", "creds", "Ph.D");
  createTextField("Position/Title", "title", "Director of Awesomeness");
  createTextField("Phone*", "phone", "901.555.5555");
  createTextField("Cell Phone", "cell", "901.222.2222");

});

// on submit button click
function buidSignature() {
  showControls(true);

  //Get the value of input field with id="INPUT-FIELD-ID"
  first = document.getElementById("first").value;
  var last = document.getElementById("last").value;
  var creds = document.getElementById("creds").value;
  if(creds !== '') creds = ', ' + creds;
  var title = document.getElementById("title").value;
  var phone = formatPhoneNumber( document.getElementById("phone").value );
  var cell = document.getElementById("cell").value;
  if(cell !== '')formatPhoneNumber(cell);

  // divided signature ***
  var sigNameCreds = '<meta name="format-detection" content="telephone=no"><br><table width="320" id="sig" cellspacing="0" cellpadding="0" border-spacing="0" style="margin:0;padding:0;"><tr><td width="100" style="width:86px;margin:0;padding-right:9px;"><a href="http://www.atacpa.net/"><img border="0" width="100" height="100" src="http://atacpa.net/signature/assets/images/ata-logo.jpg"></a></td><td width="10" style="width:5px;">&nbsp;</td><td valign="top" style="margin:0;padding:0;padding-top:10px;"><table id="sig2" cellspacing="0" cellpadding="0" border-spacing="0" style="line-height: 1.4em;border:none;text-decoration:none;padding:0;margin:0;font-family:helvetica,arial,sans-serif;font-size:12px;color:#b0b0b0;border-collapse:collapse;-webkit-text-size-adjust:none;"><tr style="margin:0;padding:0;"><td style="margin:0;padding:0;font-family:helvetica,arial,sans-serif;white-space:nowrap;"><b><span style="font-size:11.0pt;color:#00AEEA;">'+ first + ' ' + last +'</span></b><span style="font-size:11.0pt;color:#919191;">'+ creds +'</span></td></tr>';
  var sigTitle = '<tr style="margin:0;padding:0;"><td style="margin:0;padding:0;font-family:helvetica,arial,sans-serif;white-space:nowrap;"><span style="font-size:10.0pt;color:#919191;">'+ title +'</span></td></tr>';
  var sigPhone = '<tr style="margin:0;padding:0;color:#b0a49b;"><td style="margin:0;padding:0;white-space:nowrap;"><span style="font-size:10.0pt;color:#00AEEA;">P&nbsp;</span><a href="tel:'+ phone +'" target="_blank" style="border:none;text-decoration:none;"><span style="border:none;font-size:10.0pt;color:#919191;text-decoration:none;">'+ phone +'</a></td></tr>';
  var sigCell = '<tr style="margin:0;padding:0;color:#b0a49b;"><td style="margin:0;padding:0;white-space:nowrap;"><span style="font-size:10.0pt;color:#00AEEA;">C&nbsp;</span><a href="tel:'+ cell +'" target="_blank" style="border:none;text-decoration:none;"><span style="border:none;font-size:10.0pt;color:#919191;text-decoration:none;">'+ cell +'</a></td></tr>';
  var sigEnding = '<tr style="margin:0;padding:0;color:#b0a49b;"><td style="margin:0;padding:0;white-space:nowrap;"><span style="font-size:10.0pt;color:#919191;">Alexander Thompson Arnold PLLC</span></td></tr><tr style="margin:0;padding:0;color:#b0a49b;"><td style="margin:0;padding:0;white-space:nowrap;"><a href="http://www.atacpa.net/" target="_blank" style="border:none;text-decoration:none;"><span style="font-size:10.0pt;color:#919191;text-decoration:none;">www.atacpa.net</span></a></span></td></tr></table></td></tr></table><br>';

  // concat parts of signature together
  signature = sigNameCreds + sigTitle + sigPhone + sigCell + sigEnding;

  // show the results && pass the first name for file download
  presentSignature(first);
}