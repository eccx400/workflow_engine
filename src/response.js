function onFormSubmit(event) {
    res = []
  
    var form = FormApp.openById('1mmdK8bcVSkekW4m8miwBDAn0InCnqivhnGzEkGhEoTI');
    var formResponses = form.getResponses();
    var formCount = formResponses.length();
  
    var formResponse = formResponses[formCount - 1];
    var itemResponses = formResponse.getItemResponses();
  
    for (var i = 0; i < itemResponses.length(); i++){
      var itemResponse = itemResponses[i];
      var question = itemResponse.getItem().getTitle();
      var response = itemResponse.getResponse();
  
      Logger.log(question);
      Logger.log(response);
  
      res.push(response)
    }
  }
  
  function addOrder() {
    //TODO
  }
  
  function sendEmail() {
    //TODO
  }
  
  function decrementStock(){
    //TODO
  }