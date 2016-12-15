function showControls(flag){
  if(flag){
    $( ".copy-me" ).show();
    $( "#directions" ).show();
    $( "#copy-button" ).show();
    $( "#download-file-button" ).show();
  }
  else {
    $( ".copy-me" ).hide();
    $( "#directions" ).hide();
    $( "#copy-button" ).hide();
    $( "#download-file-button" ).hide();
  }
}

showControls(false);

function presentSignature(fName, signature){
  console.log('yup, presented');
  // show user the the results
  document.getElementById("demo").innerHTML=signature;
  //suggest to the user to edit or make another
  document.getElementById("build-button").innerHTML = "Update";
  // add signature to hidden input field
  $('#zc-input').val(signature);
  // add HTML to file link
  var fileName = companyInitals + '_' + fName + '.html';
  addSignatureToFile(fileName, signature);
}

function copyToClipboard() {
  // adds HTML to user's clipboard
  var client = new ZeroClipboard($('#copy-button'), {
      moviePath : 'util/ZeroClipboard.swf'
  });
  client.on('dataRequested', function(client, args){
       client.setText(signature);
       document.getElementById("copy-button").innerHTML = "HTML Copied! Copy again?";
  });
  document.getElementById("copy-button").innerHTML = "HTML Copied! Copy again?";
}

function addSignatureToFile(filename, emailSig) {
  // stores HTML into link for file downloading
  var $element = $('a#download-file-button');
  $element.attr('href','data:text/html; charset=utf-8,' + encodeURIComponent(emailSig));
  $element.attr('download', filename);
}

function formatPhoneNumber(number){
  var numberStripped = number.replace(/[^a-zA-Z0-9]/g, '');
  var numberTailored = numberStripped.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, "$1.$2.$3");
  return numberTailored;
}

function getQueryVariable(variable){
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

function convertStringToTemplate(tpl, ...rest){
  console.log('yup, converted template');
  // tpl = tpl.replace(/`/g, ''); // safety precaution
  var t = new Function('return `' + tpl + '`');
  return t(...rest);
}

function loadTemplate(...rest) {
  console.log('yup, loaded template');
  return $.ajax({
    url:"inline-code.html",  
    success:function(data) {
      convertStringToTemplate(data, ...rest);
    }
  });
}

function createTextField(label, id, placeholder){
  // Create new input field
  var newInput = document.createElement("INPUT");
  newInput.id = id;
  newInput.name = id;
  newInput.type = "text";
  newInput.placeholder = placeholder;

  var newlabel = document.createElement("Label");
  newlabel.setAttribute("for",id);
  newlabel.innerHTML = label;

  // create new div.field
  var newDiv = document.createElement("div");
  // add this new field and label to new .field
  newDiv.appendChild(newlabel);
  newDiv.appendChild(newInput);

  // add to #form
  document.getElementById("form").appendChild(newDiv);
  $('#form div').last().addClass('field');
}

//////
// if testing variable exists
//////
if (getQueryVariable("test")) {
  console.log('yup, test is ready');
  showControls(true);

  first = "John";
  last = "Smith";
  creds = "Ph.D";
  title = "Director of Awesomeness";
  phone = "408.555.5555";
  cell = "901.777.7575";

  $.ajax({
    url:"inline-code.html",  
    success:function(data) {

      signature = convertStringToTemplate(data, first, last, creds, title, phone, cell);

      // show the results && pass the first name for file download
      presentSignature(first, signature);
    }
  });
}