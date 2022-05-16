/* Executes upon form submit */
function onFormSubmit(event) {
  // Results to store answers
  res = []

  var form = FormApp.openById('1sJS6XpvQYBOhSNZOd9AXIyOywGnUNWkd7nyhZWUzXLY');
  var formResponses = form.getResponses();
  var formCount = formResponses.length;

  var formResponse = formResponses[formCount - 1];
  var itemResponses = formResponse.getItemResponses();
  var emailBody = "Here is your order summary:\n\n";

  // For each form get question and responses for the user
  for (var i = 0; i < itemResponses.length; i++){
    var itemResponse = itemResponses[i];
    var question = itemResponse.getItem().getTitle();
    var response = itemResponse.getResponse();
    // Remove empty responses and Credit card information from email body
    if(response != "" && question != "Credit Card Number" && question != "Exp. Month" && question != "Exp. Year" && question != "CVC"){
      emailBody += question + "\n" + response + "\n\n";

      //Logger.log(question)
      //Logger.log(response)
    }

    res.push(response)
  }
  // Sets initial Paid value in sheets to "No"
  res.push("No")
  
  // Put total purchase sum to email body
  totalSum = GetCost(res[3], res[4], res[5], res[6], res[7], res[8])
  emailBody += "Your total amount is: \n\n" + "$" + totalSum + '\n\n'

  Logger.log(totalSum)

  // Calls addOrder function which adds the res array into the Google Sheets
  AddOrder(res[0], res[1], res[2], res[3], res[4], res[5], res[6], res[7], res[8], totalSum, res[9], res[10], res[11], res[12], res[13])

  var paymentLink = JSON.parse(StripePayment(totalSum))
  Logger.log(`${paymentLink["id"]}`)

  emailBody += "The payment link is: " + `${paymentLink["url"]}`
  SendEmail(res[0], emailBody)

  var paymentInfo = JSON.parse(GetStripeResponse(`${paymentLink["id"]}`))
  Logger.log(GetStripeResponse(`${paymentLink["id"]}`).getContentText())

  var paymentIntent = JSON.parse(GetPaymentIntent(`${paymentInfo["payment_intent"]}`))
  Logger.log(GetPaymentIntent(`${paymentInfo["payment_intent"]}`).getContentText())

  // If Payment succeeds, change paid to Yes, send email, and decrement stock, else send email saying transaction failed
  if (`${paymentIntent["status"]}` === "succeeded"){
    OrderPaid()
    SendEmail(res[0], "Thank you for your purchase")
    DecrementStock(res[3], res[4], res[5], res[6], res[7], res[8])
    Logger.log("In this loop")
  }else{
    SendEmail(res[0], "Transaction failed")
    Logger.log("In that loop")
  }
}

/* Adds user response from form to spreadsheet */
function AddOrder(email, fn, ln, tYS, tGT, tGL, jYS, jGT, jGL, totalSum, ccn, month, year, cvc, paid) {
  var url = 'https://docs.google.com/spreadsheets/d/1wZbVip75JMmuMhu1oStP0MdsBknAZ9qfJx46ZHjER3E/edit#gid=962403957';
  var ss = SpreadsheetApp.openByUrl(url)
  var dataSheet = ss.getSheetByName("FormResponse")

  // Add values from parameters (aka res array in onFormSubmit())
  dataSheet.appendRow([email, new Date(), fn, ln, tYS, tGT, tGL, jYS, jGT, jGL, totalSum, ccn, month, year, cvc, paid])
}

/* Gets total order cost */
function GetCost(tYS, tGT, tGL, jYS, jGT, jGL){
  // Gets total T-shirt * 19.99 + total jacket * 49.99; Need to use parseInt to prevent possible non int value being appended
  tYS = tYS === null ? 0 : tYS;
  tGT = tGT === null ? 0 : tGT;
  tGL = tGL === null ? 0 : tGL;
  jYS = jYS === null ? 0 : jYS;
  jGT = jGT === null ? 0 : jGT;
  jGL = jGL === null ? 0 : jGL;

  return (tYS + tGT + tGL) * 19.99 + (jYS + jGT + jGL) * 49.99
}

/* Changes paid from No to Yes; called after transaction returns 200 OK */
function OrderPaid(){
  var url = 'https://docs.google.com/spreadsheets/d/1wZbVip75JMmuMhu1oStP0MdsBknAZ9qfJx46ZHjER3E/edit#gid=962403957';
  var ss = SpreadsheetApp.openByUrl(url)
  var dataSheet = ss.getSheetByName("FormResponse")

  // Set last order with "Yes" to determine order payment has been fufilled
  dataSheet.getRange(dataSheet.getLastRow(), 16, 1, 1).setValue("Yes");
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
/* Test Payment Link: https://buy.stripe.com/test_8wM29n33T4q51JC7ss */
function StripePayment(amount){
  var url = "https://api.stripe.com/v1/checkout/sessions";
  
  const paymentLoad = {
    "payment_method_types[0]": "card",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][product_data][name]": "Online Clothes",
    "line_items[0][price_data][unit_amount]": String(parseInt(amount) * 100),
    "line_items[0][quantity]": String(1),
    "mode": "payment",
    "success_url": "https://example.com/success?session_id={CHECKOUT_SESSION_ID}",
    "cancel_url": "https://example.com/cancel",
  }

  var params = {
    method: "post",
    headers: {
      Authorization:
        "Basic " + Utilities.base64Encode(process.env.SECRET_KEY),
    },
    payload: paymentLoad,
  };
  var res = UrlFetchApp.fetch(url, params);
  return res
}

/* Get Stripe Session created with function StripePayment using session ID */
function GetStripeResponse(session_id){
  var url = "https://api.stripe.com/v1/checkout/sessions/" + session_id;
 
  var params = {
  method: "get",
  headers: {
    Authorization:
      "Basic " + Utilities.base64Encode(process.env.SECRET_KEY),
  },
};
  var res = UrlFetchApp.fetch(url, params);
  return res
}

/* Get Payment Intent given payment intent ID: Can be used to see card errors during transaction */
function GetPaymentIntent(paymentIntent){
  var url = "https://api.stripe.com/v1/payment_intents/" + paymentIntent;
 
  var params = {
  method: "get",
  headers: {
    Authorization:
      "Basic " + Utilities.base64Encode(process.env.SECRET_KEY),
  },
};
  var res = UrlFetchApp.fetch(url, params);
  return res
}

/* Decrement Stock of item ONLY if payment succeeds */
function DecrementStock(tYS, tGT, tGL, jYS, jGT, jGL){
  var url = 'https://docs.google.com/spreadsheets/d/1wZbVip75JMmuMhu1oStP0MdsBknAZ9qfJx46ZHjER3E/edit#gid=962403957';
  var ss = SpreadsheetApp.openByUrl(url)
  var dataSheet = ss.getSheetByName("StockSheet");

  // Get values of original store inventory
  var yellowT = dataSheet.getRange("C2").getValues();
  var tetonT = dataSheet.getRange("C3").getValues();
  var glacierT = dataSheet.getRange("C4").getValues();
  var yellowJ = dataSheet.getRange("C5").getValues();
  var tetonJ = dataSheet.getRange("C6").getValues();
  var glacierJ = dataSheet.getRange("C7").getValues();

  // Check if stock is already lower than the purchased amount
  if(yellowT - tYS < 0 || tetonT - tGT < 0 || glacierT - tGL < 0 || yellowJ  - jYS < 0 || tetonJ - jGT < 0 || glacierJ - jGL < 0){
    Logger.log("Inventory Out of Stock")
  }else{
    // Decrement each item by purchased amounts
    dataSheet.getRange("C2").setValue(yellowT - tYS);
    dataSheet.getRange("C3").setValue(tetonT - tGT);
    dataSheet.getRange("C4").setValue(glacierT - tGL);
    dataSheet.getRange("C5").setValue(yellowJ  - jYS);
    dataSheet.getRange("C6").setValue(tetonJ - jGT);
    dataSheet.getRange("C7").setValue(glacierJ - jGL);
  }
}