/**
 * Created by STORM on 2/12/2016.
 */

angular.module('orderingApp.factories',['ngResource'])

    .factory('UserSvc', function($resource, API_ENDPOINT){

        return {
            signUp : $resource(API_ENDPOINT.user + '/signup',{},{
                charge : {
                    method : 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params : {
                        lang    :'@lang',
                        name    :'@userName',
                        email   :'@userEmail',
                        password:'@userPassword',
                        lastName : '@lastName',
                        country : '@country',
                        city : '@city',
                        street : '@street',
                        postCode : '@postCode',
                        landPhone :'@landPhone',
                        mobilePhone : '@mobilePhone',
                        apt : '@apt'
                    }
                }
            }),
            getUserByID : $resource(API_ENDPOINT.user + '/login/:Id',{},{
                get : {
                    method : 'GET',
                    params : {
                        lang    :'@lang'
                    }
                }
            }),
            updateUser : $resource(API_ENDPOINT.user + '/update',{},{
                update : {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        lang    :'@lang',
                        Id : '@id',
                        name    :'@userName',
                        email   :'@userEmail',
                        password:'@userPassword',
                        lastName : '@lastName',
                        country : '@country',
                        city : '@city',
                        street : '@street',
                        postCode : '@postCode',
                        landPhone :'@landPhone',
                        mobilePhone : '@mobilePhone',
                        apt : '@apt'
                    }
                }
            }),
            login : $resource(API_ENDPOINT.user + '/login',{},{
                getUser : {
                    method : 'GET',
                    params : {
                        lang    :'@lang',
                        email   :'@email',
                        password:'@password'
                    }
                }
            }),
            forgot : $resource(API_ENDPOINT.user + '/forgotPassword',{},{
                send : {
                    lang    : '@language',
                    email   : '@userEmail'
                }
            })
        };

    })
    .factory('BusinessSvc', function($resource, API_ENDPOINT){

        return {
            getByCondition : $resource(API_ENDPOINT.business,{},{
                charge : {
                    method : 'GET',
                    params : {
                        lang        :'@@lang',
                        type        :'@@businessType',
                        country     :'@selectedCountry',
                        city        :'@selectedCity',
                        address     :'@selectedAddress',
                        latitude    :'@userLatitude',
                        longitude   :'@userLongitude'
                    }
                }
            }),
            getInformation : $resource(API_ENDPOINT.business + '/info/:Id',{},{
                charge : {
                    method : 'GET',
                    params : {
                        Id : '@businessId',
                        lang    :'@lang',
                        latitude : '@latitudeOfUser',
                        longitude : '@longitudeOfUser',
                        zipCode : '@zipCode'
                    }
                }
            }),
            getInformationBySlug : $resource(API_ENDPOINT.business + '/slug/:businessSlug',{},{
                charge : {
                    method : 'GET',
                    params : {
                        businessSlug : '@businessSlug',
                        lang    :'@lang'
                    }
                }
            }),
            getPaymentmethod : $resource(API_ENDPOINT.paymentmethod ,{},{
                charge : {
                    method : 'POST',
                    params : {
                        businessId : '@businessId',
                        lang    :'@lang'
                    }
                }
            }),
			getByCondition : $resource(API_ENDPOINT.business,{},{
                charge : {
                    method : 'GET',
                    params : {
                        lang        :'@@lang',
                        type        :'@@businessType',
                        country     :'@selectedCountry',
                        city        :'@selectedCity',
                        address     :'@selectedAddress',
                        latitude    :'@userLatitude',
                        longitude   :'@userLongitude'
                    }
                }
            }),
            getReviews : $resource(API_ENDPOINT.business + '/reviews/:Id',{},{
                charge : {
                    method : 'GET',
                    params : {
                        Id : '@businessId',
                        lang    :'@lang'
                    }
                }
            }),
            getOffers : $resource(API_ENDPOINT.business + '/offers/:Id',{},{
                charge : {
                    method : 'GET',
                    params : {
                        Id : '@businessId',
                        lang    :'@lang'
                    }
                }
            }),
            getByNeighbourHood : $resource(API_ENDPOINT.neighSearchResult,{},{
                charge : {
                    method : 'GET',
                    params : {                       
                        key   :'@id',
                        lang   :'@lang'
                    }
                }
            }),
        };

    })
    .factory('ConfirmSvc',function ($resource, API_ENDPOINT) {
        return $resource(API_ENDPOINT.sendmailprinter,{},{
            getInfo : {
                method : 'GET',
                params : {
                    orderId : '@orderId',
                    ordercomment    :'@ordercomment',
                    lang    :'@lang'
                }
            }
        });
    })
    .factory('CheckoutInfoSvc',function ($resource, API_ENDPOINT) {
        return $resource(API_ENDPOINT.checkout, {}, {
            getInfo : {
                method : 'GET',
                params : {}
            }
        });
    })
    .factory('LanguageSvc',function ($resource, API_ENDPOINT) {
        return {
            getLanguageList : $resource(API_ENDPOINT.language + '/list',{},{
                getInfo : {
                    method : 'GET',
                    params : {}
                }
            }),
            getMultiLanguage : $resource(API_ENDPOINT.language + '/multiLang',{},{
                getInfo : {
                    method : 'GET',
                    params : {}
                }
            })
        }
    })
    .factory('MenuSvc',function ($resource, API_ENDPOINT) {
        return $resource(API_ENDPOINT.menu,{},{
            getInfo : {
                method : 'GET',
                params : {
                    lang : '@language',
                    businessId : '@businessId',
                    timezone : '@businessTimezone'
                }
            }
        });
    })

    .factory('ProductOptionSvc',function ($resource, API_ENDPOINT) {
        return $resource(API_ENDPOINT.product + '/info/:Id',{},{
            getInfo : {
                method : 'GET',
                params : {
                    Id : '@dishId',
                    lang : '@language'
                }
            }
        });
    })

    .factory('PushNotificationSvc', function($resource, API_ENDPOINT){
        return {
            register : $resource(API_ENDPOINT.notification + '/register',{},{
                update: {
                    method: 'POST',
                    /*headers: { 'Content-Type': 'application/x-www-form-urlencoded'},*/
                    params: {
                        usrid : '@usrid',
                        device_token : '@device_token',
                        device_type : '@device_type',
                        businessid : '@businessid',           //  Required for OrderManagerApp
                        device_apptype : '@device_apptype'
                    }
                }
            }),
            enabled : $resource(API_ENDPOINT.notification + '/enable',{},{
                update: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        userId : '@userId',
                        enabled : '@enabled'
                    },
                    data : {}
                }
            })
        }
    })

    .factory('OrderSvc', function($resource, API_ENDPOINT){
        return {
            place : $resource(API_ENDPOINT.order + '/place',{},{
                update: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        userId : '@userID',
                        comment : '@orderComment',   // current don't needed, please use api parameter on buyer for order comment.
                        data : '@placeOrderDataString'
                    },
                    data : {}
                }
            }),
            getOrderByUser : $resource(API_ENDPOINT.order + '/list/:userId',{},{
                getOrder : {
                    method : 'GET',
                    params : {
                        userId : '@userId'
                        // lang : '@language'
                    }
                }
            }),
            enabled : $resource(API_ENDPOINT.order + '/enable',{},{
                update: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        userId : '@userID',
                        status : '@enableDisableState'
                    },
                    data : {}
                }
            }),
            getCurrency: $resource(API_ENDPOINT.currencyget,{},{
                getInfo : {
                    method : 'GET',
                    params : {
                        id : '@businessid'
                    }
                }
            })
        }
    })


    .factory('stripCardSvc', function($resource,API_ENDPOINT){
        
        //alert(JSON.stringify($resource))
        
        return   { 
                getCardByUser : $resource(API_ENDPOINT.payment.stripe.cardget,{},{
                getCard: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        userId : '@userId',
                        key : '@key',
                        
                        },
                    data : {}
                }
            })
        }
    })

    .factory('DriverSvc', function($resource, API_ENDPOINT){     
        return{
            currentPosition : $resource(API_ENDPOINT.driver + '/getDriverPos', {},{
                get: {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        driverId : '@driverId'
                    },
                    data : {}
                }
            })
        }
    })
	
	.factory('cardRecordSrv', function($resource,API_ENDPOINT){
        
        //alert(API_ENDPOINT.paymentmethod)
        
        
        return   { cardRecord : $resource(API_ENDPOINT.payment.stripe.cardDelete,{},{
                getMethod: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        cardid : '@cardid',
                        customerid : '@customerid',
                        key : '@key',
                        
                        },
                    data : {}
                }
            }),
             setDefaultCardByUser : $resource(API_ENDPOINT.payment.stripe.carddefaultSet,{},{
                defaultCard: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        userId : '@userID',
                        status : '@enableDisableState',
                        key : '@key'
                    },
                    data : {}
                }
            })
        }
    })

    .factory('paypalCardSvc', function($resource,API_ENDPOINT){       
        return   { 
                getCardifo : $resource(API_ENDPOINT.payment.rooturl+'/paypaltransaction',{},{
                returnChk: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        orderid : '@orderid'            
                    },
                    data : {}
                }
            })
        }
    })
	
	
    .factory('PaymentStripe', function($resource,API_ENDPOINT){
        
        return   { getPaymentinfoByUser : $resource(API_ENDPOINT.payment.stripe.addcustomer,{},{
            getinfo: {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                params: {
                    name : '@name',
                    number : '@number',
                    cvc : '@cvc',
                    exp_month : '@exp_month',
                    exp_year : '@exp_year',
                    userId : '@userId',
                    userCount : '@userCount',
                    key : '@key',
                    email : '@email'
                    },
                data : {}
            }
        }),
        payprocessProcess : $resource(API_ENDPOINT.payment.stripe.stripepaymentprocess,{},{
                  finalpay: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        orderDescription : '@orderDescription',
                        orderid: '@orderid',
                        amount: '@amount',
                        customer_id : '@customer_id'
                        },
                    data : {}
                }
            })
            
        }
    })

    .factory('ModalSvc',function($ionicModal, $rootScope, $q){
        return {
            setModalView : setModalView,
            closeModal : closeModal
        };
        function setModalView(url) {
            var def = $q.defer();
            var modalScope = $rootScope.$new();
            modalScope.cancelModal = cancelModal;

            $ionicModal.fromTemplateUrl(url, {
                scope: modalScope
            }).then(function(modal) {
                modalScope.modal = modal;
                modalScope.modal.show();
                $rootScope.hModal = modalScope.modal;
            });

            function cancelModal() {
                modalScope.modal.hide();
                modalScope.modal.remove();
                // you can resolve the result of the modal here
                def.resolve();
            }
            return def.promise;
        }
        function closeModal() {
            $rootScope.hModal.hide();
            $rootScope.hModal.remove();
        }
    })
    .factory('MyLoading',function ($ionicLoading) {
        return {
            show : showLoading,
            hide : hideLoading
        };
        function showLoading(msg) {
            $ionicLoading.show({
                template:'<p ng-init="scrollToLoading()">' + msg + '</p><ion-spinner icon="'+(ADDONS.web_template ? 'android':'ripple')+'" class="spinner-assertive"></ion-spinner>'
            });
            disableScroll();
        }
        function hideLoading() {
            $ionicLoading.hide();
            enableScroll();
        }
    })
    .factory('MyAlert',function ($ionicPopup, $rootScope, $q) {
        return {
            show : showAlert,
            alert : callAlert,
            confirm : callConfirm,
            prompt : callPrompt,
            showtWithTitle: showAlertWithTitle
        };
        function showAlertWithTitle(title, msg) {
            if (!$rootScope.arabic_rtl)
            {
            $ionicPopup.alert({
                title : title,
                template: msg,
                okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
            });
            }
            else {
                $ionicPopup.alert({
                    title : title,
                    template: '<p style=\'direction:rtl;\'>' + msg + '</p>',
                    okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
                });
            }
        }
        function showAlert(msg) {
            var alertPopup = null;
            if (!$rootScope.arabic_rtl)
            {
            alertPopup = $ionicPopup.alert({
                title : $rootScope.MLanguages.MOBILE_APPNAME,
                template: '\<center ng-init="scrollToAlert()"\>'+msg+'\<\/center\>',
                okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
            });
            }
            else {
                alertPopup = $ionicPopup.alert({
                    title : $rootScope.MLanguages.MOBILE_APPNAME,
                    template: '<p ng-init="scrollToAlert()" style=\'direction:rtl;\'>' + msg + '</p>',
                    okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
                });
            }
            backdropAlert(true);
            alertPopup.then(function(res) {
                backdropAlert(false);
            });
            return alertPopup;
        }
        function callAlert(msg) {
            var def = $q.defer();
            $ionicPopup.alert({
                title : $rootScope.MLanguages.MOBILE_APPNAME,
                template : msg
            }).then(function (res) {
                def.resolve();
            });
        }
        function callConfirm(msg) {
            var def = $q.defer();
            $ionicPopup.confirm({
                title : $rootScope.MLanguages.MOBILE_APPNAME,
                template : msg
            }).then(function (res) {
                if (res){
                    def.resolve('OK');
                }else {
                    def.reject('CANCEL');
                }
            });
        }
        function callPrompt(msg) {
            var def = $q.defer();
            $ionicPopup.confirm({
                title : $rootScope.MLanguages.MOBILE_APPNAME,
                template : msg
            }).then(function (res) {
                if (res){
                    def.resolve(res);
                }else {
                    def.reject('CANCEL');
                }
            });
        }
    })

    .factory('JqueryPostDataSvc', function($q, MyLoading, $rootScope){
        return{
            post : postData
        };
        function postData(url,data){
            var def = $q.defer();
            //MyLoading.show($rootScope.MLanguages.MOBILE_GETTING);
            $.post(url,data,function(res){
                //MyLoading.hide();
                def.resolve(res);
            });
            return def.promise;
        }
    })

    .factory('AllCityFech', function($resource,API_ENDPOINT){     
        return{ 
            getAllCity : $resource(API_ENDPOINT.cityget, {},{
                getCity: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        lang    :'@lang'
                    },
                    data : {}
                }
            })
        }
    })
    .factory('AllNeighFech', function($resource,API_ENDPOINT){     
        return{ 
            getAllNeighbour : $resource(API_ENDPOINT.neighget, {},{
                getNeighbour: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        lang    :'@lang',
                        city    :'@city'
                    },
                    data : {}
                }
            })
        }
    })

    // ORIGINAL_APIs ------------------------------------------------------------------------

    .factory('ionicReady', function($ionicPlatform) {
        var readyPromise;

        return function () {
            if (!readyPromise) {
                readyPromise = $ionicPlatform.ready();
            }
            return readyPromise;
        };
    })
    // GeoCoding with Geolocation and GoogleMaps
    .factory('GeolocationSvc', [
        '$q', '$window',
        function($q, $window) {
            return function() {
                var deferred = $q.defer();

                if(!$window.navigator) {
                    deferred.reject(new Error('Geolocation is not supported'));
                } else {
                    var positionOptions = {timeout: 15000, enableHighAccuracy: true};
                    $window.navigator.geolocation.getCurrentPosition(function(position) {
                        deferred.resolve({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    }, deferred.reject, positionOptions);
                }

                return deferred.promise;
            };
        }])

    .factory('AddressLookupSvc', [
        '$q', '$http', 'GeolocationSvc',
        function($q, $http, GeolocationSvc, gMyLatLng) {
            var MAPS_ENDPOINT = 'https://maps.google.com/maps/api/geocode/json?latlng={POSITION}&sensor=false';

            return {
                urlForLatLng: function(lat, lng) {
                    return MAPS_ENDPOINT.replace('{POSITION}', lat + ',' + lng);
                },

                lookupByLatLng: function(lat, lng) {
                    var deferred = $q.defer();
                    var url = this.urlForLatLng(lat, lng);

                    $http.get(url).success(function(response) {
                        // hacky
                        var zipCode;
                        angular.forEach(response.results, function(result) {
                            if(result.types[0] === 'postal_code') {
                                zipCode = result.address_components[0].short_name;
                            }
                        });
                        deferred.resolve(zipCode);
                    }).error(deferred.reject);

                    return deferred.promise;
                },

                lookupByAddress: function(lat, lng) {
                    var deferred = $q.defer();
                    var url = this.urlForLatLng(lat, lng);
                    $http.get(url).success(function(response) {
                        // hacky
                        var address = {
                            address : '',
                            zip : ''
                        };
                        var state = false;
                        angular.forEach(response.results, function(result) {
                            //console.log(result.types);
                            if (!state){
                                if (result.types.indexOf('street_address') != -1){
                                    address.address = result.formatted_address;
                                    state = true;
                                }else if (result.types.indexOf('route') != -1){
                                    for(v in result.address_components) {
                                        if(result.address_components[v].types.indexOf('route') != -1){
                                            if(result.address_components[v].long_name !='Unnamed Road'){
                                                address.address = result.formatted_address;
                                                state = true;
                                            }
                                        }
                                    }
                                }else if (result.types.indexOf('locality') != -1){
                                     address.address = result.formatted_address;
                                     state = true;
                                }else if (result.types.indexOf('postal_code') != -1){
                                     address.address = result.formatted_address;
                                     state = true;
                                }else if (result.types.indexOf('political') != -1){
                                    address.address = result.formatted_address;
                                    state = true;
                                }
                            }
                            if (result.types[0] === 'postal_code'){
                                address.zip = result.address_components[0].long_name;
                                // state = true;
                            }
                        });
                        deferred.resolve(address);
                    }).error(deferred.reject);

                    return deferred.promise;
                },

                lookup: function() {
                    var deferred = $q.defer();
                    var self = this;

                    GeolocationSvc().then(function(position) {
                        //deferred.resolve(self.lookupByLatLng(position.lat, position.lng));
                        deferred.resolve({
                            address : self.lookupByAddress(position.lat, position.lng),
                            location : position
                        });
                    }, deferred.reject);

                    return deferred.promise;
                }
            };
        }
    ])

    .factory('GeoCoderSvc', [
        '$q', '$window',
        function($q, $window) {
            return {
                getLocationFromAddress : function ( address ) {
                    var geocoder = new google.maps.Geocoder;
                    var deferred = $q.defer();
                    geocoder.geocode({'address': address}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            deferred.resolve({
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng()
                            });
                        }
                        else {
                            deferred.reject("Geocode was not successful for the following reason: " + status);
                        }
                    });
                    return deferred.promise;
                },
                getCountryCityFromAddress : function ( address ) {
                    var geocoder = new google.maps.Geocoder;
                    var deferred = $q.defer();
                    geocoder.geocode({'address': address}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {

                            var city, country;
                            var zip = '';
                            var state = false;
                            var location = {
                                lat: results[0].geometry.location.lat(),
                                lng: results[0].geometry.location.lng()
                            }

                            angular.forEach(results, function (subResult) {
                                if (state == false){
                                    angular.forEach(subResult.address_components, function(result) {
                                        if (result.types[0] === 'locality'){
                                            city = result.long_name;
                                        }
                                        if (result.types[0] === 'country'){
                                            country = result.long_name;
                                        }
                                        if (result.types[0] === 'postal_code'){
                                            zip = result.long_name;
                                        }
                                    });
                                    if (typeof city != 'undefined' && typeof country != 'undefined' && zip != ''){
                                        state = true;
                                    }
                                }
                            });

                            deferred.resolve({
                                city : city,
                                country : country,
                                zip : zip,
                                location : location
                            });
                        }
                        else {
                            deferred.reject("Geocode was not successful for the following reason: " + status);
                        }
                    });
                    return deferred.promise;
                },
                getPlaceIdFromLatLng : function (position) {
                    var geocoder = new google.maps.Geocoder;
                    var deferred = $q.defer();
                    geocoder.geocode({'location': position}, function(results, status) {

                        if (status === google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                deferred.resolve(results[1].place_id);
                            } else {
                                defered.reject('No results found');
                            }
                        } else {
                            defered.reject('Geocoder failed due to: ' + status);
                        }
                    });
                    return deferred.promise;
                }
            }
        }
    ])
    .factory('DiscountCouponSvc', function($resource,API_ENDPOINT){        
        return{                   
            getrecord : $resource(API_ENDPOINT.discount,{},{
                info:{
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
                    params: {
                        businessid : '@businessid',
                        discount_Code    : '@code',
                        total_amount   : '@total'
                    },
                    data : {}
                }
            })
        }
    })

    .factory('PaypalService', ['$q', '$ionicPlatform', 'shopSettings', '$filter', '$timeout', function ($q, $ionicPlatform, shopSettings, $filter, $timeout) {
        var init_defer;
        /**
         * Service object
         * @type object
         */
        var service = {
            initPaymentUI: initPaymentUI,
            createPayment: createPayment,
            configuration: configuration,
            onPayPalMobileInit: onPayPalMobileInit,
            makePayment: makePayment
        };
        /**
         * @ngdoc method
         * @name initPaymentUI
         * @methodOf app.PaypalService
         * @description
         * Inits the payapl ui with certain envs.
         *
         *
         * @returns {object} Promise paypal ui init done
         */
        function initPaymentUI() {
            init_defer = $q.defer();
            $ionicPlatform.ready().then(function () {
                var clientIDs = {
                    "PayPalEnvironmentProduction": shopSettings.payPalProductionId,
                    "PayPalEnvironmentSandbox": shopSettings.payPalSandboxId
                };
                PayPalMobile.init(clientIDs, onPayPalMobileInit);
            });
            return init_defer.promise;
        }
        /**
         * @ngdoc method
         * @name createPayment
         * @methodOf app.PaypalService
         * @param {string|number} total total sum. Pattern 12.23
         * @param {string} name name of the item in paypal
         * @description
         * Creates a paypal payment object
         *
         *
         * @returns {object} PayPalPaymentObject
         */
        function createPayment(total, name) {
            // "Sale == > immediate payment
            // "Auth" for payment authorization only, to be captured separately at a later time.
            // "Order" for taking an order, with authorization and capture to be done separately at a later time.
            var payment = new PayPalPayment("" + total, "USD", "" + name, "Sale");
            return payment;
        }
        /**
         * @ngdoc method
         * @name configuration
         * @methodOf app.PaypalService
         * @description
         * Helper to create a paypal configuration object
         *
         *
         * @returns {object} PayPal configuration
         */
        function configuration() {
            // for more options see `paypal-mobile-js-helper.js`
            var config = new PayPalConfiguration({merchantName: shopSettings.payPalShopName, merchantPrivacyPolicyURL: shopSettings.payPalMerchantPrivacyPolicyURL, merchantUserAgreementURL: shopSettings.payPalMerchantUserAgreementURL});
            return config;
        }
        function onPayPalMobileInit() {
            $ionicPlatform.ready().then(function () {
                // must be called
                // use PayPalEnvironmentNoNetwork mode to get look and feel of the flow
                PayPalMobile.prepareToRender(shopSettings.payPalEnv, configuration(), function () {
                    $timeout(function () {
                        init_defer.resolve();
                    });
                });
            });
        }
        /**
         * @ngdoc method
         * @name makePayment
         * @methodOf app.PaypalService
         * @param {string|number} total total sum. Pattern 12.23
         * @param {string} name name of the item in paypal
         * @description
         * Performs a paypal single payment
         *
         *
         * @returns {object} Promise gets resolved on successful payment, rejected on error
         */
        function makePayment(total, name) {
            var defer = $q.defer();
            total = $filter('number')(total, 2);
            $ionicPlatform.ready().then(function () {
                PayPalMobile.renderSinglePaymentUI(createPayment(total, name), function (result) {
                    $timeout(function () {
                        defer.resolve(result);
                    });
                }, function (error) {
                    $timeout(function () {
                        defer.reject(error);
                    });
                });
            });
            return defer.promise;
        }
        return service;
    }]);
