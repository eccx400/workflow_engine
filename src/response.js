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
    if(response != "" && question != "Credit Card Number" && question != "Exp. Month" && question != "Exp. Year" && question != "CVC"){
      emailBody += question + "\n" + response + "\n\n";

      Logger.log(question)
      Logger.log(response)
    }

    res.push(response)
  }
  
  totalSum = GetCost(res[3], res[4], res[5], res[6], res[7], res[8])
  emailBody += "Your total amount is: \n\n" + "$" + totalSum

  Logger.log(emailBody)

  //AddOrder(res[0], res[1], res[2], res[3], res[4], res[5], res[6], res[7], res[8], totalSum, res[9], res[10], res[11], res[12])
  //SendEmail(res[0], emailBody)

  DecrementStock(res[3], res[4], res[5], res[6], res[7], res[8])

  /*
  //TODO
  StripePayment
  if (paymentSuccess && Stock != 0){
    Update res[10] = paid
    SendEmail(res[0], emailBody)
    DecrementStock()
  }else{
    SendEmail(res[0], "Transaction failed")
  }
  */
}

/* Adds user response from form to spreadsheet */
function AddOrder(email, fn, ln, tYS, tGT, tGL, jYS, jGT, jGL, totalSum, ccn, month, year, cvc) {
  var url = 'https://docs.google.com/spreadsheets/d/1wZbVip75JMmuMhu1oStP0MdsBknAZ9qfJx46ZHjER3E/edit#gid=962403957';
  var ss = SpreadsheetApp.openByUrl(url)
  var dataSheet = ss.getSheetByName("FormResponse")
  dataSheet.appendRow([email, new Date(), fn, ln, tYS, tGT, tGL, jYS, jGT, jGL, totalSum, ccn, month, year, cvc,"No"])
}

/* Gets total order cost */
function GetCost(tYS, tGT, tGL, jYS, jGT, jGL){
  return (tYS + tGT + tGL) * 19.99 + (jYS + jGT + jGL) * 49.99;
}

/* Sends email to recipent with order summary*/
function SendEmail(email, emailBody) {
  MailApp.sendEmail({
    to: email,
    subject: "Thank you for your response - Online Clothing Shop",
    body: emailBody,
  });
}

/* Proceed with payment option using Stripe API */
function StripePayment(ccn, month, year, cvc){
  var url = "https://api.stripe.com/v1/products";
  var params = {
    method: "post",
    headers: {Authorization: "Basic " + Utilities.base64Encode("sk_test_4eC39HqLyjWDarjtT1zdp7dc:")},
    payload: {name: "My SaaS Platform", type: "service"}
  };
  var res = UrlFetchApp.fetch(url, params);
  Logger.log(res.getContentText())
}

/* Decrement Stock of item ONLY if payment succeeds */
function DecrementStock(tYS, tGT, tGL, jYS, jGT, jGL){
  var url = 'https://docs.google.com/spreadsheets/d/1wZbVip75JMmuMhu1oStP0MdsBknAZ9qfJx46ZHjER3E/edit#gid=962403957';
  var ss = SpreadsheetApp.openByUrl(url)
  var dataSheet = ss.getSheetByName("StockSheet");
  var yellowT = dataSheet.getRange("C2").getValues();
  dataSheet.getRange("C2").setValue(yellowT - tYS);
  var tetonT = dataSheet.getRange("C3").getValues();
  dataSheet.getRange("C3").setValue(tetonT - tGT);
  var glacierT = dataSheet.getRange("C4").getValues();
  dataSheet.getRange("C4").setValue(glacierT - tGL);
  var yellowJ = dataSheet.getRange("C5").getValues();
  dataSheet.getRange("C5").setValue(yellowJ  - jYS);
  var tetonJ = dataSheet.getRange("C6").getValues();
  dataSheet.getRange("C6").setValue(tetonJ - jGT);
  var glacierJ = dataSheet.getRange("C7").getValues();
  dataSheet.getRange("C7").setValue(glacierJ - jGL);
}