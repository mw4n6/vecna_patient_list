//core.js

var Patients = angular.module('Patients', ['ngRoute', 'ngDialog']);

var routeConfig = function($routeProvider){
  $routeProvider
  .when(
    '/patients',
    {
      controller  : 'listController',
      templateUrl : 'list.html'
    }
  )
  .when(
    '/favorites',
    {
      controller  : 'favoritesController',
      templateUrl : 'list.html'
    }
  )
  .when(
    '/recents',
    {
      controller  : 'recentsController',
      templateUrl : 'list.html'
    }
  )
  .otherwise({
    redirectTo: "/patients"
  });
};

Patients.config(routeConfig);

Patients.controller('mainController', ['$scope', '$http', '$location', 'ngDialog', function($scope, $http, $location, ngDialog){
  
  /*  Initialize  */
  
  $scope.patients = [];
  $scope.listPatients = [];
  $scope.viewPatients = [];
  $scope.searchForm   = {
    query : null
  };
  $scope.recents  = [];
  $scope.favorites = [];
  $scope.sorts = [
    {
      key : "name.lastName",
      value : "Name",
    },
    {
      key : "birthDate",
      value : "Birth Date",
    }
  ];
  $scope.orders = [
    {
      key : 1,
      value : "Ascending",
    },
    {
      key : 0,
      value : "Descending",
    }
  ];
  $scope.currentSort = 'name.lastName';
  $scope.currentSortOrder = 1;
  $scope.lists = [
    {
      key : "patients",
      humanReadable : "All Patients"
    },
    {
      key : "favorites",
      humanReadable : "Favorites"
    },
    {
      key : "recents",  
      humanReadable : "Recents"
    }
  ];
  
  $http.get('/api/patients')
    .success(function(data){
      $scope.patients = data;
      $scope.$broadcast("loaded", {});
      console.log('I have patients :', data);
    })
    .error(function(data){
      console.log('ERROR: ', data);
    });

  /*  Define functions in scope */
  
  $scope.resortView = function(list){
    console.log("RESORTING : ", list);
    list.sort(function(a, b){
      
      if($scope.currentSort == 'birthDate')
      {
        a = moment(a[$scope.currentSort], "M/D/YYYY").valueOf();
        b = moment(b[$scope.currentSort], "M/D/YYYY").valueOf();
      }
      else
      {
        var currentSort = $scope.currentSort.split(".");
        
        $.each(currentSort, function(index, key){
          a = a[key];
          b = b[key];
        });
      }
      
      if(a > b)
      {
        return $scope.currentSortOrder ? 1 : -1;
      }
      
      if(a < b)
      {
        return $scope.currentSortOrder ? -1 : 1;
      }
      return 0;
      
      
    });
  }; 
  
  $scope.getCurrentList =function(){
    var currentLoc = $location.path().replace("/", '');
    var ret = 'patients';
    $.each($scope.lists, function(key, obj){
      if(currentLoc == obj.key)
      {
        ret = obj;
      }
    });
    return ret;
  };
  
  $scope.search = function(){
    
    $scope.$broadcast("search", {
      query : $scope.searchForm.query
    });
  };
  
  $scope.searchOnQuery = function(query, list){
    var query = query.toLowerCase().split(" ");
    console.log("Searching : ", query);
    var newView = [];
    $.each(list, function(index, thisPatient){
      var first = thisPatient.name.firstName.toLowerCase();
      var last =  thisPatient.name.lastName.toLowerCase();
      console.log(first, last);
      var add = false;
      $.each(query, function(index, thisQuery){
        if(
          (first.indexOf(thisQuery) != -1)
          ||
          (last.indexOf(thisQuery) != -1)
        )
        {
          add = true;
        }
      });
      
      if(add)
      {
        newView.push(thisPatient);
      }
    });
    
    return newView;
  };
  
  $scope.inFavorites = function(patient){
    var ret = false;
    $.each($scope.favorites, function(index, thisPatient){
      if(patient._id == thisPatient._id)
      {
        ret = index;
      }
    });
    console.log("In favorites returning:", ret);
    return ret;
  };
  
  $scope.toggleFavorite = function(patient){
    console.log("Checking patient :", patient);
    var index = $scope.inFavorites(patient);
    if(index === false)
    {
      console.log("Adding to favorites : ", patient);
      $scope.favorites.push(patient);
    }
    else
    {
      $scope.favorites.splice(index, 1);
    }
    console.log("Favorites are now: ", $scope.favorites);
  };
  
  $scope.selectPatient = function(patient){
    console.log(patient);
    $scope.addToRecents(patient);
    console.log($scope.recents);
    ngDialog.openConfirm({
      template: 'patientEditDialog.html',
      data: {
        patient : patient
      },
      scope:  $scope,
      controller: 'editDialogController'
    });
  };
  
  $scope.addToRecents = function(patient){
    console.log("Adding to recents : ", patient);
    var isNew = true;
    $.each($scope.recents, function(index, thisPatient){
      if(patient._id == thisPatient._id)
      {
        isNew = false;
      }
    });
    
    if(isNew)
    {
      $scope.recents.push(patient);
    }
  };
}])
.controller('listController', ['$scope', function($scope){
  $scope.$on("loaded", function(event, args){
    console.log("Parent is loaded!");
    $scope.listPatients = $scope.patients;
    $scope.viewPatients = $scope.listPatients;
    $scope.resortView($scope.viewPatients);   
  });

  $scope.listPatients = $scope.patients;
  $scope.viewPatients = $scope.listPatients;
  $scope.resortView($scope.viewPatients);   
  
  $scope.$on("search", function(event, args){
    $scope.viewPatients = $scope.searchOnQuery(args.query, $scope.listPatients);
    $scope.resortView($scope.viewPatients);   
  });
  
  $scope.$watch(
    'currentSort',
    function(){
      $scope.resortView($scope.viewPatients);
    }
  );
  
  $scope.$watch(
    'currentSortOrder',
    function(){
      $scope.resortView($scope.viewPatients);
    }
  );
}])
.controller('favoritesController', ['$scope', function($scope){
  $scope.listPatients = $scope.favorites;
  $scope.viewPatients = $scope.listPatients;
  $scope.resortView($scope.viewPatients);
  
  $scope.$on("search", function(event, args){
    $scope.viewPatients = $scope.searchOnQuery(args.query, $scope.listPatients);
    $scope.resortView($scope.viewPatients);   
  });
  
  $scope.$watch(
    'currentSort',
    function(){
      $scope.resortView($scope.viewPatients);
    }
  );
  
  $scope.$watch(
    'currentSortOrder',
    function(){
      $scope.resortView($scope.viewPatients);
    }
  );
}])
.controller('recentsController', ['$scope', function($scope){
  console.log("Switching to recents :", $scope.recents);
  $scope.listPatients = $scope.recents;
  $scope.viewPatients = $scope.listPatients;
  
  console.log("Current sort is :", $scope.currentSort);
  console.log("View is :", $scope.viewPatients);
  $scope.resortView($scope.viewPatients);
  
  $scope.$on("search", function(event, args){
    $scope.viewPatients = $scope.searchOnQuery(args.query, $scope.listPatients);
    $scope.resortView($scope.viewPatients);   
  });
  
  $scope.$watch(
    'currentSort',
    function(){
      $scope.resortView($scope.viewPatients);
    }
  );
  
  $scope.$watch(
    'currentSortOrder',
    function(){
      $scope.resortView($scope.viewPatients);
    }
  );
}])
.controller('editDialogController', ['$scope', '$http', function($scope, $http){
  console.log($scope.ngDialogData);
  console.log($scope.patients);
  $scope.thisPatient = $scope.ngDialogData.patient;
  var date = $scope.thisPatient.birthDate.split("/");
  $scope.birthDate = {
    month:  date[0],
    day:  date[1],
    year:  date[2],
  };
  
  $scope.save = function(){
    
    console.log($scope.birthDate);
    
    $scope.thisPatient.birthDate = $scope.birthDate.month + "/" + $scope.birthDate.day + "/" + $scope.birthDate.year;
    
    console.log($scope.thisPatient);
    
    $http.post('/api/save_patient', {
      patient : $scope.thisPatient
    })
    .success(function(data){
      $scope.patients = data;
      $scope.closeThisDialog();
      console.log(data);
    })
    .error(function(data){
      console.log('Error: ' + data);
    });
  };
}]);