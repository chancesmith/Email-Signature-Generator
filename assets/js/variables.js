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

  $.ajax({
    url:"inline-code.html",  
    success:function(data) {

      signature = convertStringToTemplate(data, first, last, creds, title, phone, cell);

      // show the results && pass the first name for file download
      presentSignature(first, signature);
    }
  });
}