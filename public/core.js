//core.js

var Patients = angular.module('Patients', []);

Patients.controller('mainController', ['$scope', '$http', function($scope, $http){
  $scope.patients = {};
  $scope.search   = {};
  $scope.recents  = {};
  
  
  $http.get('/api/patients')
    .success(function(data){
      $scope.patients = data;
      console.log('I have patients :', data);
    })
    .error(function(data){
      console.log('ERROR: ', data);
    });
}]);