/* Executes upon form submit */
function onFormSubmit(event) {
  res = []

  var form = FormApp.openById('1sJS6XpvQYBOhSNZOd9AXIyOywGnUNWkd7nyhZWUzXLY');
  var formResponses = form.getResponses();
  var formCount = formResponses.length;

  var formResponse = formResponses[formCount - 1];
  var itemResponses = formResponse.getItemResponses();
  var emailBody = "Here is your order summary:\n\n";

  for (var i = 0; i < itemResponses.length; i++){
    var itemResponse = itemResponses[i];
    var question = itemResponse.getItem().getTitle();
    var response = itemResponse.getResponse();
    if(response != ""){
      emailBody += question + "\n" + response + "\n\n";

      Logger.log(question)
      Logger.log(response)
    }

    res.push(response)
  }
  
  emailBody += "Your total amount is: \n\n" + "$" + GetCost(res[3], res[4], res[5], res[6], res[7], res[8])

  Logger.log(emailBody)

  AddOrder(res[0], res[1], res[2], res[3], res[4], res[5], res[6], res[7], res[8])
  SendEmail(res[0], emailBody)
}

/* Adds user response from form to spreadsheet */
function AddOrder(email, fn, ln, tYS, tGT, tGL, jYS, jGT, jGL) {
  var url = 'https://docs.google.com/spreadsheets/d/1wZbVip75JMmuMhu1oStP0MdsBknAZ9qfJx46ZHjER3E/edit#gid=962403957';
  var ss = SpreadsheetApp.openByUrl(url)
  var dataSheet = ss.getSheetByName("FormResponse")
  var totalCost = GetCost(tYS, tGT, tGL, jYS, jGT, jGL)
  dataSheet.appendRow([email, new Date(), fn, ln, tYS, tGT, tGL, jYS, jGT, jGL, totalCost, "No"])
}

/* Gets total order cost */
function GetCost(tYS, tGT, tGL, jYS, jGT, jGL){
  return (tYS + tGT + tGL) * 19.99 + (jYS + jGT + jGL) * 49.99;
}

function SendEmail(email, emailBody) {
  MailApp.sendEmail({
    to: email,
    subject: "Thank you for your response - Online Clothing Shop",
    body: emailBody,
  });
}

/* Decrement Stock of item ONLY if payment succeeds */
function DecrementStock(){
  var url = 'https://docs.google.com/spreadsheets/d/1wZbVip75JMmuMhu1oStP0MdsBknAZ9qfJx46ZHjER3E/edit#gid=962403957';
  var ss = SpreadsheetApp.openByUrl(url)
  var dataSheet = ss.getSheetByName("StockSheet")
}