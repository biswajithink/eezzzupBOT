/**
 * Created by STORM on 2/8/2016.
 */
angular.module('orderingApp', ['ionic','orderingApp.controllers','orderingApp.services','orderingApp.factories','jett.ionic.filter.bar','ngOpenFB','ngSanitize', 'ionic.cloud', 'ui.router'])
    .config(function($ionicCloudProvider) {
        $ionicCloudProvider.init({
            "core": {
                "app_id": APP_ID_IONIC_CLOUD
            }
        });
    })
    .run(function($ionicPlatform, $ionicPopup, gStates, ngFB, $rootScope, $ionicModal, $state, $ionicDeploy, $ionicLoading, OrderSvc, gUserData, gSingleOrderData) {
        $ionicPlatform.ready(function() {
            $ionicDeploy.check().then(function(snapshotAvailable) {
                //console.log(snapshotAvailable);
                if (snapshotAvailable && ENABLE_UPDATE) {
                    var timeout = null;
                    if (!UPDATE_BACKGROUND) {
                        $ionicLoading.show({
                            template:'<p>' + 'Downloading update.' + '</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
                        });
                        timeout = setTimeout(function() {
                            $ionicLoading.hide();
                        }, 10000);
                    }
                    $ionicDeploy.download().then(function() {
                        if (!UPDATE_BACKGROUND) {
                            clearTimeout(timeout);
                            //$ionicLoading.hide();
                            $ionicLoading.show({
                                template:'<p>' + 'Installing update.' + '</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
                            });
                        }
                        return $ionicDeploy.extract().then(function () {
                            if (!UPDATE_BACKGROUND) $ionicLoading.hide();
                            if (RESET_AFTER_UPDATE) $ionicDeploy.load();
                        });
                    });
                }
            });
            ngFB.init({appId : FB_APP_ID});
            // Hide the Splash Screen
            if(navigator.splashscreen){
                setTimeout(function () {
                    navigator.splashscreen.hide();
                }, 100);
            }

            // Detect of Network Connection
            if (window.Connection) {
                // checkConnection();
                if (navigator.connection.type == Connection.NONE) {
                    G_NETSTATE = STATE.NO_INTERNET;
                    //alert("Connect detect : " + STATE.NO_INTERNET);
                }else{
                    G_NETSTATE = STATE.STATE_OK;
                    //alert("Connect detect : " + STATE.STATE_OK);
                }
            }

            function checkConnection() {
                var networkState = navigator.connection.type;

                var states = {};
                states[Connection.UNKNOWN]  = 'Unknown connection';
                states[Connection.ETHERNET] = 'Ethernet connection';
                states[Connection.WIFI]     = 'WiFi connection';
                states[Connection.CELL_2G]  = 'Cell 2G connection';
                states[Connection.CELL_3G]  = 'Cell 3G connection';
                states[Connection.CELL_4G]  = 'Cell 4G connection';
                states[Connection.CELL]     = 'Cell generic connection';
                states[Connection.NONE]     = 'No network connection';

                $ionicPopup.alert({
                    title : 'OrderingApp',
                    template : 'ConnectionType: ' + states[networkState]
                });
            }

            //------------------------------------------------------------

            if(window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                cordova.plugins.Keyboard.disableScroll(false);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }

            // BEGIN New push notification
            /*var push = PushNotification.init({
                android: {
                    senderID: GCM_SENDER_ID
                },
                ios: {
                    alert: "true",
                    badge: true,
                    sound: 'false'
                },
                windows: {}
            });
            push.on('registration', function(data) {
                console.log(data.registrationId);
                GCM_DEVICE_TOKEN = data.registrationId;
            });
            push.on('notification', function(data) {
                console.log(data.message);
                console.log(data.title);
                console.log(data.count);
                console.log(data.sound);
                console.log(data.image);
                console.log(data.additionalData);
                $rootScope.order = data.additionalData;
                $ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/push-confirm-popup.html', {
                    scope: $rootScope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    modal.show();
                    $rootScope.modal = modal;
                });
                $rootScope.offConfirm = function(){
                    $rootScope.modal.hide();
                }
            });*/
            // END New push notification

            // Push Register part -------------------------------------
            /*if (window.plugins && window.plugins.pushNotification) {
                if (ionic.Platform.isAndroid()){
                    window.plugins.pushNotification.register(
                        function(result) {
                            //alert('Push Register : ' + result);
                        },
                        function() {
                            alert('Push Register Error!');
                        },
                        {
                            "senderID": GCM_SENDER_ID,
                            "ecb": "onNotificationGCM"
                        });
                }else if (ionic.Platform.isIOS()){
                    window.plugins.pushNotification.register(
                        function(token){
                            // $ionicPopup.alert({
                            //     title : 'OrderingApp',
                            //     template : 'DeviceID : ' + token
                            // });
                            GCM_DEVICE_TOKEN = token;
                        },
                        function(){},
                        {
                            "badge": true,
                            "sound": true,
                            "alert": true,
                            "ecb":"onNotificationAPN"
                        });
                }

            }*/

            // OneSignal_Push Config---------------------------------
            var notificationOpenedCallback = function(jsonData) {
                //jsonData.notification.payload.additionalData = JSON.parse(jsonData.notification.payload.additionalData);
                //console.log(jsonData);
                if(typeof jsonData.notification.payload.additionalData == 'string') {
                    jsonData.notification.payload.additionalData = JSON.parse(jsonData.notification.payload.additionalData);
                }
                //alert(JSON.stringify(jsonData));
                //alert('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
                if (jsonData.notification.payload.additionalData.type && jsonData.notification.payload.additionalData.type == 1) {
                    $rootScope.notification_data = jsonData.notification.payload;
                    $ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/push-marketing-popup.html', {
                        scope: $rootScope,
                        animation: 'slide-in-up'
                    }).then(function(modal) {
                        modal.show();
                        $rootScope.modal = modal;
                    });
                    $rootScope.offConfirm = function(){
                        $rootScope.modal.hide();
                        $state.go('sideMenu.homeScreen');
                    }

                    $scope.data={};
                    var myPopup = $ionicPopup.show({
                    templateUrl:'templates/order-confirm-popup.html',     
                    scope: $scope,     
                    cssClass:'placeOrderPopup'
                    });
                    myPopup.then(function(res) {
                        console.log('Tapped!', res);
                    });
                    $scope.offConfirm = function(){
                        myPopup.close();   
                        $ionicHistory.clearHistory();
                            $ionicHistory.clearCache().then(function(){ $state.go('sideMenu.homeScreen')});
                    }
                    $scope.closeConfirm = function(){
                        myPopup.close();
                    }
                } else {
                    OrderSvc.getOrderByUser.getOrder({
                        userId : gUserData.getData().id
                    },function (s) {
                        if (s.error == 'false') {
                            for (var i = 0; i < s.result.orders.length; i++){
                                if (s.result.orders[i].id == jsonData.notification.payload.additionalData.order_id) {
                                    console.log(s.result.orders[i]);
                                    s.result.orders[i].data = JSON.parse(s.result.orders[i].data);
                                    gSingleOrderData.setData(s.result.orders[i]);
                                    $state.go('sideMenu.orderDetail');
                                }
                            }
                        }else {
                            MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+': ' + $rootScope.MLanguages.BUSINESS_ORDER);
                        }
                    },function (e) {
                        MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+': ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
                    });
                }
            };

            if (window.plugins && window.plugins.OneSignal){
                //alert('INIT OK!');
                /*window.plugins.OneSignal.init(ONE_SIGNAL_ID,
                    {googleProjectNumber: GCM_SENDER_ID},
                    notificationOpenedCallback);*/

                window.plugins.OneSignal
                    .startInit(ONE_SIGNAL_ID, GCM_SENDER_ID)
                    .handleNotificationOpened(notificationOpenedCallback)
                    .endInit();
                window.plugins.OneSignal.getIds(function(ids) {
                    GCM_DEVICE_TOKEN = ids.pushToken;
                    console.log(GCM_DEVICE_TOKEN);
                });
                window.plugins.OneSignal.enableInAppAlertNotification(true);

                // Show an alert box if a notification comes in when the user is in your app.
                //window.plugins.OneSignal.enableInAppAlertNotification(true);
            }

            //window.plugins.OneSignal.getIds(function(ids) {
            //    alert("PlayerId: " + ids.userId + "PushToken: " + ids.pushToken);
            //    //document.getElementById("GameThrivePlayerId").innerHTML = "PlayerId: " + ids.playerId;
            //    //document.getElementById("GameThrivePushToken").innerHTML = "PushToken: " + ids.pushToken;
            //    console.log('getIds: ' + JSON.stringify(ids));
            //});
        });

    })

    .config(function($stateProvider, $urlRouterProvider, $locationProvider) {

        var layout = (ADDONS.web_template)?'main.':'';
        var view_profile = {};
        if (ADDONS.web_template) {
            view_profile = {
                url: '/sign-up',
                views: {
                    'content': {
                        templateUrl: 'templates/'+ADDONS.template+'/sign-up.html',
                        controller: 'signUpCtrl'
                    }
                }
            }
        } else {
            view_profile = {
                url: '/sign-up',
                templateUrl: 'templates/'+ADDONS.template+'/sign-up.html',
                controller: 'signUpCtrl'
            }
        }
        $stateProvider
            .state('sideMenu',{
                cache: false,
                url : '/side-menu',
                templateUrl : 'templates/'+ADDONS.template+'/side-menu.html',
                controller : 'sideMenuCtrl'
            })
            .state('sideMenu.homeScreen',{
                url : '/home-screen',
                views : {
                    'mainContainer' : {
                        templateUrl : ADDONS.single_business ? 'templates/'+ADDONS.template+'/home-screen-sb.html': 'templates/'+ADDONS.template+'/home-screen-2.html',
                        controller : 'homeScreenCtrl'
                    }
                }
            })
            .state('main',{
                templateUrl: 'templates/'+ADDONS.template+'/layouts/main.html',
            })
            // Web
            .state('main.homeScreenRoot',{
                url : '/',
                views: {
                    'content': {
                        templateUrl: ADDONS.single_business ? 'templates/'+ADDONS.template+'/home-screen-sb.html': 'templates/'+ADDONS.template+'/home-screen-2.html',
                        controller: 'homeScreenCtrl'
                    }
                }
            })
            .state('main.homeScreen',{
                url : '/home',
                views: {
                    'content': {
                        templateUrl: ADDONS.single_business ? 'templates/'+ADDONS.template+'/home-screen-sb.html': 'templates/'+ADDONS.template+'/home-screen-2.html',
                        controller: 'homeScreenCtrl'
                    }
                }
            })
            .state('sideMenu.profile',{
                url: '/profile',
                params: {
                 'tab': 1
                },
                views: {
                    'mainContainer' :{
                        templateUrl: 'templates/'+ADDONS.template+'/my-account-profile.html',
                        controller: 'profileCtrl'
                    }
                }
            })
            // Web
            .state(layout+'profile',{
                url: '/profile',
                params: {
                 'tab': 0
                },
                views: {
                    'content': {
                        templateUrl: 'templates/'+ADDONS.template+'/my-account-profile.html',
                        controller: 'profileCtrl'
                    }
                }
            })
            .state('sideMenu.setting',{
                url: '/setting',
                views: {
                    'mainContainer' :{
                        templateUrl: 'templates/'+ADDONS.template+'/my-account-setting.html',
                        controller: 'settingCtrl'
                    }
                }
            })
            .state('sideMenu.support-&-info',{
                url: '/support-&-info',
                views: {
                    'mainContainer' :{
                        templateUrl: 'templates/'+ADDONS.template+'/support-&-info.html',
                        controller: 'support&infoCtrl'
                    }
                }
            })
            .state('sideMenu.address-book',{
                url: '/address-book',
                views: {
                    'mainContainer' :{
                        templateUrl: 'templates/'+ADDONS.template+'/my-address-book.html',
                        controller: 'addressCtrl'
                    }
                }
            })
            .state('sideMenu.myOrder',{
                url: '/my-order',
                views: {
                    'mainContainer' :{
                        templateUrl: 'templates/'+ADDONS.template+'/my-order.html',
                        controller: 'orderCtrl'
                    }
                }
            })
			.state('sideMenu.myCard',{
                url: '/my-card',
                views: {
                    'mainContainer' :{
                        templateUrl: 'templates/'+ADDONS.template+'/my-card.html',
                        controller: 'cardCtrl'
                    }
                }
            })
			.state('sideMenu.cardDetail',{
                url: '/card-detail',
                views: {
                    'mainContainer':{
                        templateUrl: 'templates/'+ADDONS.template+'/my-card-details.html',
                        controller: 'cardDetailCtrl'
                    }
                }
            })
            .state('sideMenu.orderDetail',{
                url: '/order-detail',
                views: {
                    'mainContainer':{
                        templateUrl: 'templates/'+ADDONS.template+'/my-order-detail.html',
                        controller: 'orderDetailCtrl'
                    }
                }
            })
            .state('ordering',{
                //cache: false,
                //url: '/ordering',
                templateUrl: 'templates/'+ADDONS.template+'/order-home.html',
                controller: 'orderingCtrl'
            })
			/*.state('addMyCardDetails',{
                //cache: false,
                url: '/cardDetails',
                templateUrl: 'templates/'+ADDONS.template+'/my-card-details.html',
                controller: 'orderingCardCtrl'
            })*/

            /*.state('search', {
                url: '/search/type/:order_type/address/:address',
                templateUrl: 'templates/'+ADDONS.template+'/order-rest-search.html',
                controller: 'searchCtrl'
            })*/

            .state('main.search',{
                url: '/search/type/:order_type/address/:address',
                views: {
                    'content': {
                        templateUrl: 'templates/'+ADDONS.template+'/order-rest-search.html',
                        controller: 'searchCtrl'
                    }
                }
            })

            .state('restaurantSearch',{
                cache : false,
                //url: '/search-rest',
                templateUrl: 'templates/'+ADDONS.template+'/order-rest-search.html',
                controller: 'searchCtrl'
            })
            .state('mobileDetailRest',{
                url: '/detail-rest',
                templateUrl: 'templates/'+ADDONS.template+'/order-rest-menu.html',
                controller: 'detailRestCtrl'
            })
            //Web
            .state('detailRest',{
                url: '/detail-rest-web',
                templateUrl: 'templates/'+ADDONS.template+'/order-rest-menu.html',
                controller: 'detailRestCtrl'
            })
            /*
            .state('ordering.detailMenu',{
                cache : false,
                //url: '/detail-menu',
                views: {
                    'orderContainer' :{
                        templateUrl: 'templates/'+ADDONS.template+'/order-rest-menu-detail.html',
                        controller: 'detailMenuCtrl'
                    }
                }
            })
*/
            .state('ordering.checkOut',{
                //url: '/order-checkout',
                views: {
                    'orderContainer' :{
                        templateUrl: 'templates/'+ADDONS.template+'/order-checkout.html',
                        controller: 'checkOutCtrl'
                    }
                }
            })

            .state(layout+'login',{
                url: '/login',
                views: {
                    'content': {
                        templateUrl: 'templates/'+ADDONS.template+'/sign-in.html',
                        controller: 'signUpCtrl'
                    }
                }
            })

            .state(layout+'signUp', view_profile)

            .state('signUp.register',{
                url: '/register',
                views: {
                    'userContainer' :{
                        templateUrl: 'templates/'+ADDONS.template+'/register.html',
                        controller: 'registerCtrl'
                    }
                }
            })

            .state('finalCheckOut',{
                cache: false,
                //url: '/order-final-checkout',
				params: {
				 'addCardstripe': false
			   },
                templateUrl: 'templates/'+ADDONS.template+'/order-checkout-popup.html',
                controller: 'finalCheckOutCtrl'
            })

            .state(layout+'checkOut',{
                cache: false,
                url: '/checkout',
                params: {
                 'addCardstripe': false
                },
                views: {
                    'content': {
                        templateUrl: 'templates/'+ADDONS.template+'/order-checkout-popup.html',
                        controller: 'finalCheckOutCtrl'
                    }
                }
            })

            .state(layout+'confirm',{
                //cache: false,
                url: '/confirm-order',
                views: {
                    'content': {
                        templateUrl: 'templates/'+ADDONS.template+'/order-confirm-popup.html',
                        controller: 'confirmCtrl'
                    }
                }
            })

            .state(layout+'notfound',{
                //cache: false,
                url: '/404',
                views: {
                    'content': {
                        templateUrl: 'templates/'+ADDONS.template+'/404.html',
                        controller: 'notfoundCtrl'
                    }
                }
            })

            .state(layout+'business',{
                url: '/{business:[0-9a-zA-Z_-]+}',
                views: {
                    'content': {
                        templateUrl: 'templates/'+ADDONS.template+'/order-rest-menu.html',
                        controller: 'businessCtrl'
                    }
                }
            })

            if (!ADDONS.web_template) $urlRouterProvider.otherwise('/side-menu/home-screen');
            else {
                $urlRouterProvider.otherwise('/');
                $locationProvider.html5Mode(WEB_ADDONS.remove_hash);
            }
    })

    .constant('shopSettings',{

        //payPalSandboxId :'Aar8HZzvc5NztVWodTBpOiOod9wWrBDrJUjyvRr4WsxcCD28xYig7oecfYsqxQUDu5QHptPpSALirxZD',
        payPalSandboxId :'AYm-lSHMp7nvRnauOYWlWC1iUXqVZQ6rnihaqcBbTJozNr67JK3z5ZdgXTkp67Xi0k0Ud5x1YTU8de2w',  // For testing 

        payPalProductionId : 'production id here',

        payPalEnv: 'PayPalEnvironmentSandbox', // for testing production for production

        payPalShopName : 'OrderingCo.Shop',

        payPalMerchantPrivacyPolicyURL : 'url to policy',

        payPalMerchantUserAgreementURL : 'url to user agreement'

    })
	
	.constant('PAYMENT_GATWAY_KEY',{
		StripeApiSetKey: '',
		Stripepermissiom : false,
        StripeKey: '' 
		})
	.constant('ADDONS', ADDONS)
		
    .constant('API_ENDPOINT', {
        user: API_URL +'/data/user/'+API_PROJECT_NAME,
        driver: API_URL +'/data/driver/'+API_PROJECT_NAME,
        checkout: API_URL +'/data/checkout/'+API_PROJECT_NAME+'/checkout',
        order: API_URL +'/data/order/'+API_PROJECT_NAME,
        business: API_URL +'/data/business/'+API_PROJECT_NAME+'/business',
        country: API_URL +'/data/country/'+API_PROJECT_NAME,
        menu : API_URL +'/data/menu/'+API_PROJECT_NAME+'/menu',
        product: API_URL +'/data/product/'+API_PROJECT_NAME,
        notification : API_URL +'/data/push/'+API_PROJECT_NAME,
        language : API_URL +'/data/language/'+API_PROJECT_NAME,
		//cardget : ROOT_URL + '/appsteam/cardbyid',
		paymentmethod : API_URL +'/data/payment/'+API_PROJECT_NAME+'/paymethodcall',

		//cardDelete : ROOT_URL + '/appsteam/paymentgatway/stripe/stripepaymentDeleteCustomer',
		//carddefaultSet: ROOT_URL + '/appsteam/paymentgatway/stripe/stripepaymentdefaultcard',
		//stripeinfo :API_URL + '/v1/order/track',
        cityget : API_URL +'/data/country/'+API_PROJECT_NAME+'/allcity',
        neighget : API_URL +'/data/business/'+API_PROJECT_NAME+'/neighbourhoodbycity',
        neighSearchResult : API_URL +'/data/business/'+API_PROJECT_NAME+'/businessbyneighbourhood',
        sendmailprinter : API_URL +'/data/order/'+API_PROJECT_NAME+'/sendemail_order',
        discount: API_URL +'/data/order/'+API_PROJECT_NAME+'/discountcode',
        currencyget : API_URL +'/data/payment/'+API_PROJECT_NAME+'/currency',
        //  For a simulator use: url: 'http://127.0.0.1:8080/api'

        payment: {
            rooturl : API_URL +'/data/payment/'+API_PROJECT_NAME,
            stripe :{
                cardget : API_URL +'/data/payment/'+API_PROJECT_NAME+'/stripe/cardbyid',
                carddefaultSet : API_URL +'/data/payment/'+API_PROJECT_NAME+'/stripe/stripepaymentdefaultcard',
                cardDelete : API_URL +'/data/payment/'+API_PROJECT_NAME+'/stripe/stripepaymentdeletecustomer',
                addcustomer : API_URL +'/data/payment/'+API_PROJECT_NAME+'/stripe/stripepaymentAddCustomer',
                stripepaymentprocess : API_URL +'/data/payment/'+API_PROJECT_NAME+'/stripe/stripepaymentprocess'
            },
            PaypalAdaptive :{
                calling : API_URL +'/data/payment/'+API_PROJECT_NAME+'/paypaladaptive/samples/SimpleSamples/ParallelPay'                
            }
        },

        test : 'http://192.168.1.112:8080/'
    });

