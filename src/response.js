function onFormSubmit(event) {
  res = []

  var form = FormApp.openById('1sJS6XpvQYBOhSNZOd9AXIyOywGnUNWkd7nyhZWUzXLY');
  var formResponses = form.getResponses();
  var formCount = formResponses.length;

  var formResponse = formResponses[formCount - 1];
  var itemResponses = formResponse.getItemResponses();

  for (var i = 0; i < itemResponses.length; i++){
    var itemResponse = itemResponses[i];
    var question = itemResponse.getItem().getTitle();
    var response = itemResponse.getResponse();

    Logger.log(question);
    Logger.log(response);

    res.push(response)
  }
  AddOrder(res[0], res[1], res[2], res[3], res[4], res[5], res[6], res[7], res[8])
}

function AddOrder(email, fn, ln, tYS, tGT, tGL, jYS, jGT, jGL) {
  var url = 'https://docs.google.com/spreadsheets/d/1wZbVip75JMmuMhu1oStP0MdsBknAZ9qfJx46ZHjER3E/edit#gid=962403957';
  var ss = SpreadsheetApp.openByUrl(url)
  var dataSheet = ss.getSheetByName("FormResponse")
  dataSheet.appendRow([email, new Date(), fn, ln, tYS, tGT, tGL, jYS, jGT, jGL])
}

function SendEmail() {
  
}

function DecrementStock(){
  var url = 'https://docs.google.com/spreadsheets/d/1wZbVip75JMmuMhu1oStP0MdsBknAZ9qfJx46ZHjER3E/edit#gid=962403957';
  var ss = SpreadsheetApp.openByUrl(url)
  var dataSheet = ss.getSheetByName("StockSheet")
}
