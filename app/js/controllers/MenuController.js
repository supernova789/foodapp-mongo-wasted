// 'use strict';

foodMeApp.controller('MenuController',
    function MenuController($scope, $routeParams, $http, $filter, Restaurant, cart) {


$http.get("/api/fetchMenuItems").success(function(response){
  // console.log("Fetched MenuItems are "+JSON.stringify(response,null,6));
  
  var restID = $routeParams.restaurantId;
  // console.log('Restaurant id: '+restID);

  var fetchedItems = response;
  // console.log("Fetched MenuItems are "+JSON.stringify(fetchedItems,null,6));



  var result = $filter('filter')(fetchedItems, {id:restID}, true)[0];

  // let item = response.data.find(result => result.id === restID);

  // console.log("Filtered Result: "+JSON.stringify(result,null,6));

  $scope.restaurant = result;

}); 


$scope.getMoreInfo=function(){

  $http.get("/api/fetchMoreInfo").success(function(response){

    var moreInfoID = $routeParams.restaurantId;
    var fetchedInfo = response;
    // console.log("Fetched Info: "+JSON.stringify(fetchedInfo,null,6));

    var resultInfo = $filter('filter')(fetchedInfo, {id:moreInfoID}, true)[0];

    console.log("Fetched restaurant Info: "+JSON.stringify(resultInfo,null,6));

    $scope.restaurantInfo = resultInfo;

  }); 

}
      



//function to fetch menuitems from other node server
// $scope.getData=function() {
//   $http.get("/api/fetchMenuItems").success(function(response){
//     console.log("Fetched MenuItems are "+JSON.stringify(response,null,6));      
//   });    
// }




// $scope.restaurant = Restaurant.get({id: $routeParams.restaurantId});

$scope.cart = cart;

});
