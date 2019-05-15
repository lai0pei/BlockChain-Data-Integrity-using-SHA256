var sha256 = require("sha256");

function hashForNonce(pre, curData, nonce){
  var data = pre + nonce.toString() + JSON.stringify(curData);
  var hash = sha256(data);
  return hash;
}

function hash(index) {
  const data = JSON.stringify(get(index));
  const nonce = $("#nonce" + index).val();
  const pre = $("#pre" + index).val();
  const hash = pre + nonce.toString() + data;
  return sha256(hash);
} //This is the method to calculate hash in the frontend.

function updateState(index) {
  if (
    $("#cur" + index)
      .val()
      .substr(0, 4) === "0000"
  ) {
    $("#block" + index)
      .addClass("correct")
      .removeClass("error");
  } else {
    $("#block" + index)
      .addClass("error")
      .removeClass("correct");
  }
} //This method is to update background to red or green.

function get(index) {
  return {
    Index: parseInt($("#index" + index).val()),
    Name: $("#name" + index).val(),
    Gender: $("#gender" + index).val(),
    DateOfBirth: $("#dateofbirth" + index).val(),
    SSN: $("#ssn" + index).val(),
    Charge: $("#charge" + index).val(),
    CaseNo: $("#caseNo" + index).val(),
    OffenseDate: $("#offensedate" + index).val(),
    DisposedDate: $("#disposeddate" + index).val()
  };
} //Get the value from input field. 

function updateHash(index) {
  $("#cur" + index).val(hash(index));
  updateState(index);
} //Upddate the currenthash.

