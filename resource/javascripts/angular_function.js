window.app = angular.module('blockData', []);
app.controller('showblock', function ($scope, $http) {

      $http.get(`/blockchain`)
            .then(response => {
                  $scope.blockchain = response.data;
            }
            );
          

      $scope.refresh = function () {
            $("#refresh").addClass('running');
            $("#refreshing").addClass('show');
            setTimeout( function(){
                  $http.get('/blockchain')
                  .then(response => {
                        $scope.blockchain = response.data;                    
                  })
            $("#refreshing").removeClass('show');
            $("#refresh").removeClass('running');
            }, 3000);
          
      }

               
      $scope.consensus = function(){
            $("#sync").addClass('show');
            $("#consensus").addClass('running');
            setTimeout(function(){
                  window.location= "/consensus";
            $("#consensus").removeClass('running');
            $("#sync").removeClass('show');
            },3000);
           
         }


      $scope.checkState = function(index, block){
            $("#check").addClass('running');
            $("#checking").addClass('show');
            setTimeout( function(){
                  for (var x = index; x <= block; x++) {
                        if (x > 1) {
                              updateState(x);
                        }
                  }   
                  $("#checking").removeClass('show');
                  $("#check").removeClass('running');
            },3000);
      }


      $scope.updateChain = function (index, block) {
            for (var x = index; x <= block; x++) {
                  if (x > 1) {
                        $("#pre" + x).val($("#cur" + (x - 1).toString()).val());
                        updateHash(x);
                  }

            }
      }

      $scope.pushNewData = function(block) {
            $("#push").addClass('running');
            $("#insert").addClass('show');
            setTimeout(function(){
            var blockchain = [];
            for (var x = 1 ; x <= block ; x++) {
                  var data ={
                  Index : parseInt($("#index"+x).val()),
                  Nonce : $("#nonce"+x).val(),
                  Timestamp : Date(),
                  Name : $("#name"+x).val(),
                  Gender : $("#gender"+x).val(),
                  DateOfBirth : $("#dateofbirth"+x).val(),
                  SSN : $("#ssn"+x).val(),
                  Charge : $("#charge"+x).val(),
                  CaseNo : $("#caseNo"+x).val(),
                  OffenseDate : $("#offensedate"+x).val(),
                  DisposedDate : $("#disposeddate"+x).val(),
                  CurrentBlockHash : $("#cur"+x).val(),
                  PreviousBlockHash : $("#pre"+x).val()
                  }
                  blockchain.push(data);
            }
            $http({
                  url: "/newChain",
                  method: "POST",
                  data: blockchain,
                  headers: {'Content-Type': 'application/json'}})                    
                  $("#push").removeClass('running');
                  $("#insert").removeClass('show');
            },3000);
      }


      $scope.getNonce = function(x,block){
            let nonce = 0;
            var pre = $("#pre"+x).val();
            var data = {
                  Index : parseInt($("#index"+x).val()),
                  Name : $("#name"+x).val(),
                  Gender : $("#gender"+x).val(),
                  DateOfBirth : $("#dateofbirth"+x).val(),
                  SSN : $("#ssn"+x).val(),
                  Charge : $("#charge"+x).val(),
                  CaseNo : $("#caseNo"+x).val(),
                  OffenseDate : $("#offensedate"+x).val(),
                  DisposedDate : $("#disposeddate"+x).val(),
            }
            
            let hash = hashForNonce(pre, data, nonce);
            $("#ldbtn"+x).addClass('running');
           setTimeout(function(){
            while (hash.substring(0, 4) !== '0000') {
                  nonce++;
                  hash = hashForNonce(pre, data, nonce);
           }
          

           $("#nonce"+x).val(nonce);
           for(var i = x ; i <= block; i++){
                 if (i > 1) {
                       $("#pre" + i).val($("#cur" + (i - 1).toString()).val());
                       updateHash(i);
                 }
           }
           
           $("#ldbtn"+x).removeClass('running');
           }, 5000);
           
            
           
      }

});

app.controller('addblock', function ($scope, $http) {
      $scope.create = function (Name, Gender, DateOfBirth, Ssn, Charge, OffenseDate, caseNo, DisposedDate) {
                       
            $http.post(`/createNewBlock/${Name},${Gender},${DateOfBirth},${Ssn},${Charge},${OffenseDate},${caseNo},${DisposedDate}`)
                  .then(data => {
                        $scope.msg = response.data;
                  })

            $scope.clear();
      }

             $scope.clear = function () {
                  $scope.Name = undefined;
                  $scope.Gender = undefined;
                  $scope.Ssn = undefined;
                  $scope.DateOfBirth = undefined;
                  $scope.OffenseDate = undefined;
                  $scope.DisposedDate = undefined;
                  $scope.caseNo = undefined;
                  $scope.Charge = undefined;



      }
});

