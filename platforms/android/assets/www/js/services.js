/**
 * Created by STORM on 2/8/2016.
 */
angular.module('orderingApp.services',[])

    //From Home to Near Resturant
    .service('gNearService', function() {
        var gNearService = this;
        gNearService.sharedObject = {};

        gNearService.getData = function(){
            if (!gNearService.sharedObject.nearAddress && localStorageApp.getItem(STORE_VAL.NEAR_SERVICE)) gNearService.sharedObject = JSON.parse(localStorageApp.getItem(STORE_VAL.NEAR_SERVICE));
            return gNearService.sharedObject;
        };

        gNearService.setData = function(value){
            localStorageApp.setItem(STORE_VAL.NEAR_SERVICE, JSON.stringify(value));
            gNearService.sharedObject = value;
        }
    })

    .service('gMyLatLng',function(){

        var latlngData = {};
        this.setData = function(obj) {
            console.log(obj);
            localStorageApp.setItem(STORE_VAL.MY_LAT_LNG, JSON.stringify(obj));
            latlngData = obj;
        };
        this.getData = function() {
            if (!latlngData.lat && localStorageApp.getItem(STORE_VAL.MY_LAT_LNG)) latlngData = JSON.parse(localStorageApp.getItem(STORE_VAL.MY_LAT_LNG));
            return latlngData;
        };
    })

    .service('gMyAddress',function(){

        var address = {};
        this.setData = function(obj) {
            console.log(obj);
            localStorageApp.setItem(STORE_VAL.MY_ADDRESS, JSON.stringify(obj));
            address = obj;
        };
        this.getData = function() {
            if (!address.formatted_address && localStorageApp.getItem(STORE_VAL.MY_ADDRESS)) address = JSON.parse(localStorageApp.getItem(STORE_VAL.MY_ADDRESS));
            return address;
        };
    })

    .service('gUserData',function(){

        var userData = {};
        this.setData = function(obj) {
            localStorageApp.setItem(STORE_VAL.USER_DATA, JSON.stringify(obj));
            userData = obj;
        };
        this.getData = function() {
            if (!userData.id && localStorageApp.getItem(STORE_VAL.USER_DATA)) userData = JSON.parse(localStorageApp.getItem(STORE_VAL.USER_DATA));
            return userData;
        };
    })

    // Object Array of All Business -------------------------
    .service('gAllBusiness',function(){

        var businessData = [];
        this.setData = function(obj) {
            localStorageApp.setItem(STORE_VAL.ALL_BUSINESS, JSON.stringify(obj));
            businessData = obj;
        };
        this.getData = function() {
            if (businessData.length == 0 && localStorageApp.getItem(STORE_VAL.ALL_BUSINESS)) businessData = JSON.parse(localStorageApp.getItem(STORE_VAL.ALL_BUSINESS));
            return businessData;
        };
    })

    //From restaurant searchList to item
    .service('gCurRestaurant', function() {
        var gCurRestaurant = this;
        gCurRestaurant.sharedObject = {};

        gCurRestaurant.getData = function(){
            if (!gCurRestaurant.sharedObject.id && localStorageApp.getItem(STORE_VAL.CUR_RESTAURANT)) gCurRestaurant.sharedObject = JSON.parse(localStorageApp.getItem(STORE_VAL.CUR_RESTAURANT));
            return gCurRestaurant.sharedObject;
        };

        gCurRestaurant.setData = function(value){
            localStorageApp.setItem(STORE_VAL.CUR_RESTAURANT, JSON.stringify(value));
            gCurRestaurant.sharedObject = value;
        }
    })

    .service('gCurDishList', function() {
        var gCurDishList = this;
        gCurDishList.sharedObject = {};

        gCurDishList.getData = function(){
            return gCurDishList.sharedObject;
        };

        gCurDishList.setData = function(value){
            gCurDishList.sharedObject = value;
        }
    })

    .service('gDeliveryComment', function(){
        var gComment = this;
        gComment.sharedObject = {};

        gComment.getData = function(){
            return gComment.sharedObject;
        };

        gComment.setData = function(value){
            gComment.sharedObject = value;
        }
    })

    .service('gOrder',function(){
        var gOrder = [];
        this.setData = function(obj) {
            localStorageApp.setItem(STORE_VAL.ORDER_DATA, JSON.stringify(obj));
            gOrder = obj;
        };
        this.getData = function() {
            if (gOrder.length == 0 && localStorageApp.getItem(STORE_VAL.ORDER_DATA)) gOrder = JSON.parse(localStorageApp.getItem(STORE_VAL.ORDER_DATA));
            return gOrder;
        };
    })

    .service('gBufferDishes',function(){
        var gBufferDishes = this;
        gBufferDishes.sharedObject = [];
        gBufferDishes.setData = function(obj) {
            localStorageApp.setItem(STORE_VAL.BUFFER_DISHES, JSON.stringify(obj));
            gBufferDishes.sharedObject = obj;
        };
        gBufferDishes.getData = function() {
            if (gBufferDishes.sharedObject.length == 0 && localStorageApp.getItem(STORE_VAL.BUFFER_DISHES)) gBufferDishes.sharedObject = JSON.parse(localStorageApp.getItem(STORE_VAL.BUFFER_DISHES));
            return gBufferDishes.sharedObject;
        };
    })

    .service('gBusinessData',function(){
        var gBusinessData = {};
        this.setData = function(obj) {
            localStorageApp.setItem(STORE_VAL.BUSINESS_DATA, JSON.stringify(obj));
            gBusinessData = obj;
        };
        this.getData = function() {
            if (!gBusinessData.id && localStorageApp.getItem(STORE_VAL.BUSINESS_DATA)) gBusinessData = JSON.parse(localStorageApp.getItem(STORE_VAL.BUSINESS_DATA));
            return gBusinessData;
        };
    })

    .service('gSingleOrderData',function(){
        var gSingleOrderData = {};
        this.setData = function(obj) {
            gSingleOrderData = obj;
        };
        this.getData = function() {
            return gSingleOrderData;
        };
    })
	
	 .service('gMystripecard',function(){

        var mystripecard = {};
        this.setData = function(obj) {
            localStorageApp.setItem(STORE_VAL.MY_STRIPE_CARD, JSON.stringify(obj));
            mystripecard = obj;
        };
        this.getData = function() {
            console.log("MY_STRIPE_CARD", mystripecard);
            //if (!gBusinessData.id && localStorageApp.getItem(STORE_VAL.MY_STRIPE_CARD)) mystripecard = JSON.parse(localStorageApp.getItem(STORE_VAL.MY_STRIPE_CARD));
            return mystripecard;
        };
    })
    .service('gStates',function(){
        var gState = {};
        this.setState = function(obj) {
            gState = obj;
        };
        this.getState = function() {
            return gState;
        };
    })
    .service('LocationService', function($q){
      return {
        searchAddress: function(input) {
            var autocompleteService = new google.maps.places.AutocompleteService();
          var deferred = $q.defer();

          autocompleteService.getPlacePredictions({
            input: input
          }, function(result, status) {
            if(status == google.maps.places.PlacesServiceStatus.OK){
              //console.log(status);
              deferred.resolve(result);
            }else{
              deferred.reject(status)
            }
        });

          return deferred.promise;
        },
        getDetails: function(placeId) {
            var detailsService = new google.maps.places.PlacesService(document.createElement("input"));
          var deferred = $q.defer();
          detailsService.getDetails({placeId: placeId}, function(result) {
            deferred.resolve(result);
          });
          return deferred.promise;
        }
      };
    })
    ;
