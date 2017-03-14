/**
 * Created by STORM on 2/8/2016.
 */


/*if (ADDONS.web_template) {
	setInterval(function () {
		var footer = $('.footer').last();
		var content = $('ion-content.pane').last();
		var pos_top = footer.position().top + content.scrollTop();
		if (pos_top < $(window).height()) {
			footer.css({
				'margin-top': $(window).height()-pos_top-footer.outerHeight()
			});
		} else {
			footer.css({
				'margin-top': 0
			});
		}
	}, 100);
}*/

$(window).bind('hashchange', function() {
	console.log(history.length);
	//history.go(-(history.length - 1));
	//history.pushState(null, null, document.URL);
});

var app_states = {
	homeScreen: ADDONS.web_template ? 'main.homeScreen': 'sideMenu.homeScreen',
	profile: ADDONS.web_template ? 'main.profile': 'sideMenu.profile',
	finalCheckOut: ADDONS.web_template ? 'main.checkOut': 'finalCheckOut'
}

angular.module('orderingApp.controllers',['ngOpenFB','google.places','ti-segmented-control'])
	.directive('ngCache', function(ADDONS) {

		return {
			restrict: 'A',
			link: function(scope, el, attrs) {
				if (ADDONS.images_cache) {
					attrs.$observe('ngSrc', function(src) {

						ImgCache.isCached(src, function(path, success) {
							if (success) {
								ImgCache.useCachedFile(el);
							} else {
								ImgCache.cacheFile(src, function() {
									ImgCache.useCachedFile(el);
								});
							}
						});

					});
				}
			}
		};
	})
	.controller('rootCtrl', function ($scope, $rootScope, $state, gBusinessData, gStates, gOrder, $ionicHistory, gUserData, 
									LanguageSvc, MyLoading, MyAlert, $ionicSideMenuDelegate, $ionicModal, GeoCoderSvc,
									BusinessSvc, gCurRestaurant, gNearService, GeolocationSvc, AddressLookupSvc, gMyLatLng,
									LocationService) {
		LOGIN_STATE = (localStorageApp.getItem(STORE_VAL.LOGIN) && localStorageApp.getItem(STORE_VAL.LOGIN) == 'true');
		$scope.ADDONS = ADDONS;
		$scope.state = {
			loginState : LOGIN_STATE
		};
		$rootScope.MLanguages = {};
		$scope.MLanguages = {};

		$rootScope.myOrder = {
			curAddress: (gNearService.getData().nearAddress)?gNearService.getData().nearAddress:''
		};
		$rootScope.curDataOrder = {
			type: (gNearService.getData().orderType)?gNearService.getData().orderType:'delivery',
			address: $rootScope.myOrder.curAddress
		};

		$scope.layout = ADDONS.web_template?'main.':'';

		$scope.numCart = 0;

		$rootScope.refreshNumCart = function () {
			$scope.numCart = 0;
			for (var i = 0; i < gOrder.getData().length; i++) {
				$scope.numCart += gOrder.getData()[i].quantity;
			}
		}

		$rootScope.getCurrencySymbol = function (currency_str) {
			return getCurrencySymbol(currency_str);
		}

		$rootScope.refreshNumCart();

		$rootScope.onCart = function () {
			if (gOrder.getData().length > 0) window.location = ((WEB_ADDONS.remove_hash)?'':'#')+'/'+gOrder.getData()[0].slug;
		}

		$rootScope.getLanguage = function (callback) {
			var lang = localStorageApp.getItem(STORE_VAL.LANG);
			var dictionary = localStorageApp.getItem(STORE_VAL.DICTIONARY);
			var lang_list = localStorageApp.getItem(STORE_VAL.LANG_LIST);
			var reset_lang = localStorageApp.getItem(STORE_VAL.RESET_LANG);
			var date = new Date();
			if (!lang || !dictionary || !lang_list || !reset_lang || reset_lang < date.getTime()) {
				LanguageSvc.getLanguageList.getInfo({},function (res) {
					if (res.error == 'false') {
						var lang = localStorageApp.getItem(STORE_VAL.LANG);
						if (!lang) {
							lang = res.result.default.id;
							localStorageApp.setItem(STORE_VAL.LANG, res.result.default.id);
						}
						var languages = [];
						for (var i = 0; i < res.result.languages.length; i++) {
							if (res.result.languages[i].enabled) languages.push(res.result.languages[i]);
						}
						LanguageSvc.getMultiLanguage.getInfo({
							lang : lang
						},function (res) {
							if (res.error == 'false') {
								localStorageApp.setItem(STORE_VAL.DICTIONARY, JSON.stringify(res.result.languages));
								localStorageApp.setItem(STORE_VAL.LANG_LIST, JSON.stringify(languages));
								date = new Date();
								localStorageApp.setItem(STORE_VAL.RESET_LANG, (date.getTime()+1000*60*5));
								$rootScope.LangList = languages;
								$rootScope.cur_lang = lang;
								$rootScope.MLanguages = res.result.languages;
								$scope.MLanguages = res.result.languages;
								callback(null, languages, res.result.languages);
							} else {
								callback(new Error('Error getting dictionary.'));
							}
						});
					} else {
						callback(new Error('Error getting list of languages.'));
					}
				});
			} else {
				$rootScope.LangList = JSON.parse(lang_list);
				$rootScope.cur_lang = lang;
				$rootScope.MLanguages = JSON.parse(dictionary);
				$scope.MLanguages = JSON.parse(dictionary);
				callback(null, JSON.parse(lang_list), JSON.parse(dictionary));
			}
		}

		$rootScope.selectLanguage = function (id) {
			$rootScope.cur_lang = id;
			localStorageApp.setItem(STORE_VAL.LANG, id);
			localStorageApp.setItem(STORE_VAL.RESET_LANG, 0);
			MyLoading.show($rootScope.MLanguages.MOBILE_FRONT_LOAD_LOADING);
			LanguageSvc.getMultiLanguage.getInfo({
				lang : id
			},function (s) {
				MyLoading.hide();
				$scope.MLanguages = s.result.languages;
				$rootScope.MLanguages = s.result.languages;
				$scope.MLanguages = s.result.languages;
				//location.reload();
			},function (e) {
				MyLoading.hide();
			});
		}

		$rootScope.loadGoogleMaps = function (callback) {
			var interval = setInterval(function () {
				if (typeof google == 'undefined') {}
				else {
					clearInterval(interval);
					callback();
				}
			}, 100);
		}

		$rootScope.orderTypelist = [
			{name:"Delivery", value:'delivery', selected:''},
			{name:"Pickup", value:'pickup', selected:'selected'}/*,
			 {name:"Reservation", value:'reservation', selected:''}*/
			 
		];
		//$scope.isActive = false;
		/*
		
		$scope.selectOrderType = function(item){
			//alert("hi");
			$scope.selected = item; 
			$scope.myOrder.orderType = item.value;

			console.log(item.value);
			
			//console.log($rootScope.selectOrderType);
		}
		$scope.isActive = function(item) {
	       return $scope.selected === item;
		};
		*/
		$scope.selectOrderType = function(itemType){
			
			$scope.myOrder.orderType = itemType;
			console.log($scope.myOrder.orderType);
		}
		$scope.isActive = function(itemType) {
			 if($scope.myOrder.orderType == itemType){
				 return true;
			 }else{
				 return false;
			 }
		};

console.log($scope.selectOrderType);

		/*$rootScope.getLanguage(function (err, list, dictionary) {
			if (err) MyAlert(err);
			else {
				console.log(list, dictionary);
			}
		});*/

		$rootScope.parseOptions = function (options) {
			console.log('parseOptions');
			options = options.split('_@_');
			options.splice(0,1);
			//console.log(options);
			var p_options = {};
			for (var i = 0; i < options.length; i++) {
				var option = options[i].split('@u@');
				var select = option[1].split('    ');
				if (p_options[option[0]] == undefined) p_options[option[0]] = [];
				p_options[option[0]].push({name: select[0], price: select[1]});
			}
			return p_options;
		}

		$rootScope.parseSuboptions = function (options) {
			var html = "";
			for (var i = 0; i < options.length; i++) {
				html += options[i].name+((options[i].price != undefined)?' '+options[i].price:'')+"<br>";
			}
			return html;
		}

		$rootScope.scrollToAlert = function () {
			setTimeout(function () {
				var ealert = $('.popup-container.popup-showing.active').last();
				var popup = ealert.find('.popup').last();
				//console.log(ealert);
				//console.log($('body').scrollTop(), $(window).outerHeight(), popup.outerHeight());
				var mtop = $('body').scrollTop()+(($(window).outerHeight()-popup.outerHeight())/2);
				//console.log(mtop);
				ealert.css({ bottom: 'auto', top: mtop });
			}, 100);
		}

		$rootScope.scrollToLoading = function () {
			setTimeout(function () {
				var eloading = $('.loading-container.visible.active').last();
				var load = eloading.find('.loading').last();
				//console.log(eloading);
				//console.log($('body').scrollTop(), $(window).outerHeight(), load.outerHeight());
				var mtop = $('body').scrollTop()+(($(window).outerHeight()-load.outerHeight())/2);
				//console.log(mtop);
				eloading.css({ bottom: 'auto', top: mtop });
			}, 100);
		}

		$rootScope.getLogState = function () {
			//console.log(localStorageApp.getItem(STORE_VAL.LOGIN));
			return (LOGIN_STATE);
		};

		$rootScope.onGoHome = function(){
			$rootScope.homeRequired = true;
			$state.go('sideMenu.homeScreen');
		};

		$rootScope.onGoLogin = function(){
			if (gStates.getState() != STATE.ORDERING) gStates.setState(STATE.PROFILE);
			if (!LOGIN_STATE){
				$state.go('main.login');
			}else {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go(app_states.profile);
			}
		};

		$rootScope.onGoMyProfile = function(tab){
			if (!tab) tab = 0;
			if (gStates.getState() != STATE.ORDERING) gStates.setState(STATE.PROFILE);
			if (!LOGIN_STATE){
				console.log($scope.layout+'signUp');
				gStates.setState(STATE.PROFILE);
				$state.go($scope.layout+'signUp');
			}else {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go(app_states.profile, { 'tab': tab });
			}
		};

		$rootScope.onSignOut = function () {
			LOGIN_STATE = false;
			$scope.state.loginState = LOGIN_STATE;

			// localStorageApp.setItem(STORE_VAL.LOGIN, 'false');
			// localStorageApp.setItem(STORE_VAL.USR_ID, '');
			localStorageApp.removeItem(STORE_VAL.LOGIN);
			localStorageApp.removeItem(STORE_VAL.USR_ID);
			localStorageApp.removeItem(STORE_VAL.LOGIN_ACCOUNT);
			localStorageApp.removeItem(STORE_VAL.IS_FBUSER);
			localStorageApp.removeItem(STORE_VAL.USER_DATA);


			var buff = {};
			gUserData.setData(buff);
			if (ADDONS.web_template) {
				$state.go(app_states.homeScreen);
			} else {
				$ionicSideMenuDelegate.toggleLeft();
				$ionicHistory.nextViewOptions({
					historyRoot: true,
					disableAnimate: true,
					expire: 300
				});
			}
		}

		$rootScope.onAutoCompleteAddress = function() {
			console.log("onAutoCompleteAddress");
			setTimeout(function() {
				if (typeof document.getElementsByClassName('backdrop')[0] != 'undefined' &&
					typeof document.getElementsByClassName('pac-container')[0] != 'undefined')
				{
					for (var i = 0; i < document.getElementsByClassName('pac-container').length; i++){
						document.getElementsByClassName('pac-container')[i].setAttribute('data-tap-disabled', true);
					}
					for (i = 0; i < document.getElementsByClassName('backdrop').length; i++){
						document.getElementsByClassName('backdrop')[i].setAttribute('data-tap-disabled', true);
					}
				}
			}, 100);
		};

		$rootScope.showSelectAddress = function (callback) {
			$scope.callback = callback;
			if ($scope.addr_modal) $scope.addr_modal.remove();
			var curType = $scope.curDataOrder.type;
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/select-address-business.html', {
				scope: $scope,
				animation: 'slide-in-up',
				backdropClickToClose: false
			}).then(function(addr_modal) {
				$scope.addr_modal = addr_modal;
				$scope.addr_modal.show().then(function () {
					$scope.curDataOrder.type = curType;
					$scope.curDataOrder.address = $scope.myOrder.curAddress;
					//scrollToMiddle();
					window.scrollTo(0, 0);
					disableScroll();
					setTimeout(function () {
						$($(".pac-container")[$(".pac-container").length-1]).appendTo(".modal-backdrop");
					}, 200);
				});
				$scope.$on('modal.hidden', function() {
					enableScroll();
				});
			});
		}

		$rootScope.checkAddress = function (order, callback) {
			console.log(order, (order.type == 'delivery')?1:0);
			MyLoading.show();
			GeoCoderSvc.getCountryCityFromAddress(order.address).then(function (s) {
				BusinessSvc.getByCondition.charge({
					lang        : localStorageApp.getItem(STORE_VAL.LANG),
					type        : order.type,
					country     : s.country,
					city        : s.city,
					address     : order.address,//$scope.myOrder.curAddress,
					latitude    : s.location.lat,
					longitude   : s.location.lng
				},function (res) {
					console.log(res);
					if (res.error == false) {
						var sw = false;
						for (var i = 0; i < res.result.businesses.length; i++) {
							//console.log(res.result.businesses[i].id == gBusinessData.getData().business[0].id);
							if (res.result.businesses[i].id == gBusinessData.getData().business[0].id) {
								sw = true;
								break;
							}
						}
						if (sw) {
							console.log(s);
							var buffMyLatLng = gMyLatLng.getData();
							if (!ADDONS.advanced_search) {
								buffMyLatLng.lat = s.location.lat;
								buffMyLatLng.lng = s.location.lng;
							}
							buffMyLatLng.cityname = s.city;
							gMyLatLng.setData(buffMyLatLng);
							var nearService = {};
							nearService.nearAddress = order.address;
							nearService.nearCount = res.result.businesses.length;
							nearService.orderType = order.type;
							nearService.whereAll = '';
							gNearService.setData(nearService);
							$scope.hideSelectAddress();
							if (callback) callback(true);
						} else MyAlert.show($scope.MLanguages.BUSINESS_NOT_DELIVER);
					} else MyAlert.show($scope.MLanguages.BUSINESS_NOT_DELIVER);
					MyLoading.hide();
				});
			},function (e) {
				MyLoading.hide();
				MyAlert.show(e);
				callback(false);
			});
		}

		$rootScope.hideSelectAddress = function () {
			if ($scope.addr_modal) {
				console.log("Hide modal");
				$scope.addr_modal.hide();
				$scope.addr_modal.remove();
			}
		}



		var map = null;
		var marker = null;
		var infowindow = null;
		var intervalmap = null;
		$scope.showModal = function () {
			$scope.hideSelectAddress();
			if ($scope.modal) {
				$scope.modal.remove();
			}
			$("#map").remove();
			var pos_element = 1;
			$($("[googleplace]")[pos_element]).remove();
			$('ion-modal-view ion-content').remove();
			//$($(".pac-container")[1]).remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/advanced-search-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show().then(function () {
					$("#rest-full-address").blur();
					var content = $('ion-modal-view ion-content');
					var div = document.getElementById('map');
					var height = content.height();
					var width = content.width();
					$("#map").height(height);
					$("#map").width(width);
					intervalmap = setInterval(function () {
						//console.log(content);
						//console.log($("#map").width(), $("#map").height(), content.width(), content.height());
						if ((height != content.height() || width != content.width()) || (height != $("#map").height() || width != $("#map").width())) {
							console.log("Cambio");
							height = content.height();
							width = content.width();
							$("#map").height(content.height());
							$("#map").width(content.width());
							google.maps.event.trigger(map, 'resize');
						}
					}, 100);
					var options = {
						types: []
					};
					var elements = $("[googleplace]");
					var autocomplete = new google.maps.places.Autocomplete(elements[pos_element], options);
					autocomplete.addListener('place_changed', function() {
						console.log(autocomplete.getPlace().formatted_address);
						$scope.myOrder.curAddress = autocomplete.getPlace().formatted_address;
						reloadMap(map, marker, infowindow, autocomplete.getPlace().geometry.location, autocomplete.getPlace().formatted_address)
						LocationService.searchAddress($scope.myOrder.curAddress).then(function(result) {
							//$scope.search.error = null;
							//$scope.search.suggestions = result;
							//console.log(result[0]);
							$scope.tmp_googleplace = result[0];
						}, function(status){
							//$scope.search.error = "There was an error :( " + status;
							console.log("error" + status);
						});
					});
					setTimeout(function () {
						$($(".pac-container")[$(".pac-container").length-1]).appendTo(".modal-backdrop");
					}, 200);
					function reloadMap(p_map, p_marker, p_infowindow, position, content) {
						map = new google.maps.Map(document.getElementById('map'), {
						  zoom: 18,
						  center: position
						});
						marker = new google.maps.Marker({
						  position: position,
						  map: map
						});
						infowindow = new google.maps.InfoWindow({
							content: parseAddress($scope.myOrder.curAddress),
							disableAutoPan: true
						});
						google.maps.event.clearListeners(map,'center_changed');
						map.addListener('center_changed', function() {
							//console.log(map.getCenter());
							setTimeout(function () {
								if (!$scope.isFocusDir) {
									console.log("Center 1");
									marker.setPosition(map.getCenter());
									AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
										MyLoading.hide();
										swres = true;
										$scope.location = {
											address : addr.address,
											location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
										};
										gMyLatLng.setData($scope.location.location);
										$scope.myOrder.curAddress = $scope.location.address;
										if (infowindow) infowindow.close();
										infowindow = new google.maps.InfoWindow({
											content: parseAddress($scope.location.address),
											disableAutoPan: true
										});
										infowindow.open(map, marker);
									},function(error){
										MyLoading.hide();
										swres = true;
										$scope.myOrder.curAddress = ADDRESS.street;
										MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
									});
								}
							}, 300);
						});
						infowindow.open(map, marker);
					}
					$scope.myOrder.curAddress = ADDRESS.street;
					var uluru = { lat: ADDRESS.latitude, lng: ADDRESS.longitude };
					map = new google.maps.Map(document.getElementById('map'), {
					  zoom: 18,
					  center: uluru
					});
					marker = new google.maps.Marker({
					  position: map.getCenter(),
					  map: map
					});
					map.addListener('center_changed', function() {
						//console.log(map.getCenter());
						setTimeout(function () {
							if (!$scope.isFocusDir) {
								console.log("Center 2");
								marker.setPosition(map.getCenter());
								AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
									MyLoading.hide();
									swres = true;
									$scope.location = {
										address : addr.address,
										location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
									};
									gMyLatLng.setData($scope.location.location);
									$scope.myOrder.curAddress = $scope.location.address;
									infowindow.close();
									infowindow = new google.maps.InfoWindow({
										content: parseAddress($scope.location.address),
										disableAutoPan: true
									});
									infowindow.open(map, marker);
								},function(error){
									MyLoading.hide();
									swres = true;
									$scope.myOrder.curAddress = ADDRESS.street;
									MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
								});
							}
						}, 300);
					});
					map.addListener('resize', function() {
						//console.log(map.getCenter());
						map = new google.maps.Map(document.getElementById('map'), {
							zoom: 18,
							center: uluru
						});
						marker = new google.maps.Marker({
							position: map.getCenter(),
							map: map
						});
						map.addListener('center_changed', function() {
							//console.log(map.getCenter());
							setTimeout(function () {
								if (!$scope.isFocusDir) {
									console.log("Center 3");
									marker.setPosition(map.getCenter());
									AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
										MyLoading.hide();
										swres = true;
										$scope.location = {
											address : addr.address,
											location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
										};
										gMyLatLng.setData($scope.location.location);
										$scope.myOrder.curAddress = $scope.location.address;
										infowindow.close();
										infowindow = new google.maps.InfoWindow({
											content: parseAddress($scope.location.address),
											disableAutoPan: true
										});
										infowindow.open(map, marker);
									},function(error){
										MyLoading.hide();
										swres = true;
										$scope.myOrder.curAddress = ADDRESS.street;
										MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
									});
								}
							}, 300);
						});
					});
					infowindow = new google.maps.InfoWindow({
						content: parseAddress($scope.myOrder.curAddress),
						disableAutoPan: true
					});
					MyLoading.show($scope.MLanguages.MOBILE_FETCHING);
					var swres = false;
					GeolocationSvc().then(function(position) {
						AddressLookupSvc.lookupByAddress(position.lat, position.lng).then(function(addr) {
							MyLoading.hide();
							swres = true;
							$scope.location = {
								address : addr.address,
								location : { lat : position.lat, lng : position.lng, zip : addr.zip }
							};
							gMyLatLng.setData($scope.location.location);
							$scope.myOrder.curAddress = $scope.location.address;
							map = new google.maps.Map(document.getElementById('map'), {
								zoom: 18,
								center: { lat : position.lat, lng : position.lng, zip : addr.zip }
							});
							marker = new google.maps.Marker({
								position: { lat : position.lat, lng : position.lng, zip : addr.zip },
								map: map
							});
							if (infowindow) infowindow.close();
							infowindow = new google.maps.InfoWindow({
								content: parseAddress($scope.location.address),
								disableAutoPan: true
							});
							infowindow.open(map, marker);
							map.addListener('center_changed', function() {
								//console.log(map.getCenter());
								setTimeout(function () {
									if (!$scope.isFocusDir) {
										marker.setPosition(map.getCenter());
										AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
											MyLoading.hide();
											swres = true;
											$scope.location = {
												address : addr.address,
												location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
											};
											gMyLatLng.setData($scope.location.location);
											$scope.myOrder.curAddress = $scope.location.address;
											infowindow.close();
											infowindow = new google.maps.InfoWindow({
												content: parseAddress($scope.location.address),
												disableAutoPan: true
											});
											infowindow.open(map, marker);
										},function(error){
											MyLoading.hide();
											swres = true;
											$scope.myOrder.curAddress = ADDRESS.street;
											MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
										});
									}
								}, 300);
							});
						},function(error){
							MyLoading.hide();
							swres = true;
							$scope.myOrder.curAddress = ADDRESS.street;
							MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
						});

					},function(err){
						MyLoading.hide();
						$scope.myOrder.curAddress = ADDRESS.street;
						swres = true;
						MyAlert.show(err.message);
					});
					setTimeout(function () {
						if (!swres) {
							MyLoading.hide();
							$scope.myOrder.curAddress = ADDRESS.street;
							MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
						}
					}, 10000);

				});
			});
		};

		function parseAddress(address) {
			var pos = address.indexOf(',');
			if (pos != -1) {
				var parts = address.split(',');
				address = parts[0];
				for (var i = 1; i < parts.length; i++) {
					address += '<br>'+parts[i];
				}
			}
			return address;
		}

		$scope.cleanAddress = function () {
			$scope.myOrder.curAddress = '';
		}

		/*$scope.$on('modal.hidden', function() {
			$scope.hideModal();
		});*/

		$scope.hideModal = function () {
			if ($scope.modal != null && $scope.modal.isShown()) $scope.modal.hide();
			if (map) {
				google.maps.event.clearListeners(map,'center_changed');
			}
			map = null;
			marker = null;
			infowindow = null;
			clearInterval(intervalmap);
		};

		$scope.findRest = function () {
			$scope.hideModal();
			$scope.showSelectAddress($scope.callback);
		}

		$scope.openMap = function () {
			if ($scope.ADDONS.advanced_search) {
				if (typeof cordova !== undefined) return $scope.showModal();
				cordova.plugins.diagnostic.isLocationAvailable(function(available){
					if (available) {
						console.log("Pedir permiso.");
						cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
							switch(status){
								case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
									console.log("Permission not requested");
									break;
								case cordova.plugins.diagnostic.permissionStatus.GRANTED:
									console.log("Permission granted");
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED:
									console.log("Permission denied");
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
									console.log("Permission permanently denied");
									break;
								case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
									console.log("Permission granted only when in use");
									break;
							}
							$scope.showModal();
						}, function(error){
							console.error("Error: "+error);
						}, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);
					} else {
						console.log("Pedir permiso GSP.");
						cordova.plugins.locationAccuracy.canRequest(function(canRequest){
							if(canRequest){
								cordova.plugins.locationAccuracy.request(function(){
									console.log("Request successful");
									$scope.openMap();
								}, function (error){
									$scope.showModal();
								}, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
								);
							}
						});
					}
				}, function(error){
					console.log("Error GPS.");
					$scope.showModal();
				});
			}
		}
	})
	.controller('homeScreenCtrl', function($scope, $state, $rootScope, $http, $filter, $ionicPlatform, $ionicLoading, $timeout, $ionicPopup,
										   UserSvc, MyAlert, BusinessSvc, GeoCoderSvc, MyLoading,$ionicViewSwitcher,
										   $ionicModal, $ionicHistory, gNearService, gAllBusiness,
										   gMyLatLng, gStates, ionicReady, gUserData, PushNotificationSvc,
										   GeolocationSvc, AddressLookupSvc, LanguageSvc, ModalSvc, LocationService, UserSvc, ngFB, ADDONS, 
										   AllNeighFech, AllCityFech, MenuSvc, gCurRestaurant, $timeout, gMyAddress){

		$scope.ADDONS = ADDONS;
		$scope.SEARCH_BY_ADDRESS = SEARCH_BY_ADDRESS;
		$scope.choosedAddress = false;
		$scope.onTestButton = function () {
			ModalSvc.setModalView('templates/'+ADDONS.template+'/order-confirm-popup.html');
		};
		$scope.cleanAddress = function ($event) {
			//$event.preventDefault();
			//$event.stopPropagation()
			$scope.myOrder.curAddress = '';
			/*console.log($('#dirMap'));
			$('#dirMap').focus();*/
			$scope.isFocusDir = true;
		}

		$scope.$on('$ionicView.enter',function(){
			//alert('Entered');
			//localStorageApp.setItem('LangId','1');

			initView();
			document.getElementById('MenuButton').classList.remove('hide');
		});

		function initView() {
			if (REMEMBER_LAST_ADDRESS && !ADDONS.web_template && !$rootScope.homeRequired && gMyAddress.getData().formatted_address && gNearService.getData().nearAddress && gMyLatLng.getData().lat) {
				$rootScope.homeRequired = false;
				$state.go('restaurantSearch');
			}
			if (ADDONS.web_template && WEB_ADDONS.welcome_fullscreen) {
				if ($(window).height()-$('.navbar').height() > $('.welcome .content').height()) {
					$('.welcome').height($(window).height()-$('.navbar').height());
				}
			}
			if (typeof gUserData.getData().id == 'undefined'){
				//alert(localStorageApp.getItem(STORE_VAL.USR_ID));
				/*if (localStorageApp.getItem(STORE_VAL.USR_ID) != null &&
				 localStorageApp.getItem(STORE_VAL.USR_ID) != '' &&
				 localStorageApp.getItem(STORE_VAL.USR_ID) != 'undefined'){

				 $scope.show();
				 UserSvc.getUserByID.get({
				 Id : localStorageApp.getItem(STORE_VAL.USR_ID),
				 lang : '1'
				 },function (resp) {
				 gUserData.setData(resp.result);
				 LOGIN_STATE = true;
				 $scope.myOrder.curAddress = resp.result.street;
				 $scope.hide();
				 },function (e) {
				 MyAlert.show("Error due to" + e.statusText);
				 console.log(e);
				 });

				 }else{
				 $scope.myOrder.curAddress = '';
				 }*/
			}else {
				$scope.myOrder.curAddress = gUserData.getData().street;
			}
			if (typeof $rootScope.buyerInfo == 'undefined'){

				$rootScope.buyerInfo = {
					"id" : "",
					"address" :"",
					"city" :"",
					"cityname" :"",
					"tax" : "",
					"taxtype" : "",
					"deliveryType" :"",
					"deliverydate" :"ASAP",
					"comments" : "",
					"name" :"",
					"lastname2" :"",
					"email" :"",
					"api" :"",
					"colony" :"",
					"tel" :"",
					"checkoutfields" : [
						"Phone",
						"Receive SMS",
						"Tip For The Driver",
						"Discount Coupon",
						"ChackoutMap",
						"Name",
						"Last Name",
						"Email",
						"Full Address",
						"APT\/Suit",
						"Area \/ Neighborhood"
					]
				};
			}
		}

		$scope.gPlace;          // geoPlace Variable AutoComplete
		$scope.myOrder = {
			orderType : 'pickup',
			curAddress : '',
			curNeighbour : '',
			curAddress : '',
			location :{
				lat:40.7275043,
				long:-73.98006450000003,
				zip:'10009',
				zoom:'14'
			},
			lang : { id : '1', name : 'English'}
		};
		$scope.location = null;

		$scope.LangList = [
			{
				id : 1,
				name : 'Enlish'
			}
		];
		$scope.Citylist = [
			{name:"Select City", value:'', selected:''},
		];
		$scope.Neighlist = [
			{name:"Select Neighbour", value:'', selected:''},
		];
		$rootScope.arabic_rtl = false;
		$rootScope.cssForArabic = {
			direction : ($rootScope.arabic_rtl?'rtl':'ltr'),
			'padding-right' : '10px'
		};


		// Language Selection


		function initLanguageSelection(){
			$scope.myOrder.lang = $scope.LangList[0];
		}
		initLanguageSelection();
		
		$scope.orderTypelist = [
			{name:"Delivery", value:'delivery', selected:''},
			{name:"Pickup", value:'pickup', selected:'selected'}/*,
			 {name:"Reservation", value:'reservation', selected:''}*/
		];

		$scope.selectOrderType = function(itemType){
			
			$scope.myOrder.orderType = itemType;
			console.log($scope.myOrder.orderType);
		}
		$scope.isActive = function(itemType) {
			 if($scope.myOrder.orderType == itemType){
				 return true;
			 }else{
				 return false;
			 }
		};

		// Get Language List
		if (typeof $rootScope.MLanguages.MOBILE_FRONT_LOAD_LOADING == 'undefined') {
			MyLoading.show("Loading...");
		}else {
			MyLoading.show($rootScope.MLanguages.MOBILE_FRONT_LOAD_LOADING);
		}

		$scope.loadGoogleMaps(function () {
			var options = {
				types: [],
			};
			var elements = $("#rest-full-address");
			var autocomplete = new google.maps.places.Autocomplete(elements[0], options);
			autocomplete.addListener('place_changed', function() {
				gMyAddress.setData(autocomplete.getPlace());
				$scope.$apply(function () {
					$scope.choosedAddress = true;
				});
			});
		});

		$scope.getLanguage(function (err, list, dictionary) {
			if (err) MyAlert(err);
			else {
				//console.log(list, dictionary);
				//$rootScope.languageList = list;
				$scope.LangList = list;
				$rootScope.LangList = list;
				//console.log($scope.LangList);
				var langId = localStorageApp.getItem(STORE_VAL.LANG);

				// Setting Default language id if there is not saved language id
				/*if ( localStorageApp.getItem('LangId') == null ) {
					localStorageApp.setItem('LangId',s.result.default.id);
				}*/

				var langId = parseInt(localStorageApp.getItem('LangId'));
				$scope.myOrder.lang = $filter('filter')($scope.LangList, {id:langId}, true)[0];
				$rootScope.cur_lang = $scope.myOrder.lang.id;
				if ($scope.myOrder.lang != undefined && $scope.myOrder.lang.id == 19)   //Arabic ID
				{
					$rootScope.arabic_rtl = true;
				}
				else {
					$rootScope.arabic_rtl = false;
				}

				MyLoading.hide();
				//var aa = s.result.languages;
				//$rootScope.MLanguages = dictionary;

				$scope.orderTypelist = [
					{name:$rootScope.MLanguages.MOBILE_FRONT_VISUALS_DELIVERY, value:'delivery', selected:''},
					{name:$rootScope.MLanguages.MOBILE_FRONT_VISUALS_PICKUP, value:'pickup', selected:'selected'}/*,
					 {name:$rootScope.MLanguages.MOBILE_FRONT_VISUALS_RESERVATION, value:'reservation', selected:''}*/
				];

				AllCityFech.getAllCity.getCity({
					lang : localStorage.getItem('LangId')
				},function (s) {                    
					MyLoading.hide();
					var city = [];
					$rootScope.citylists = s.city;
					city.push({
						name: $rootScope.MLanguages.FRONT_SELECT_CITY,
						value: ""
					})
					for(var i in $rootScope.citylists){            
						city.push({
							name: $rootScope.citylists[i].name,
							value: $rootScope.citylists[i].id
						})
					}
					$scope.Citylist = city
					$scope.Neighlist = [
						{name:$rootScope.MLanguages.FRONT_SELECT_NEIBORHOOD, value:'', selected:''},
					];
				},function (e) {
					MyLoading.hide();
					MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
					console.log(e);
				}); 
				var user_account = JSON.parse(localStorageApp.getItem(STORE_VAL.LOGIN_ACCOUNT));
				if (user_account != undefined || user_account != null)
				{
					UserSvc.login.getUser({
						lang : user_account.lang,
						email : user_account.email,
						password : user_account.password
					},function (res) {
						MyLoading.hide();
						if (res.error == "false"){
							// Check if user is enabled
							if(res.result.user.enabled == false) {
								$scope.hide();
								console.log($rootScope.MLanguages);
								MyAlert.show("\<center\>"+$scope.MLanguages.MOBILE_NOT_ALLOWED_ADMIN+"\<\/center\>");
								return;
							}
							// Getting User by ID -------------------------------------------
							USER_STATE = 'LOGIN';
							LOGIN_STATE = true;

							getUserInformation(res.result.user);

							localStorageApp.setItem(STORE_VAL.USR_ID, res.result.user.id);
							localStorageApp.setItem(STORE_VAL.LOGIN, true);
							localStorageApp.setItem(STORE_VAL.LOGIN_ACCOUNT, JSON.stringify({
								lang : localStorageApp.getItem('LangId'),
								email : user_account.email,
								password : user_account.password
							}));
							//--------------------------------------------------
						}else {
							$scope.hide();
							MyAlert.show($scope.MLanguages.MOBILE_INVALID_USER_DATA);
						}
					});
				}
			}
		});
		/*LanguageSvc.getLanguageList.getInfo({},function (s) {
			$rootScope.languageList = s.result;
			$scope.LangList = s.result.languages;

			// Setting Default language id if there is not saved language id
			if ( localStorageApp.getItem('LangId') == null ) {
				localStorageApp.setItem('LangId',s.result.default.id);
			}

			var langId = parseInt(localStorageApp.getItem('LangId'));
			$scope.myOrder.lang = $filter('filter')($scope.LangList, {id:langId}, true)[0];
			if ($scope.myOrder.lang != undefined && $scope.myOrder.lang.id == 19)   //Arabic ID
			{
				$rootScope.arabic_rtl = true;
			}
			else {
				$rootScope.arabic_rtl = false;
			}
			//TEST RTL
			//$rootScope.arabic_rtl = true;
			LanguageSvc.getMultiLanguage.getInfo({
				lang : localStorageApp.getItem('LangId')
			},function (s) {
				MyLoading.hide();
				var aa = s.result.languages;
				$rootScope.MLanguages = s.result.languages;

				$scope.orderTypelist = [
					{name:$rootScope.MLanguages.MOBILE_FRONT_VISUALS_DELIVERY, value:'delivery', selected:'selected'},
					{name:$rootScope.MLanguages.MOBILE_FRONT_VISUALS_PICKUP, value:'pickup', selected:''}
				];

				AllCityFech.getAllCity.getCity({
					lang : localStorage.getItem('LangId')
				},function (s) {                    
					MyLoading.hide();
					var city = [];
					$rootScope.citylists = s.city;
					city.push({
						name: $rootScope.MLanguages.FRONT_SELECT_CITY,
						value: ""
					})
					for(var i in $rootScope.citylists){            
						city.push({
							name: $rootScope.citylists[i].name,
							value: $rootScope.citylists[i].id
						})
					}
					$scope.Citylist = city
					$scope.Neighlist = [
						{name:$rootScope.MLanguages.FRONT_SELECT_NEIBORHOOD, value:'', selected:''},
					];
				},function (e) {
					MyLoading.hide();
					MyAlert.show('Error : ' + e.statusText);
				}); 
				var user_account = JSON.parse(localStorageApp.getItem(STORE_VAL.LOGIN_ACCOUNT));
				if (user_account != undefined || user_account != null)
				{
					UserSvc.login.getUser({
						lang : user_account.lang,
						email : user_account.email,
						password : user_account.password
					},function (res) {
						MyLoading.hide();
						if (res.error == "false"){
							// Check if user is enabled
							if(res.result.user.enabled == false) {
								$scope.hide();
								console.log($rootScope.MLanguages);
								MyAlert.show("\<center\>"+$scope.MLanguages.MOBILE_NOT_ALLOWED_ADMIN+"\<\/center\>");
								return;
							}
							// Getting User by ID -------------------------------------------
							USER_STATE = 'LOGIN';
							LOGIN_STATE = true;

							getUserInformation(res.result.user);

							localStorageApp.setItem(STORE_VAL.USR_ID, res.result.user.id);
							localStorageApp.setItem(STORE_VAL.LOGIN, true);
							localStorageApp.setItem(STORE_VAL.LOGIN_ACCOUNT, JSON.stringify({
								lang : localStorageApp.getItem('LangId'),
								email : user_account.email,
								password : user_account.password
							}));
							//--------------------------------------------------
						}else {
							$scope.hide();
							MyAlert.show($scope.MLanguages.MOBILE_INVALID_USER_DATA);
						}
					});
				}
				//}

			},function (e) {
				MyLoading.hide();
				var aa = e.result.message;
			})
		},function (e) {
			MyAlert.show($scope.MLanguages.MOBILE_ERROR+" : " + e.message);
		});*/


		//

		function getUserInformation ( user ) {

			// Registration of Device Token --------------------
			var device_kind = 0;
			if (ionic.Platform.isIOS()){
				device_kind = 1;
			}else{
				device_kind = 0;
			}
			 // alert("kind" + device_kind + "user" + user.id + "device_id" + GCM_DEVICE_TOKEN);
			if (GCM_DEVICE_TOKEN != ''){
				// alert('Token OK!');
				PushNotificationSvc.register.update({
					usrid : user.id,
					device_token : GCM_DEVICE_TOKEN,
					device_type : device_kind,
					businessid : '',
					device_apptype : APP_ID
				},{
					usrid : user.id,
					device_token : GCM_DEVICE_TOKEN,
					device_type : device_kind,
					businessid : '',
					device_apptype : APP_ID
				},function(res){
					// MyAlert.show("Succeed!");
					// $rootScope.SaveToken = true;
				},function (e) {
					 MyAlert.show(JSON.stringify(e));
				});
			}

			// Setting user information to temporary
			gUserData.setData(user);        // Setting User Data
			if (USER_STATE == 'FB_USER'){
				var buffUser = gUserData.getData();
				buffUser.profilepic = $scope.fbImagePath;
				gUserData.setData(buffUser);
			}
			if (user.address != ''){
				//gMyLatLng.setData(getLocationFromAddress(res.register[0].address));         // Get My Location from full address
			}
			$scope.myOrder.curAddress = user.street;
			// $scope.buyerInfoSetting(user); // BuyerInfoSetting
		}
		//
		var flaglang = '';
		$rootScope.$watch('MLanguages', function(newValue, oldValue) {
			if ($scope.MLanguages.MOBILE_FRONT_LOAD_LOADING) {
				for (i = 0; i < $scope.LangList.length; i++){
					if ($scope.LangList[i].id == $scope.cur_lang){
						$scope.myOrder.lang = $scope.LangList[i];
						localStorageApp.setItem(STORE_VAL.LANG, $scope.LangList[i].id);

						if ($scope.myOrder.lang != undefined && $scope.LangList[i].id == 19)   //Arabic ID
						{
							$rootScope.arabic_rtl = true;
						}
						else {
							$rootScope.arabic_rtl = false;
						}

						MyLoading.show($rootScope.MLanguages.MOBILE_FRONT_LOAD_LOADING);
						/*LanguageSvc.getMultiLanguage.getInfo({
							lang : $scope.LangList[i].id
						},function (s) {
							MyLoading.hide();
							flaglang = $scope.cur_lang;
							var aa = s.result.languages;
							$rootScope.MLanguages = s.result.languages;*/

							$scope.orderTypelist = [
								{name:$rootScope.MLanguages.MOBILE_FRONT_VISUALS_DELIVERY, value:'delivery', selected:''},
								{name:$rootScope.MLanguages.MOBILE_FRONT_VISUALS_PICKUP, value:'pickup', selected:'selected'}
							];

							AllCityFech.getAllCity.getCity({
								lang : localStorage.getItem('LangId')
							},function (s) { 
								if (!ADDONS.web_template || document.URL.indexOf('search') == -1) 
									MyLoading.hide();
								var city = [];
								$rootScope.citylists = s.city;
								city.push({
									name: $rootScope.MLanguages.FRONT_SELECT_CITY,
									value: ""
								})
								for(var i in $rootScope.citylists){            
									city.push({
										name: $rootScope.citylists[i].name,
										value: $rootScope.citylists[i].id
									})
								}
								$scope.Citylist = city
								$scope.Neighlist = [
									{name:$rootScope.MLanguages.FRONT_SELECT_NEIBORHOOD, value:'', selected:''},
								];
							},function (e) {
								MyLoading.hide();
								console.log(e);
								$rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER
							});

						/*},function (e) {
							MyLoading.hide();
							var aa = e.result.message;
						});*/
						break;
					}
				}
			}
		});
		/*$rootScope.selectLanguage = function (id) {
			localStorageApp.setItem(STORE_VAL.RESET_LANG, 0);
			$rootScope.cur_lang = id;
			if (flaglang == id) return;
			var i = 0, len = $scope.LangList.length;
			for (; i < len; i++){
				// if ($scope.LangList[i].id == $scope.myOrder.lang.id){
				if ($scope.LangList[i].id == id){
					$scope.myOrder.lang = $scope.LangList[i];
					localStorageApp.setItem(STORE_VAL.LANG, $scope.LangList[i].id);

					if ($scope.myOrder.lang != undefined && $scope.LangList[i].id == 19)   //Arabic ID
					{
						$rootScope.arabic_rtl = true;
					}
					else {
						$rootScope.arabic_rtl = false;
					}

					MyLoading.show($rootScope.MLanguages.MOBILE_FRONT_LOAD_LOADING);
					LanguageSvc.getMultiLanguage.getInfo({
						lang : $scope.LangList[i].id
					},function (s) {
						MyLoading.hide();
						flaglang = id;
						var aa = s.result.languages;
						$rootScope.MLanguages = s.result.languages;

						$scope.orderTypelist = [
							{name:$rootScope.MLanguages.MOBILE_FRONT_VISUALS_DELIVERY, value:'delivery', selected:'selected'},
							{name:$rootScope.MLanguages.MOBILE_FRONT_VISUALS_PICKUP, value:'pickup', selected:''}
						];

						AllCityFech.getAllCity.getCity({
							lang : localStorage.getItem('LangId')
						},function (s) {                    
							MyLoading.hide();
							var city = [];
							$rootScope.citylists = s.city;
							city.push({
								name: $rootScope.MLanguages.FRONT_SELECT_CITY,
								value: ""
							})
							for(var i in $rootScope.citylists){            
								city.push({
									name: $rootScope.citylists[i].name,
									value: $rootScope.citylists[i].id
								})
							}
							$scope.Citylist = city
							$scope.Neighlist = [
								{name:$rootScope.MLanguages.FRONT_SELECT_NEIBORHOOD, value:'', selected:''},
							];
						},function (e) {
							MyLoading.hide();
							MyAlert.show('Error : ' + e.statusText);
						});

					},function (e) {
						MyLoading.hide();
						var aa = e.result.message;
					});
					break;
				}
			}

		};*/
		$scope.isFocusDir = false;
		$scope.onFocusDir = function () {
			console.log('onFocusDir');
			$scope.isFocusDir = true;
		}

		$scope.onBlurDir = function () {
			console.log('onBlurDir');
			$timeout(function () {
				$scope.isFocusDir = false;
			}, 1000);
		}

		var map = null;
		var marker = null;
		var infowindow = null;
		var intervalmap = null;
		$scope.showModal = function () {
			if ($scope.modal) {
				$scope.modal.remove();
			}
			$("#map").remove();
			var pos_element = ADDONS.single_business ? 0:1;
			//$($("[googleplace]")[pos_element]).remove();
			$('ion-modal-view ion-content').remove();
			//$($(".pac-container")[1]).remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/advanced-search-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show().then(function () {
					$("#rest-full-address").blur();
					var content = $('ion-modal-view ion-content');
					var div = document.getElementById('map');
					var height = content.height();
					var width = content.width();
					$("#map").height(height);
					$("#map").width(width);
					intervalmap = setInterval(function () {
						//console.log(content);
						//console.log($("#map").width(), $("#map").height(), content.width(), content.height());
						if ((height != content.height() || width != content.width()) || (height != $("#map").height() || width != $("#map").width())) {
							console.log("Cambio");
							height = content.height();
							width = content.width();
							$("#map").height(content.height());
							$("#map").width(content.width());
							google.maps.event.trigger(map, 'resize');
						}
					}, 100);
					var options = {
						types: []
					};
					var elements = $("[googleplace]");
					var autocomplete = new google.maps.places.Autocomplete(elements[pos_element], options);
					autocomplete.addListener('place_changed', function() {
						console.log(autocomplete.getPlace().formatted_address);
						$scope.myOrder.curAddress = autocomplete.getPlace().formatted_address;
						reloadMap(map, marker, infowindow, autocomplete.getPlace().geometry.location, autocomplete.getPlace().formatted_address)
						LocationService.searchAddress($scope.myOrder.curAddress).then(function(result) {
							//$scope.search.error = null;
							//$scope.search.suggestions = result;
							//console.log(result[0]);
							$scope.tmp_googleplace = result[0];
						}, function(status){
							//$scope.search.error = "There was an error :( " + status;
							console.log("error" + status);
						});
					});
					setTimeout(function () {
						console.log($(".pac-container"));
						$($(".pac-container")[$(".pac-container").length-1]).appendTo(".modal-backdrop");
					}, 200);
					function reloadMap(p_map, p_marker, p_infowindow, position, content) {
						map = new google.maps.Map(document.getElementById('map'), {
						  zoom: 18,
						  center: position
						});
						marker = new google.maps.Marker({
						  position: position,
						  map: map
						});
						infowindow = new google.maps.InfoWindow({
							content: parseAddress($scope.myOrder.curAddress),
							disableAutoPan: true
						});
						google.maps.event.clearListeners(map,'center_changed');
						map.addListener('center_changed', function() {
							//console.log(map.getCenter());
							setTimeout(function () {
								if (!$scope.isFocusDir) {
									console.log("Center 1");
									marker.setPosition(map.getCenter());
									AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
										MyLoading.hide();
										swres = true;
										$scope.location = {
											address : addr.address,
											location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
										};
										gMyLatLng.setData($scope.location.location);
										$scope.myOrder.curAddress = $scope.location.address;
										if (infowindow) infowindow.close();
										infowindow = new google.maps.InfoWindow({
											content: parseAddress($scope.location.address),
											disableAutoPan: true
										});
										infowindow.open(map, marker);
									},function(error){
										MyLoading.hide();
										swres = true;
										$scope.myOrder.curAddress = ADDRESS.street;
										MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
									});
								}
							}, 300);
						});
						infowindow.open(map, marker);
					}
					$scope.myOrder.curAddress = ADDRESS.street;
					var uluru = { lat: ADDRESS.latitude, lng: ADDRESS.longitude };
					map = new google.maps.Map(document.getElementById('map'), {
					  zoom: 18,
					  center: uluru
					});
					marker = new google.maps.Marker({
					  position: map.getCenter(),
					  map: map
					});
					map.addListener('center_changed', function() {
						//console.log(map.getCenter());
						setTimeout(function () {
							if (!$scope.isFocusDir) {
								console.log("Center 2");
								marker.setPosition(map.getCenter());
								AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
									MyLoading.hide();
									swres = true;
									$scope.location = {
										address : addr.address,
										location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
									};
									gMyLatLng.setData($scope.location.location);
									$scope.myOrder.curAddress = $scope.location.address;
									infowindow.close();
									infowindow = new google.maps.InfoWindow({
										content: parseAddress($scope.location.address),
										disableAutoPan: true
									});
									infowindow.open(map, marker);
								},function(error){
									MyLoading.hide();
									swres = true;
									$scope.myOrder.curAddress = ADDRESS.street;
									MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
								});
							}
						}, 300);
					});
					map.addListener('resize', function() {
						//console.log(map.getCenter());
						map = new google.maps.Map(document.getElementById('map'), {
							zoom: 18,
							center: uluru
						});
						marker = new google.maps.Marker({
							position: map.getCenter(),
							map: map
						});
						map.addListener('center_changed', function() {
							//console.log(map.getCenter());
							setTimeout(function () {
								if (!$scope.isFocusDir) {
									console.log("Center 3");
									marker.setPosition(map.getCenter());
									AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
										MyLoading.hide();
										swres = true;
										$scope.location = {
											address : addr.address,
											location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
										};
										gMyLatLng.setData($scope.location.location);
										$scope.myOrder.curAddress = $scope.location.address;
										infowindow.close();
										infowindow = new google.maps.InfoWindow({
											content: parseAddress($scope.location.address),
											disableAutoPan: true
										});
										infowindow.open(map, marker);
									},function(error){
										MyLoading.hide();
										swres = true;
										$scope.myOrder.curAddress = ADDRESS.street;
										MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
									});
								}
							}, 300);
						});
					});
					infowindow = new google.maps.InfoWindow({
						content: parseAddress($scope.myOrder.curAddress),
						disableAutoPan: true
					});
					MyLoading.show($scope.MLanguages.MOBILE_FETCHING);
					var swres = false;
					GeolocationSvc().then(function(position) {
						AddressLookupSvc.lookupByAddress(position.lat, position.lng).then(function(addr) {
							MyLoading.hide();
							swres = true;
							$scope.location = {
								address : addr.address,
								location : { lat : position.lat, lng : position.lng, zip : addr.zip }
							};
							gMyLatLng.setData($scope.location.location);
							$scope.myOrder.curAddress = $scope.location.address;
							map = new google.maps.Map(document.getElementById('map'), {
								zoom: 18,
								center: { lat : position.lat, lng : position.lng, zip : addr.zip }
							});
							marker = new google.maps.Marker({
								position: { lat : position.lat, lng : position.lng, zip : addr.zip },
								map: map
							});
							infowindow.close();
							infowindow = new google.maps.InfoWindow({
								content: parseAddress($scope.location.address),
								disableAutoPan: true
							});
							infowindow.open(map, marker);
							map.addListener('center_changed', function() {
								//console.log(map.getCenter());
								setTimeout(function () {
									if (!$scope.isFocusDir) {
										marker.setPosition(map.getCenter());
										AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
											MyLoading.hide();
											swres = true;
											$scope.location = {
												address : addr.address,
												location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
											};
											gMyLatLng.setData($scope.location.location);
											$scope.myOrder.curAddress = $scope.location.address;
											infowindow.close();
											infowindow = new google.maps.InfoWindow({
												content: parseAddress($scope.location.address),
												disableAutoPan: true
											});
											infowindow.open(map, marker);
										},function(error){
											MyLoading.hide();
											swres = true;
											$scope.myOrder.curAddress = ADDRESS.street;
											MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
										});
									}
								}, 300);
							});
						},function(error){
							MyLoading.hide();
							swres = true;
							$scope.myOrder.curAddress = ADDRESS.street;
							MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
						});

					},function(err){
						MyLoading.hide();
						$scope.myOrder.curAddress = ADDRESS.street;
						swres = true;
						/*$ionicPopup.alert({
							title : $scope.MLanguages.MOBILE_ERROR.toUpperCase(),
							template : err.message,
							okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
						}).then(function(){
								//GPS enabled?????
								//var locationConfig = window.plugins.locationAndSettings;
								//locationConfig.switchToLocationSettings(function(result){},function(errer){ console.log(errer); });
						});*/
						MyAlert.show(err.message);
					});
					setTimeout(function () {
						if (!swres) {
							MyLoading.hide();
							$scope.myOrder.curAddress = ADDRESS.street;
							MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
						}
					}, 10000);

				});
			});
		};

		function parseAddress(address) {
			var pos = address.indexOf(',');
			if (pos != -1) {
				var parts = address.split(',');
				address = parts[0];
				for (var i = 1; i < parts.length; i++) {
					address += '<br>'+parts[i];
				}
			}
			return address;
		}

		$scope.$on('modal.hidden', function() {
			$scope.hideModal();
		});

		$scope.hideModal = function () {
			if ($scope.modal != null && $scope.modal.isShown()) $scope.modal.hide();
			if (map) {
				google.maps.event.clearListeners(map,'center_changed');
			}
			map = null;
			marker = null;
			infowindow = null;
			clearInterval(intervalmap);
		};

		$scope.openMap = function () {
			if ($scope.ADDONS.advanced_search) {
				if (typeof cordova !== undefined) return $scope.showModal();
				cordova.plugins.diagnostic.isLocationAvailable(function(available){
					if (available) {
						console.log("Pedir permiso.");
						cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
							switch(status){
								case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
									console.log("Permission not requested");
									break;
								case cordova.plugins.diagnostic.permissionStatus.GRANTED:
									console.log("Permission granted");
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED:
									console.log("Permission denied");
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
									console.log("Permission permanently denied");
									break;
								case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
									console.log("Permission granted only when in use");
									break;
							}
							$scope.showModal();
						}, function(error){
							console.error("Error: "+error);
						}, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);
					} else {
						console.log("Pedir permiso GSP.");
						cordova.plugins.locationAccuracy.canRequest(function(canRequest){
							if(canRequest){
								cordova.plugins.locationAccuracy.request(function(){
									console.log("Request successful");
									$scope.openMap();
								}, function (error){
									$scope.showModal();
								}, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
								);
							}
						});
					}
				}, function(error){
					console.log("Error GPS.");
					$scope.showModal();
				});
			}
		}

		$scope.selectCity = function (id) {        
			if (flaglang == id) return;         
			
			$scope.myOrder.curCity = id;                   

			MyLoading.show($rootScope.MLanguages.MOBILE_FRONT_LOAD_LOADING);

			AllNeighFech.getAllNeighbour.getNeighbour({
				lang : localStorage.getItem('LangId'),
				city : id
			},function (s) {                    
				MyLoading.hide();
				var neigh = [];
				//$rootScope.neighbour = s.neighbour;
				$rootScope.neighbour = s.result.neighborhood;
				neigh.push({
					name: $rootScope.MLanguages.FRONT_SELECT_NEIBORHOOD,
					value: ""
				})
				for(var i in $rootScope.neighbour){            
					neigh.push({
						name: $rootScope.neighbour[i].name,
						value: $rootScope.neighbour[i].id
					})
				}
				$scope.Neighlist = neigh
			},function (e) {
				MyLoading.hide();
				$rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER
			});
		};

		//$ionicHistory.clearHistory();       // initialize Clear Histories

		//---No Internet Connection------------------
		$rootScope.netModalState = false;
		$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/no-connection.html', {
			scope: $scope
		}).then(function(modal) {
			$scope.modal3 = modal;
		});
		$scope.openModal = function() {
			$scope.modal3.show();
			$rootScope.netModalState = false;
		};
		$scope.closeModal = function() {
			$scope.modal3.hide();
		};

		$scope.onReStart = function(){
			setTimeout(function (){
				navigator.app.loadUrl("file:///android_asset/www/index.html");
			}, 100);
		};

		// Related to Facebook Login

		$scope.fbLogin = function () {

			ngFB.login({scope: 'email,public_profile,publish_actions,user_location'}).then(
				function (response) {
					if (response.status === 'connected') {
						LOGIN_STATE = true;
						USER_STATE = 'FB_USER';
						console.log('Facebook login succeeded');
						$scope.getFBProfile();

					} else {
						alert($scope.MLanguages.MOBILE_FACEBOOK_LOGIN_ERROR);
					}
				});
		};

		$scope.getFBProfile = function () {
			MyLoading.show($scope.MLanguages.MOBILE_FRONT_LOAD_LOADING);
			ngFB.api({
				path : '/me',
				params : {fields: 'id,name,email,location'}
			}).then(
				function (user) {
					// $scope.user = user;
					$scope.setUserToBuyer(user);
				},
				function (error) {
					//alert('FB error : ' + error.message);
					$scope.hide();
				}
			)
		};

		$scope.setUserToBuyer = function (user) {
			/*
			var nameAry = (user.name).split(" ");
			$scope.signUpUser.name = nameAry[0];
			$scope.signUpUser.lastname = nameAry[1];
			$scope.signUpUser.email = user.email;
			$scope.signUpUser.password = 'fbuser';
			$scope.fbImagePath = 'http://graph.facebook.com/'+ user.id +'/picture?width=270&height=270';
			*/
			UserSvc.login.getUser({
				lang : localStorageApp.getItem('LangId'),
				email : user.email,
				password : 'fbuser'
			},function (res) {
				$ionicLoading.hide();
				if (res.error == "false"){
					getUserInformation(res.result.user);
					$rootScope.isAlreadyFbLogined = true;
					localStorageApp.setItem(STORE_VAL.IS_FBSUER, "true");
					localStorageApp.setItem(STORE_VAL.USR_ID, res.result.user.id);
					localStorageApp.setItem(STORE_VAL.LOGIN, true);
					//--------------------------------------------------
				}
			});

		};

		$scope.show = function() {
			$ionicLoading.show({
				template: '<p>'+$scope.MLanguages.MOBILE_UPDATING+'</p><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner>'
			});
		};
		//----------------------------

		ionicReady().then(function(){           // This function only once called at start app.
			if (G_NETSTATE == STATE.NO_INTERNET){
				$scope.openModal();
			}else if (G_NETSTATE == STATE.STATE_OK) {
				$scope.closeModal();
			}

			GeolocationSvc().then(function (position) {
				gMyLatLng.setData(position);
			},function (e) {
				console.log(e.message);
			});
		});

		/*$ionicPlatform.ready(function(){
			//alert('Your Platform is Ready!' + gStates.getState());
			if (G_NETSTATE == STATE.NO_INTERNET){
				$scope.openModal();
			}
		});*/

		setInterval(function(){
			if (window.Connection) {
				if (navigator.connection.type == Connection.NONE) {
					G_NETSTATE = STATE.NO_INTERNET;
					$rootScope.netModalState = true;
					// alert("Connect detect ok!");
				}else {
					G_NETSTATE = STATE.STATE_OK;
				}
			}
			if (G_NETSTATE == STATE.NO_INTERNET){
				if ($rootScope.netModalState){
					$rootScope.netModalState = false;
					$scope.openModal();
				}else{
					$scope.closeModal();
				}
			}
		}, 2000);

		//--------------------------------------------------------------------------------------------------------
		$scope.tmp_googleplace = "";
		$scope.googleplace_changed = function(){
			//console.log($scope.myOrder.curAddress);
			if ($scope.myOrder.curAddress == undefined || $scope.myOrder.curAddress == "")
				return ;

			LocationService.searchAddress($scope.myOrder.curAddress).then(function(result) {
				//$scope.search.error = null;
				//$scope.search.suggestions = result;
				//console.log(result[0]);
				$scope.tmp_googleplace = result[0];
			  }, function(status){
				//$scope.search.error = "There was an error :( " + status;
				console.log("error" + status);
			  });
		}

		$scope.findRest = function (flag) {

			console.log($scope.myOrder.orderType);
			$scope.hideModal();
			/*if (ADDONS.single_business && $scope.myOrder.orderType == 'pickup') {
				return $scope.goRest();
			}*/
			if (typeof localStorageApp.getItem('LangId') == 'undefined') {
				MyAlert.show("Please Select Language");
				return;
			}
			if(flag){
				var fulAddress = $scope.myOrder.curNeighbour;
				if(fulAddress == ''){
					MyAlert.show($rootScope.MLanguages.FRONT_SELECT_NEIBORHOOD);
					return;
				}
				MyLoading.show($rootScope.MLanguages.MOBILE_FRONT_LOAD_SEARCHING);

				$scope.findRestauranByNeigh();
			} else {
				(document.getElementById('rest-full-address') == null) ? $scope.myOrder.curAddress = document.getElementById('dirMap').value : $scope.myOrder.curAddress = document.getElementById('rest-full-address').value;
				//$scope.myOrder.curAddress = document.getElementById('rest-full-address').value;
				if ($scope.myOrder.curAddress == undefined || $scope.myOrder.curAddress == "undefined")
					$scope.myOrder.curAddress = $scope.tmp_googleplace.description;

				var fulAddress = $scope.myOrder.curAddress;
				if(fulAddress == '') {
					if (!$rootScope.arabic_rtl) {
						MyAlert.show($rootScope.MLanguages.FRONT_SELECT_ADDRESS);
					} else {
						MyAlert.show($rootScope.MLanguages.FRONT_SELECT_ADDRESS);
					}
					return;
				}
				if (ADDONS.web_template) {
					window.location = ((WEB_ADDONS.remove_hash)?'':'/#')+'/search/type/'+$scope.myOrder.orderType+'/address/'+encodeURI($scope.myOrder.curAddress);
				} else {
					MyLoading.show($rootScope.MLanguages.MOBILE_FRONT_LOAD_SEARCHING);

					GeoCoderSvc.getCountryCityFromAddress(fulAddress).then(function (s) {
						var buff = gMyLatLng.getData();
						buff.zip = s.zip;
						buff.cityname = s.city;
						gMyLatLng.setData(buff);
						if (gMyLatLng.getData().lng == undefined || gMyLatLng.getData().lat == undefined) {
							gMyLatLng.getData().lat = s.location.lat;
							gMyLatLng.getData().lng = s.location.lng;
						}
						$scope.findRestaurant(s);
					$rootScope.cityname = s.city
					},function (e) {
						MyLoading.hide();
						MyAlert.show(e);
					});
				}
			}

		};

	/*	$scope.delivery = function () {
			console.log("Delivery");
			$scope.myOrder.orderType = 'delivery';
			$scope.openMap();
		}

		$scope.pickup = function () {
			$scope.myOrder.orderType = 'pickup';
			$scope.openMap();
		}*/

		$scope.findRestaurant = function(splited_address){

			BusinessSvc.getByCondition.charge({
				lang        : localStorageApp.getItem('LangId'),
				type        : $scope.myOrder.orderType,
				country     : splited_address.country,
				city        : splited_address.city,
				address     : '',//$scope.myOrder.curAddress,
				latitude    : splited_address.location.lat,
				longitude   : splited_address.location.lng
			},function (response) {
				if (response.message == "success"){
					MyLoading.hide();
					var businesses = [];
					if (ADDONS.single_business) {
						for (var i = 0; i < response.result.businesses.length; i++) {
							if (response.result.businesses[i].id == BUSINESS_ID) {
								businesses.push(response.result.businesses[i]);
							}
						}
						if (businesses.length == 0) {
							if ($scope.myOrder.orderType == "delivery") MyAlert.show('\<center\>'+$scope.MLanguages.FRONT_SORRY_DELIVERY_OPTION+'\<\/center\>');
							else MyAlert.show('\<center\>'+$scope.MLanguages.MOBILE_VERY_FAR_FOR_PICKUP+'\<\/center\>');
						} else {
							//console.log(response.result.businesses[0]);
							gAllBusiness.setData(businesses);
							//console.log(response.result.businesses[0]);
							//---After response from server---
							var responseData = {};
							responseData.nearAddress = $scope.myOrder.curAddress;       // ???? User Address ? Restaurant Address ?
							responseData.nearCount = gAllBusiness.getData().length;
							responseData.orderType = $scope.myOrder.orderType;
							responseData.whereAll = '';
							gNearService.setData(responseData);
							COMMON_DATA.serviceFee = ($scope.myOrder.orderType == 'pickup')?0:response.result.businesses[0].serviceFee;
							$ionicViewSwitcher.nextDirection('forward');
							$scope.onRestaurantItem(businesses[0]);
						}
					} else {
						businesses = response.result.businesses;
						if (businesses.length == 0) {
							MyAlert.show($scope.MLanguages.FRONT_NO_RESULT_FOUND);
						} else {
							gAllBusiness.setData(businesses);
							//---After response from server---
							var responseData = {};
							responseData.nearAddress = $scope.myOrder.curAddress;       // ???? User Address ? Restaurant Address ?
							responseData.nearCount = gAllBusiness.getData().length;
							responseData.orderType = $scope.myOrder.orderType;
							responseData.whereAll = '';
							gNearService.setData(responseData);
							COMMON_DATA.serviceFee = ($scope.myOrder.orderType == 'pickup')?0:response.result.businesses[0].serviceFee;

							$ionicViewSwitcher.nextDirection('forward');
							$state.go('restaurantSearch');
						}
					}
				}else {
					MyLoading.hide();

					if (ADDONS.single_business) {
						if ($scope.myOrder.orderType == "delivery") MyAlert.show('\<center\>'+$scope.MLanguages.FRONT_SORRY_DELIVERY_OPTION+'\<\/center\>');
						else MyAlert.show('\<center\>'+$scope.MLanguages.MOBILE_VERY_FAR_FOR_PICKUP+'\<\/center\>');
					} else MyAlert.show('\<center\>'+$scope.MLanguages.MOBILE_SEARCH_ERROR+' ' + response.message+'\<\/center\>');

					//MyAlert.showtWithTitle($scope.MLanguages.MOBILE_APPNAME, $scope.MLanguages.MOBILE_SEARCH_ERROR+' ' + response.message);
					//MyAlert.show($scope.MLanguages.MOBILE_SEARCH_ERROR+' ' + response.message);

				}
			},function (e) {
				MyAlert.show('\<center\>'+e.statusText+'\<\/center\>');
			});

		};

		$scope.findRestauranByNeigh = function(){

			BusinessSvc.getByNeighbourHood.charge({                
				langid          : localStorageApp.getItem('LangId'),
				cityId          : $scope.myOrder.curCity,
				neighbourhoodId : $scope.myOrder.curNeighbour,
			},function (response) {
				if (response.searchcount > 0){
					//console.log(JSON.stringify(response))
					MyLoading.hide();
					gAllBusiness.setData(response.searchbusiness);

					var responseData = {};
					responseData.nearAddress = response.searchtext;      // ???? User Address ? Restaurant Address ?
					responseData.nearCount = gAllBusiness.getData().length;
					responseData.orderType = $scope.myOrder.orderType;
					responseData.whereAll = '';
					gNearService.setData(responseData);

					COMMON_DATA.serviceFee = response.searchbusiness[0].serviceFee;


					$ionicViewSwitcher.nextDirection('forward');
					$state.go('restaurantSearch');
				}else {
					MyLoading.hide();
					//MyAlert.show('\<center\>'+$scope.MLanguages.MOBILE_SEARCH_ERROR+' '+response.message+'\<\/center\>');
					MyAlert.show('\<center\>'+$scope.MLanguages.FRONT_SORRY_DELIVERY_OPTION+'\<\/center\>');
				}                

			},function (e) {
				MyAlert.show('\<center\>'+e.statusText+'\<\/center\>');
			});

		};

		//Get Current Location
		$scope.getCurLocation = function(){
			if ($scope.ADDONS.advanced_search) {
				$scope.openMap();
				return;
			}
			MyLoading.show($scope.MLanguages.MOBILE_FETCHING);
			var swres = false;
			GeolocationSvc().then(function(position) {
				AddressLookupSvc.lookupByAddress(position.lat, position.lng).then(function(addr) {
					setTimeout(function () {
						MyLoading.hide();
					}, 100);
					swres = true;
					$scope.location = {
						address : addr.address,
						location : { lat : position.lat, lng : position.lng, zip : addr.zip }
					};
					gMyLatLng.setData($scope.location.location);
					$scope.myOrder.curAddress = $scope.location.address;
				},function(error){
					setTimeout(function () {
						MyLoading.hide();
					}, 100);
					swres = true;
					$scope.myOrder.curAddress = $scope.MLanguages.MOBILE_LOCATION_ERROR;
					MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
				});

			},function(err){
				setTimeout(function () {
					MyLoading.hide();
				}, 100);
				swres = true;
				/*$ionicPopup.alert({
					title : $scope.MLanguages.MOBILE_ERROR.toUpperCase(),
					template : err.message,
					okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
				}).then(function(){
						//GPS enabled?????
						//var locationConfig = window.plugins.locationAndSettings;
						//locationConfig.switchToLocationSettings(function(result){},function(errer){ console.log(errer); });
				});*/
				MyAlert.show(err.message);
			});
			setTimeout(function () {
				if (!swres) {
					MyLoading.hide();
					$scope.myOrder.curAddress = $scope.MLanguages.MOBILE_LOCATION_ERROR;
					MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
				}
			}, 10000);
		};

		$scope.onAutoCompleteAddress = function() {
			setTimeout(function() {
				if (typeof document.getElementsByClassName('backdrop')[0] != 'undefined' &&
					typeof document.getElementsByClassName('pac-container')[0] != 'undefined')
				{
					for (var i = 0; i < document.getElementsByClassName('pac-container').length; i++){
						document.getElementsByClassName('pac-container')[i].setAttribute('data-tap-disabled', true);
					}
					for (i = 0; i < document.getElementsByClassName('backdrop').length; i++){
						document.getElementsByClassName('backdrop')[i].setAttribute('data-tap-disabled', true);
					}
				}
			}, 100);
		};

		//COMMON FUNCTIONS ---------------------------------------------------------------------------------------------

		//"_@_Please choose the size:@u@Small    $1.00_@_combo?@u@Yes    $2.00_@_chips@u@doritos"
		$rootScope.getFormattedOptions = function (option_str) {
			if (option_str != undefined) {
				var buff1 = option_str.split('_@_');
				var buff2 = [];
				for(var i = 1; i < buff1.length; i++){
					var buff3 = buff1[i].split('@u@');
					var a = buff3[1].split('    ');
					var b = a.join(':');
					buff2.push(b);
				}
				options = buff2.join(', ');
				options = options.replace(/undefined/g, '');
				return options;
			}
		};

		// Getting Order Status as String
		$rootScope.getOrderState = function (num) {
			//console.log(num);
			switch (num) {
				case 0:
					return $scope.MLanguages.ORDER_STATUS_PENDING;
				case 1:
					return $scope.MLanguages.ORDERS_COMPLETED;
				case 2:
					return $scope.MLanguages.ORDER_REJECTED;
				case 3:
					return $scope.MLanguages.ORDER_STATUS_PREPARATION;
				case 4:
					return $scope.MLanguages.ORDER_STATUS_ONITSWAY;
				case 5:
					return $scope.MLanguages.ORDER_REJECTED_RESTAURANT;
				case 6:
					return $scope.MLanguages.ORDER_STATUS_CANCELLEDBYDRIVER;
				case 7:
					return $scope.MLanguages.ORDER_STATUS_ACCEPTEDBYRESTAURANT;
				case 8:
					return $scope.MLanguages.ORDER_CONFIRMED_ACCEPTED_BY_DRIVER;
				case 9:
					return $scope.MLanguages.ORDER_PICKUP_COMPLETED_BY_DRIVER;
				case 10:
					return $scope.MLanguages.ORDER_PICKUP_FAILED_BY_DRIVER;
				case 11:
					return $scope.MLanguages.ORDER_DELIVERY_COMPLETED_BY_DRIVER;
				case 12:
					return $scope.MLanguages.ORDER_DELIVERY_FAILED_BY_DRIVER;
				default:
					return "N/A";
			}
		};

		// DEBUG Google Maps delete directive
		//MyLoading.hide();
		//MyLoading.show($scope.MOBILE_FRONT_LOAD_LOADING);
		var interval = setInterval(function () {
			if (typeof google == 'undefined') {}
			else {
				clearInterval(interval);
				var options = {
					types: []
				};
				var elements = $("[googleplace]");
				$scope.$apply(function() {
					$scope.gPlace = new google.maps.places.Autocomplete(elements[0], options);
				});

				google.maps.event.addListener($scope.gPlace, 'place_changed', function() {
					$scope.$apply(function() {
						$scope.details = $scope.gPlace.getPlace();
						elements[0].value = $scope.details.formatted_address;
						//model.$setViewValue(element.val());
					});
				});
			}
		}, 100);
		// END Google Maps

		$scope.getOpenClose = function(now, oTime){
			var dt = now;
			if (!oTime) {
				oTime = {};
				oTime.opens = { hour: "0", minute: "0" };
				oTime.closes = { hour: "0", minute: "0" };
			}
			var resdt = dt.split(":");
			var resdt_timehr = resdt[0].length > 1 ? "" + resdt[0]: "0" + resdt[0];
			var resdt_timemi = resdt[1].length > 1 ? "" + resdt[1]: "0" + resdt[1];
			var dt = resdt_timehr+":"+resdt_timemi+":00"

			var openhour = oTime.opens.hour > 9 ? "" + oTime.opens.hour: "0" + oTime.opens.hour;
			var openminute = oTime.opens.minute > 9 ? "" + oTime.opens.minute: "0" + oTime.opens.minute;
			var dt1 = openhour+':'+openminute+':00'
			var closehour = oTime.closes.hour > 9 ? "" + oTime.closes.hour: "0" + oTime.closes.hour;
			var closeminute = oTime.closes.minute > 9 ? "" + oTime.closes.minute: "0" + oTime.closes.minute;
			var dt2 = closehour+':'+closeminute+':00'
		 
			if(dt >= dt1 && dt <= dt2) {
				return true;
			}else{
				return false;
			}
		};

		$scope.onRestaurantItem = function(selRestaurant){
			$rootScope.bufferDishData = [];         // Init Buffer Dish Data
		   ////alert(localStorageApp.getItem('LangId')+"//"+selRestaurant.id+"//"+selRestaurant.timezone)

			// Detect of Open & Close time zone ------------

			if (!$scope.getOpenClose(selRestaurant.now, selRestaurant.openTime)){
				if (selRestaurant.openTime == null) {
					selRestaurant.openTime = {};
					selRestaurant.openTime.opens = { hour: "0", minute: "0" };
					selRestaurant.openTime.closes = { hour: "0", minute: "0" };
				}
				$ionicPopup.alert({
					//title : $scope.MLanguages.MOBILE_APPNAME,
					title : $rootScope.MLanguages.MOBILE_OPEN_CLOSE_TIME,
					template : '\<center\>' + $rootScope.getFormattedTime(selRestaurant.openTime.opens) + ' - ' + $rootScope.getFormattedTime(selRestaurant.openTime.closes) + '\<\center\>',
					okText: $rootScope.MLanguages.MOBILE_FOURTH_PAGE_OK
				});
				return;
			}

			//-------------------------------------
			MyLoading.show($scope.MLanguages.MOBILE_GETTING_MENU);
			MenuSvc.getInfo({
				lang : localStorageApp.getItem('LangId'),
				businessId : selRestaurant.id,
				timezone : selRestaurant.timezone
			},function (s) {
				// console.log(s.result);

				var buffObj = {};
				buffObj.id = selRestaurant.id;
				buffObj.name = selRestaurant.info.name;
				buffObj.info = s.result;
				buffObj.header = selRestaurant.headerUrl;
				buffObj.logo = selRestaurant.logo;
				buffObj.isImg = selRestaurant.isImg;
				buffObj.isImgH = selRestaurant.isImgH;

				if(gMyLatLng.getData().lat == undefined){
					var lat = 1 
				}else{
					var lat = gMyLatLng.getData().lat  
				}

				if(gMyLatLng.getData().lng == undefined){
					var lng = 1 
				}else{
					var lng = gMyLatLng.getData().lng  
				}

				if(gMyLatLng.getData().zip == undefined){
					var zip = 1 
				}else{
					var zip = gMyLatLng.getData().zip  
				}

	// alert(localStorageApp.getItem('LangId')+"//"+selRestaurant.id+"//"+gMyLatLng.getData().lat+"//"+gMyLatLng.getData().lng+"//"+gMyLatLng.getData().zip)
				BusinessSvc.getInformation.charge({
					Id : selRestaurant.id,
					lang    :localStorageApp.getItem('LangId'),
					latitude : lat,
					longitude : lng,
					zipCode : zip
					/*latitude : 40.75368539999999,
					longitude : -73.9991637,
					zipCode : 10001*/
					
				   
				},function (s) {
					
					if (s.error == 'false'){
						buffObj.restData = s.result.business;
						buffObj.restData.minium = selRestaurant.minimum;
						//DEBUG
						buffObj.deliveryFee = selRestaurant.deliveryCost;
					   // gCurRestaurant.sharedObject = buffObj;
						// Setting Currency of Business
						// CURRENCY = selRestaurant.currency;                   // Have to convert Currency Unit
						$rootScope.c_unit = getCurrencySymbol(selRestaurant.currency);
						// Go to current Restaurant Detail page ---
						BusinessSvc.getPaymentmethod.charge({
							businessId : selRestaurant.id,
							lang: localStorageApp.getItem('LangId')
						},function (s) {
							MyLoading.hide();
							buffObj.payData = JSON.parse(s.register).paystatus;
							//gCurRestaurant.sharedObject = buffObj;
							console.log("Set data 1");
							console.log("SET DATA: 1");
							gCurRestaurant.setData(buffObj);
							if (!ADDONS.web_template) $state.go('mobileDetailRest');
							else $state.go('detailRest');
						},function (e) {
							MyLoading.hide();
							console.log(e.message);
						});
						// Go to current Restaurant Detail page ---
					   
					}else {
						MyAlert.show($scope.MLanguages.MOBILE_ERROR+' : ' + s.message);
					}
				},function (e) {
					MyLoading.hide();
					MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
				});

			},function (e) {
				MyLoading.hide();
				console.log(e.message);
			});

		};

		if (ADDONS.web_template) initView();

	})

	.controller('sideMenuCtrl', function($scope, $state, $rootScope, $http, $ionicModal, $ionicPopup, $ionicSideMenuDelegate,
										 $ionicPlatform, gUserData, $ionicHistory,gStates,BusinessSvc,PAYMENT_GATWAY_KEY, ADDONS, MyLoading){

		$scope.ADDONS = ADDONS;
		$scope.$on('$ionicView.enter',function(){
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$scope.state.loginState = LOGIN_STATE;
		});

		if ($rootScope.isAlreadyFbLogined == undefined)
			$rootScope.isAlreadyFbLogined = false;

		$scope.state = {
			loginState : LOGIN_STATE
		};
		/*$rootScope.getLogState = function () {
			return LOGIN_STATE;
		};*/

		/*$rootScope.onGoLogin = function(){
			if (gStates.getState() != STATE.ORDERING) gStates.setState(STATE.PROFILE);
			if (!LOGIN_STATE){
				$state.go('login');
			}else {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go(app_states.profile);
			}
		};

		$rootScope.onGoMyProfile = function(tab){
			if (!tab) tab = 0;
			if (gStates.getState() != STATE.ORDERING) gStates.setState(STATE.PROFILE);
			if (!LOGIN_STATE){
				$state.go('signUp');
			}else {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go(app_states.profile, { 'tab': tab });
			}
		};*/

		$rootScope.getFormattedTime = function (timeJson) {
			/*if (timeJson == undefined) return "00:00";
			var h = parseInt(timeJson.hour);
			var m = parseInt(timeJson.minute);
			if (h > 23) {
				h = h-24;
				//m = 59;
			}
			var period = "";
			if (!TIME_FORMAT_24) {
				if (h > 12) {
					h -= 12;
					period = " PM";
				} else if (h == 12) period = " PM";
				else period = " AM";
				if (h == 0) h = 12;
			}
			if (h < 10) h = '0' + h;
			if (m < 10) m = '0' + m;
			return h + ':' + m + period;*/

			if (timeJson == undefined) return "00:00";
            var h = parseInt(timeJson.hour);
            var m = parseInt(timeJson.minute);

            if (m < 10) m = '0' + m;
            //if(h < 24){
            if(h < 12){
                if (h < 10) h = '0' + h;
                return h + ':' + m +'am';
            }else{
                //rh = h - 24;
                rh = h - 12;
                rh = ('0' + rh).slice(-2);


                return rh + ':' + m +'pm';
            }
		};
		
		BusinessSvc.getPaymentmethod.charge({
			businessId    : '0',
			lang    :localStorageApp.getItem('LangId')
		},function (s) {
			// GCM_DEVICE_TOKEN
			stripepermission = JSON.parse(s.register);
			// console.log(JSON.stringify(stripepermission))
			$scope.stripepermissions =stripepermission.paydtl.ionicstripe.status;
			PAYMENT_GATWAY_KEY.Stripepermissiom = stripepermission.paydtl.ionicstripe.status;
			PAYMENT_GATWAY_KEY.StripeApiSetKey= stripepermission.paydtl.ionicstripe.stripeapikey;
			PAYMENT_GATWAY_KEY.StripeKey= stripepermission.paydtl.ionicstripe.publishablekey;
		},function (e) {
			// alert(e)
			MyLoading.hide();
			console.log(e.message);
		});
		
		$scope.onGoMyOrder = function(){
			gStates.setState(STATE.MY_ORDER);
			if (!LOGIN_STATE){
				$state.go('signUp');
			}else {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('sideMenu.myOrder');
			}
		};
		$scope.addMyCardinfo = function(){
			$rootScope.fromMyCards = true;
			$state.go('sideMenu.cardDetail');
		};
		
		 $scope.onGoMyCard = function(){
			 
		   gStates.setState(STATE.MY_CARD);
			if (!LOGIN_STATE){
				$state.go('signUp');
			}else {
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
			   $state.go('sideMenu.myCard');
			}
			
			 
		};
		

		/*$rootScope.onSignOut = function () {
			LOGIN_STATE = false;
			$scope.state.loginState = LOGIN_STATE;

			// localStorageApp.setItem(STORE_VAL.LOGIN, 'false');
			// localStorageApp.setItem(STORE_VAL.USR_ID, '');
			localStorageApp.removeItem(STORE_VAL.LOGIN);
			localStorageApp.removeItem(STORE_VAL.USR_ID);
			localStorageApp.removeItem(STORE_VAL.LOGIN_ACCOUNT);
			localStorageApp.removeItem(STORE_VAL.IS_FBUSER);


			var buff = {};
			gUserData.setData(buff);
			if (ADDONS.web_template) {
				$state.go(app_states.homeScreen);
			} else {
				$ionicSideMenuDelegate.toggleLeft();
				$ionicHistory.nextViewOptions({
					historyRoot: true,
					disableAnimate: true,
					expire: 300
				});
			}
		}*/
	})
	.controller('profileCtrl', function($scope, $rootScope, $state, $ionicLoading, $ionicPopup, gMyLatLng, gUserData,
										API_ENDPOINT, JqueryPostDataSvc, UserSvc, AddressLookupSvc, MyAlert){

		$scope.show = function() {
			$ionicLoading.show({
				template: '<p>'+$scope.MLanguages.MOBILE_UPDATING+'</p><ion-spinner icon="bubbles" class="spinner-assertive"></ion-spinner>'
			});
		};
		$rootScope.curTab = 0;
		$scope.hide = function(){
			$ionicLoading.hide();
		};
		//console.log($scope.arabic_rtl);

		$scope.$on('$ionicView.beforeEnter', function(){
			initView();
		});

		function initView() {
			$scope.getLanguage(function (err, list, dictionary) {
				if (err) MyAlert.show(err);
				else {
					//$scope.MLanguages = dictionary;
					//$rootScope.MLanguages = dictionary;
					$scope.fbUserState = USER_STATE;
					var gUser = gUserData.getData();

					if (ADDONS.web_template) fixHeight('.bg-gray')

					$scope.dummy = 'img/signup-avatar.png';

					var picUrl = '';
					if (USER_STATE == 'FB_USER'){
						picUrl = gUser.profilepic;
					}else {
						picUrl = ROOT_URL + gUser.profilepic;
					}
					$scope.updateUser = {
						"id"          : gUser.id,
						"name"        : gUser.name,
						"lastname"    : gUser.lastname ,
						"lastname2"   : gUser.lastname2 ,
						"email"       : gUser.email ,
						"password"    : gUser.password ,
						"address"     : gUser.street ,
						"colony"      : gUser.colony ,
						"zip"         : gUser.zip ,
						"country"     : gUser.country ,
						"city"        : gUser.city ,
						"tel"         : gUser.tel ,
						"cel"         : gUser.cel ,
						"api"         : gUser.api,
						"imgpath"     : picUrl
					};
				}
			});
		}

		if (ADDONS.web_template) initView();

		$rootScope.curTab = $state.params.tab;

		//------------------------------
		$scope.updateProfile = function () {
			console.log($scope.updateUser.address);
			$scope.show($ionicLoading);
			if (typeof $scope.updateUser == 'undefined') return;

			UserSvc.updateUser.update({
				lang : localStorageApp.getItem('LangId'),
				Id   : $scope.updateUser.id,
				name    : $scope.updateUser.name,
				email   : $scope.updateUser.email,
				password: $scope.updateUser.password,
				lastName : gUserData.getData().lastname,
				country : gUserData.getData().country,
				city : gUserData.getData().city,
				street : $scope.updateUser.address,
				postCode : $scope.updateUser.zip,
				landPhone : $scope.updateUser.tel,
				mobilePhone : $scope.updateUser.cel,
				apt : gUserData.getData().api
			},{},
			function (res) {
				$scope.hide();
				if (res.error == 'false'){
					MyAlert.show($scope.MLanguages.MOBILE_SUCCESS_UPDATE);
					$scope.updateUser.id = localStorageApp.getItem(STORE_VAL.USR_ID);
					$scope.updateUser.street = $scope.updateUser.address;
					gUserData.setData($scope.updateUser);
				}else{
					MyAlert.show($scope.MLanguages.MOBILE_FAIL_UPDATE);
				}
			},function (e) {
				$scope.hide();
				MyAlert.show($scope.MLanguages.MOBILE_FAIL_UPDATE_TRY_AGAIN);
			});
		};

		$scope.onAutoCompleteAddress = function() {
			setTimeout(function() {
				if (typeof document.getElementsByClassName('backdrop')[0] != 'undefined' &&
					typeof document.getElementsByClassName('pac-container')[0] != 'undefined'){
					for (var i = 0; i < document.getElementsByClassName('pac-container').length; i++){
						document.getElementsByClassName('pac-container')[i].setAttribute('data-tap-disabled', true);
					}
					for (i = 0; i < document.getElementsByClassName('backdrop').length; i++){
						document.getElementsByClassName('backdrop')[i].setAttribute('data-tap-disabled', true);
					}
				}
			}, 100);
		}

		//Web mode

		$scope.onTab = function ($event, tab) {
			$event.preventDefault();
			$rootScope.curTab = tab;
		}

	})
	.controller('orderCtrl', function($scope, $state, $ionicLoading,$ionicScrollDelegate, $ionicPopup, $ionicHistory,
									  MyLoading, MyAlert, $rootScope,
									  gUserData, gStates,gSingleOrderData, OrderSvc, $ionicModal){
		$scope.$on('$ionicView.beforeEnter', function(){
			$ionicScrollDelegate.scrollTop();
			$scope.loadOrderData();
		});
		//-- Getting OrderData from DB ---------------------
		$scope.myOrders = [];
		$scope.loadOrderData = function(){
			MyLoading.show($scope.MLanguages.MOBILE_GETTING_ORDER);
			var cUser = gUserData.getData();
			OrderSvc.getOrderByUser.getOrder({
				userId : cUser.id
			},function (s) {
				MyLoading.hide();
				if (s.error == 'false') {
					$scope.myOrders = s.result.orders;
					var i = 0, len = $scope.myOrders.length;
					for (; i < len; i++){
						$scope.myOrders[i].data = JSON.parse($scope.myOrders[i].data);
					}
					if ($scope.myOrders.length == 0){
						MyAlert.show('\<center\>'+$scope.MLanguages.MOBILE_NO_ORDERS+'\<\/center\>');
					}
				}else {

				}
			},function (e) {
				MyLoading.hide();
				MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
			});

		};

		$scope.sorterFunc = function(person){
			return parseInt(person.id);
		};

		$scope.loadOrderData();
		$scope.orderDetail = {};
		$scope.orderViewMore = function(orderData){
			gSingleOrderData.setData(orderData);
			if (!ADDONS.web_template) $state.go('sideMenu.orderDetail');
			else {
				if ($scope.modal_detail != null) $scope.modal_detail.remove();
				$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/my-order-detail.html', {
				scope: $scope,
				animation: 'slide-in-up'
				}).then(function(modal) {
					$scope.modal_detail = modal;
					$scope.modal_detail.show();
					disableScroll();
				});
				$scope.$on('modal.hidden', function() {
					console.log("Activar scroll");
					enableScroll();
				});
			}
		}

		$scope.closeDetail = function () {
			$scope.modal_detail.hide();
			$scope.modal_detail.remove();
		}
	})
	.controller('cardCtrl', function($scope, $state, $ionicLoading,$ionicScrollDelegate,$ionicNavBarDelegate, $ionicPopup, $ionicHistory,
									  MyLoading, MyAlert, $rootScope, gUserData, gStates,gSingleOrderData, OrderSvc,stripCardSvc,cardRecordSrv,
									  $http,PAYMENT_GATWAY_KEY,gMystripecard, $ionicModal, BusinessSvc){
		
		$scope.$on('$ionicView.beforeEnter', function(){
			$ionicScrollDelegate.scrollTop();
			$scope.loadOrderData();
			$ionicNavBarDelegate.showBar(true);
		});

		$scope.validModel = function (model) {
			return (model && modeil != '');
		}
		//-- Getting OrderData from DB ---------------------
	
		$scope.myOrders = [];
		$scope.loadOrderData = function(){
			MyLoading.show($scope.MLanguages.MOBILE_FRONT_LOAD_GETTING_DATA);

			BusinessSvc.getPaymentmethod.charge({
				businessId    : '0',
				lang    :localStorageApp.getItem(STORE_VAL.LANG)
			},function (s) {
				//console.log(s);
				var stripepermission = JSON.parse(s.register);
				//console.log(stripepermission);
				$scope.stripepermissions =stripepermission.paydtl.ionicstripe.status;
				PAYMENT_GATWAY_KEY.Stripepermissiom = stripepermission.paydtl.ionicstripe.status;
				PAYMENT_GATWAY_KEY.StripeApiSetKey= stripepermission.paydtl.ionicstripe.stripeapikey;
				PAYMENT_GATWAY_KEY.StripeKey= stripepermission.paydtl.ionicstripe.publishablekey;
			
				var cUser = gUserData.getData();
				//console.log(cUser.id, PAYMENT_GATWAY_KEY.StripeApiSetKey);

				stripCardSvc.getCardByUser.getCard({
					userId : cUser.id,
					key: PAYMENT_GATWAY_KEY.StripeApiSetKey
				},function (s) {
					MyLoading.hide();
					if (s.status == "true" || s.status == true) {
						$scope.myCards = s.register;
						gMystripecard.setData(s.register)
						//$scope.myCards =s.register;
						//alert($scope.myCards.length)
						var i = 0, len = $scope.myCards.length;
						for (; i < len; i++) {
							$scope.myCards[i] = $scope.myCards[i];
						}
						if ($scope.myCards.length == 0){
							delete $scope.myCards;
						}
					} else {}
				},function (e) {
					MyLoading.hide();
					MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
				});

			},function (e) {
				// alert(e)
				MyLoading.hide();
				console.log(e.message);
			});
		};
		
		$scope.countrylist={};


		$scope.deleteCard = function(ths,pos){
			var promptPopup = $ionicPopup.confirm({
					title: $scope.MLanguages.MOBILE_APPNAME,
					template: "<p"+(($scope.arabic_rtl)?' class="arabic_rtl"':' style="text-align:center;"')+">"+$scope.MLanguages.MOBILE_QUESTION_DELETE_CARD+"</p>",
					cancelType: 'button-stable',
					cancelText: $scope.MLanguages.MOBILE_CHECKOUT_CANCEL,
					okText: $scope.MLanguages.MOBILE_FOURTH_PAGE_OK.toUpperCase()
				});
				promptPopup.then(function(res) {
					MyLoading.show($scope.MLanguages.MOBILE_FRONT_LOAD_LOADING);
					if (res) {
						
				cardRecordSrv.cardRecord.getMethod({
					cardid : ths.id,
					customerid : ths.customerid,
					key: PAYMENT_GATWAY_KEY.StripeApiSetKey
				 },function (s) {
					
					MyLoading.hide();
					MyAlert.show("\<center\>"+$scope.MLanguages.MOBILE_SUCCESS_DELETE_CARD+"\<\/center\>");
					//$state.go('sideMenu.myCard')
					$scope.myCards.splice(pos, 1);
					//$scope.$apply($state.go($state.current, {}, {reload: true}));
					
				 },function (e) {
					//alert("ll")
				
				MyLoading.hide();
				MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
			});
						
						
						} else {
						 MyLoading.hide();
					   // console.log('Pressed CANCEL!');
					}
				});
		
	
			
			
			
			};
						
		
			
		$scope.sorterFunc = function(person){
			return parseInt(person.id);
		};

		//$scope.loadOrderData();
		$scope.orderDetail = {};
		$scope.orderViewMore = function(orderData){
			gSingleOrderData.setData(orderData);
			$state.go('sideMenu.orderDetail');
		}

		$scope.showAddNewCard = function(){
			if ($scope.modal_add_payment != null) $scope.modal_add_payment.remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/my-card-details.html', {
			scope: $scope,
			animation: 'slide-in-up'
			}).then(function(modal) {
				console.log(modal);
				$scope.modal_add_payment = modal;
				$scope.modal_add_payment.show();
			});
		}

		$scope.closeAddNewCard = function () {
			$scope.modal_add_payment.hide();
			$scope.modal_add_payment.remove();
			$scope.loadOrderData();
		}

		if (ADDONS.web_template) $scope.loadOrderData();
	})

	.controller('orderDetailCtrl', function($scope, $state, $rootScope, gUserData, gSingleOrderData, $ionicModal, DriverSvc, BusinessSvc, ADDONS, OrderSvc, MyLoading){

		$scope.$on('$ionicView.beforeEnter',function() {
			initView();
		});

		function initView() {
			$scope.myCurOrder = gSingleOrderData.getData();
			$scope.cu_unit = $scope.myCurOrder.data.business[0].currency;
			$scope.myOrderId = $scope.myCurOrder.id;
			$scope.myOrderDetail = $scope.myCurOrder.data;

			$scope.payMethod = '';
			console.log($scope.myOrderDetail.business[0].paymethod);
			angular.forEach($scope.myOrderDetail.business[0].paymethod, function (value, key) {
				if (value == true) {
					$scope.payMethod = key;
				}
			});

			/*OrderSvc.getCurrency.getInfo({
				id : $scope.myOrderDetail.business[0].id
			},function (s) {
				console.log(s);           
				if (s.status) {
					$scope.cu_unit = getCurrencySymbol(s.result);    
					 $scope.payMethod = '';
					angular.forEach($scope.myOrderDetail.business[0].paymethod, function (value, key) {
						if (value == true) {
							$scope.payMethod = key;
						}
					});               
				}
			},function (e) {
				
			});*/
			console.log($scope.myCurOrder);
			BusinessSvc.getInformation.charge({
				Id : $scope.myCurOrder.data.business[0].id,
				lang: localStorageApp.getItem('LangId'),
				latitude: 0,
				longitude: 0,
				zipCode: 0
			},{},function (s) {
				var location = JSON.parse(s.result.business.location);
				$scope.logo_business = {
					url: s.result.business.logo,
					scaledSize: new google.maps.Size(40, 40),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(15, 15)
				};
				$scope.marker_business = {
					position: new google.maps.LatLng(location.latitud, location.longitud),
					map: null,
					icon: $scope.logo_business
				};
				console.log($scope.marker_business);
			},function (e) {
				console.log(e);
			});
		}

		if (ADDONS.web_template) initView();

		$scope.ADDONS = ADDONS;
		var map = null;
		var driver = null;
		var interval = null;
		var seeposition = null;
		$scope.showModal = function () {
			MyLoading.show($scope.MLanguages.MOBILE_FRONT_LOAD_LOADING);
			if ($scope.modal) $scope.modal.remove();
			$('.modal-backdrop ion-content').remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/track-position-real-time.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show().then(function () {
					//NEWMAP
					console.log("init map");
					var content = $('.modal-backdrop ion-content');
					var width = content.width();
					var height = content.height();
					console.log(content.width());
					$('#map').width(width);
					$('#map').height(height);
					initMap(document.getElementById('map'));
					interval = setInterval(function () {
						if (width != content.width() || height != content.height()) {
							width = content.width();
							height = content.height();
							$('#map').width(content.width());
							$('#map').height(content.height());
						}
					}, 100);
					seeposition = setInterval(function () {
						DriverSvc.currentPosition.get({
							driverId : $scope.myCurOrder.driverId
						},{},function (s) {
							MyLoading.hide();
							console.log(s.result);
							setMarker(new google.maps.LatLng(s.result.pos_lat, s.result.pos_lnt));
						},function (e) {
							MyLoading.hide();
							console.log(e);
						});
					}, 3000);
				});
			});
		};

		$scope.hideModal = function () {
			$scope.modal.hide();
			map = null;
			driver = null;
			clearInterval(interval);
			clearInterval(seeposition);
		}

		function initMap(div) {
			map = new google.maps.Map(div, {
				center: {lat: 35.397, lng: -80.644},
				zoom: 13
			});
		}
		function setMarker(latlng) {
			if (driver == null) {
				driver = new google.maps.Marker({
					position: latlng,
					map: map,
					icon: {
						url: 'img/car_blue.png',
						scaledSize: new google.maps.Size(40, 40),
						origin: new google.maps.Point(0, 0),
						anchor: new google.maps.Point(15, 15)
					}
				});
				$scope.marker_business.map = map;
				new google.maps.Marker($scope.marker_business);
			}
			driver.setPosition(latlng);
			map.panTo(latlng);
		}

		$scope.showSelectValue = function(mySelect) {
				console.log(mySelect);
			}
		
		

		$scope.goOrder = function(){
			$state.go('sideMenu.myOrder');
		};
	})
	 .controller('cardDetailCtrl', function($scope, $state,MyLoading,MyAlert,$ionicPopup, $rootScope, gUserData,gCurRestaurant, gSingleOrderData,
	 										PAYMENT_GATWAY_KEY,PaymentStripe,gMystripecard, $ionicHistory){


		$scope.$on('$ionicView.beforeEnter',function() {
			
			$scope.myCurOrder = gSingleOrderData.getData();
			$scope.myOrderId = $scope.myCurOrder.id;
			$scope.myOrderDetail = $scope.myCurOrder.data;
			$scope.myUserData = gUserData.getData();
			$scope.curBusiness = gCurRestaurant.getData();
			$scope.myCardsRecord = gMystripecard.getData();

			$scope.payMethod = '';
    		$scope.myStripeRecord = {
    			creditno : '',
    			MM : '',
    			YY : '',
    			CVC : '',
    			zip : $scope.myUserData.cp
            };

			angular.forEach($scope.myOrderDetail.business[0].paymethod, function (value, key) {
				if (value == true) {
					$scope.payMethod = key;
				}
			});
		});
	 // $scope.myUserDatacp = gUserData.getData().cp;
	//	$scope.myUserData.cp = gUserData.getData().cp;
		//alert(JSON.stringify(gUserData.getData().cp))
		 $scope.selexpmonth = [
					{name:'MM', value:'', selected:'selected'},
					{name:'01', value:'01', selected:''},
					{name:'02', value:'02', selected:''},
					{name:'03', value:'03', selected:''},
					{name:'04', value:'04', selected:''},
					{name:'05', value:'05', selected:''},
					{name:'06', value:'06', selected:''},
					{name:'07', value:'07', selected:''},
					{name:'08', value:'08', selected:''},
					{name:'09', value:'09', selected:''},
					{name:'10', value:'10', selected:''},
					{name:'11', value:'11', selected:''},
					{name:'12', value:'12', selected:''},
					
			
				];
	
		 year = new Date().getFullYear();
		 
		
		 
		
		 
		 $scope.selexpyear = [];
		 var itlYear =   {name: 'YY', value:'', selected:'selected'};
		 $scope.selexpyear.push(itlYear);
		 
			for (var i = 0; i < 12; i++) {
				var loopYear = i + year;
				var addYear =   {name: loopYear, value:loopYear, selected:''};
				
				$scope.selexpyear.push(addYear);
				
				
			}
		
		//$scope.selexpmonth.select = "06";
		
		$scope.filterValue = function($event){
		if(isNaN(String.fromCharCode($event.keyCode))){
			$event.preventDefault();
		}
   };


		$scope.updateCardprofile = function (myStripeRecord) {
		//	alert($scope.myStripeRecord.creditno +" "+ typeof $scope.myStripeRecord.creditno.trim())
			if ($scope.myStripeRecord.creditno == '' || $scope.myStripeRecord.MM == '' ||  $scope.myStripeRecord.YY == '' ||  $scope.myStripeRecord.CVC == '' ||  $scope.myStripeRecord.zip == '' ) {
				MyAlert.show($scope.MLanguages.MOBILE_FILL_REQUIRED_FIELDS);
				return;
			} else if(isNaN($scope.myStripeRecord.creditno)){
				MyAlert.show($scope.MLanguages.MOBILE_CARD_NUMBER_ERROR);
				return;
			} else if(isNaN($scope.myStripeRecord.CVC)){
				MyAlert.show($scope.MLanguages.MOBILE_CARD_CVC_ERROR);
				return;
			} else {
				MyLoading.show($scope.MLanguages.MOBILE_PROCESSING);
		 
				var cUser = gUserData.getData();
				PaymentStripe.getPaymentinfoByUser.getinfo({
					name : cUser.name,
					number : $scope.myStripeRecord.creditno,
					cvc : $scope.myStripeRecord.CVC,
					exp_month : $scope.myStripeRecord.MM,
					exp_year : $scope.myStripeRecord.YY,
					userId : cUser.id,
					userCount : $scope.myCardsRecord.count,
					key : PAYMENT_GATWAY_KEY.StripeApiSetKey,
					email :  cUser.email
				},function (s) {
					MyLoading.hide();
					console.log(s);
					if(s.status == true) {
						MyAlert.show('\<center\>'+$scope.MLanguages.MOBILE_INFO_CARD_SUCCESS+'\<\/center\>');	
						if(typeof gCurRestaurant.getData().id == 'undefined' || $rootScope.fromMyCards) {
							$rootScope.fromMyCards = false;
							if (!ADDONS.web_template) $state.go('sideMenu.myCard')
							else $scope.closeAddNewCard();
						} else {
							if (ADDONS.web_template) $scope.closeAddNewCard();
							else $state.go(app_states.finalCheckOut, {"addCardstripe": true});	
						}
					} else {
						MyAlert.show('\<center\>'+$scope.MLanguages.MOBILE_INFO_CARD_ERROR+'\<\/center\>');	
					}
				},function (e) {
					MyLoading.hide();
					MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
				});
			}			
			$scope.myStripeRecord = {
			creditno : '',
				MM : '',
				YY : '',
				CVC : '',
				zip : ''
			};
		};

		$scope.myCardsRecord = gMystripecard.getData();
		//alert(JSON.stringify($scope.myCardsRecord))
		//alert($scope.myCardsRecord.length)
		if(typeof $scope.myCardsRecord.length == "undefined") {
			
			$scope.myCardsRecord.count = 0; 
			
			} else {
			$scope.myCardsRecord.count = $scope.myCardsRecord.length; 	
				}
		
		
	//	Stripe.setPublishableKey(PAYMENT_GATWAY_KEY.StripeKey);	
		//$scope.stripeResponseHandler = function(status, response){};

		
		$scope.goCard = function(){
			//$state.go('sideMenu.myCard');
			window.history.back();
		};
		
	})
	.controller('addressCtrl', function($scope, $state){

	})
	.controller('settingCtrl', function($scope, $state, $ionicLoading, MyLoading, MyAlert, PushNotificationSvc){
		$scope.$on('$ionicView.beforeEnter', function(){
			if (localStorageApp.getItem(STORE_VAL.PUSH) == null){
				$scope.pushState = {curState: $scope.MLanguages.CONTROL_PANEL_USERS_ENABLE_HEADER, checked:true};
			}else if (localStorageApp.getItem(STORE_VAL.PUSH) == 'true'){
				$scope.pushState = {curState:$scope.MLanguages.CONTROL_PANEL_USERS_ENABLE_HEADER, checked:true};
			}else {
				$scope.pushState = {curState:$scope.MLanguages.MOBILE_DISABLED, checked:false};
			}
		});
		$scope.getLoginState = function(){
			return LOGIN_STATE;
		};
		$scope.pushChanged = function(){
			MyLoading.show($scope.MLanguages.MOBILE_UPDATING);
			var log_status = 1;
			if(!$scope.pushState.checked){
				$scope.pushState.curState = $scope.MLanguages.MOBILE_DISABLED;
				log_status = 0;
			}else {
				$scope.pushState.curState = $scope.MLanguages.CONTROL_PANEL_USERS_ENABLE_HEADER;
				log_status = 1;
			}
			PushNotificationSvc.enabled.update({
				userId : localStorageApp.getItem(STORE_VAL.USR_ID),
				enabled : log_status
			},{},function (s) {
				MyLoading.hide();
				MyAlert.show($scope.MLanguages.MOBILE_SUCCESS_UPDATE);
			},function (e) {
				MyLoading.hide();
				MyAlert.show($scope.MLanguages.MOBILE_FAILED+' : ' + e.statusText);
			});
			localStorageApp.setItem(STORE_VAL.PUSH, $scope.pushState.checked);
		};
	})
	
.controller('support&infoCtrl', function($scope, $state, $ionicHistory){

	       $scope.faq = function(){

            window.open(' http://www.biteontime.com/faq.html', '_system', 'location=no');
           };
    
    $scope.privacy = function(){

            window.open('http://www.biteontime.com/privacy.html', '_system', 'location=no');
           };
    $scope.terms = function(){

            window.open('http://www.biteontime.com/terms_conditions.html', '_system', 'location=no');
           };
    $scope.registerbusiness = function(){

            window.open('http://www.biteontime.com', '_system', 'location=no');
           };
    $scope.about= function(){

            window.open('http://www.biteontime.com/about_us.html', '_system', 'location=no');
           };
    $scope.contactus = function(){

            window.open(' http://www.biteontime.com/contact_us.html', '_system', 'location=no');
           };
    
    
    
	   $scope.onClickBack2 = function () {

                $ionicHistory.nextViewOptions({
                    disableBack : false
                });
                //$state.go('sideMenu.homeScreen');
				$state.go('sideMenu.homeScreen');
        };

    $scope.chatNow = function(){

            window.open(' http://lc.chat/now/7177051/', '_system', 'location=no');
           };
    
        /*$scope.chatNow = function (){

            window.__lc = window.__lc || {};
            window.__lc.license = 7177051;
            (function() {
              var lc = document.createElement('script'); lc.type = 'text/javascript'; lc.async = true;
              lc.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdn.livechatinc.com/tracking.js';
              var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s);
            })();
        };*/
    
    })

	.controller('orderingCtrl', function($scope, $state, $ionicHistory){

	})
	.controller('orderingCardCtrl', function($scope, $state, $ionicHistory){

	})

	.controller('searchCtrl', function($scope, $rootScope, $ionicLoading, $ionicPopup,$ionicHistory, $ionicScrollDelegate, $ionicFilterBar,
									   $state, gNearService, gCurRestaurant, gAllBusiness, gStates,
									   MenuSvc, MyLoading, MyAlert, BusinessSvc, gMyLatLng, $filter, $interval, $timeout, GeoCoderSvc, gMyAddress, gOrder){
		$scope.$on('$ionicView.beforeEnter', function(){
			/*$ionicScrollDelegate.scrollTop();
			$scope.loadData();

			$scope.dummyHeader = 'img/dummy_header.png';
			$scope.dummyLogo = 'img/dummy_logo.png';
			if (ADDONS.web_template) {
				$interval(function () {
					var thumbs = $('.thumbnail');
					var max = $(thumbs[0]).height();
					for (var i = 0; i < thumbs.length; i++) {
						if ($(thumbs[i]).height() > max) {
							max = $(thumbs[i]).height();
						}
					}
					//console.log(max);
					$('.thumbnail').height(max);
				}, 500);
			}*/
			initView();
		});

		function initView() {

			//$scope.MLanguages = {};
			$scope.myAddress = gMyAddress.getData();

			$ionicScrollDelegate.scrollTop();
			$scope.loadGoogleMaps(function () {
				$scope.getLanguage(function (err, list, dictionary) {
					if (err) MyAlert(err);
					else {
						//console.log($scope.MLanguages, $rootScope.MLanguages);
						//$rootScope.MLanguages = dictionary;
						//$scope.MLanguages = $rootScope.MLanguages;

						$scope.dummyHeader = 'img/dummy_header.png';
						$scope.dummyLogo = 'img/dummy_logo.png';
						if (ADDONS.web_template) {
							$interval(function () {
								var thumbs = $('.thumbnail');
								var max = 0;
								for (var i = 0; i < thumbs.length; i++) {
									var header = $(thumbs[i]).find('.header');
									var caption = $(thumbs[i]).find('.caption');
									var height = header.outerHeight()+caption.outerHeight()
									//console.log(height);
									if (height > max) {
										max = height;
									}
								}
								//console.log(max);
								$('.thumbnail').height(max);
							}, 500);
						}
						$scope.loadData();
					}
				});
			});
		}

		$scope.orderType = ($state.params.order_type == "pickup")?0:1;
		$scope.show = function() {
			$ionicLoading.show({
				template: '<p>'+$scope.MLanguages.MOBILE_FRONT_LOAD_LOADING+'</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
			});
		};
		$scope.hide = function(){
			$ionicLoading.hide();
		};

		$scope.loadData = function () {
			//MyLoading.hide();
			if (ADDONS.web_template) {
				//console.log($state.params.address);
				if(!$state.params.address || $state.params.address == '') {
					MyAlert.show($scope.MLanguages.FRONT_SELECT_ADDRESS).then(function(res) {
						window.location = '/';
					});
					return;
				}
				console.log($state.params.address == gNearService.getData().nearAddress);
				if ($state.params.address == gNearService.getData().nearAddress) {
					$scope.resturantlist = gAllBusiness.getData();
				} else MyLoading.show($scope.MLanguages.MOBILE_FRONT_LOAD_SEARCHING);
				GeoCoderSvc.getCountryCityFromAddress($state.params.address).then(function (s) {
					var buff = gMyLatLng.getData();
					buff.zip = s.zip;
					buff.cityname = s.city;
					gMyLatLng.setData(buff);
					if (gMyLatLng.getData().lng == undefined || gMyLatLng.getData().lat == undefined) {
						gMyLatLng.getData().lat = s.location.lat;
						gMyLatLng.getData().lng = s.location.lng;
					}
					console.log(s);
					BusinessSvc.getByCondition.charge({
						lang        : localStorageApp.getItem(STORE_VAL.LANG),
						type        : $state.params.order_type,
						country     : s.country,
						city        : s.city,
						address     : '',//$scope.myOrder.curAddress,
						latitude    : s.location.lat,
						longitude   : s.location.lng
					}, function (res) {
						MyLoading.hide();
						if (res.error == false) {
							$scope.resturantlist = res.result.businesses;
							var responseData = {};
							responseData.nearAddress = $state.params.address;       // ???? User Address ? Restaurant Address ?
							responseData.nearCount = res.result.businesses.length;
							responseData.orderType = $state.params.order_type;
							responseData.whereAll = '';
							gNearService.setData(responseData);
							gAllBusiness.setData(res.result.businesses);
							$scope.nearAddress = gNearService.getData().nearAddress;
							$scope.nearCount = gNearService.getData().nearCount;
							if (res.result.businesses.length == 0) {
								MyAlert.show($scope.MLanguages.FRONT_NO_RESULT_FOUND).then(function(res) {
									window.location = '/';
								});
							}
						} else {
							MyAlert.show($scope.MLanguages.FRONT_NO_RESULT_FOUND).then(function(res) {
								window.location = '/';
							});
						}
					});
					$rootScope.cityname = s.city
				},function (e) {
					MyLoading.hide();
					MyAlert.show(e).then(function(res) {
						window.location = '/';
					});
				});
			} else {
				$scope.nearAddress = gNearService.getData().nearAddress;
				$scope.nearCount = gNearService.getData().nearCount;

				$scope.resturantlist = [];
				$scope.resturantlist = gAllBusiness.getData();
				var i = 0, len = $scope.resturantlist.length;
				for (; i < len; i++) {
					// if (typeof $scope.resturantlist[i].catalogs.openTime.opens == 'undefined')
					// {
					//     $scope.resturantlist[i].catalogs.openTime = JSON.parse($scope.resturantlist[i].catalogs.openTime);
					// }
				}

				$scope.rateAry = [];
				for (var j = 0; j < $scope.resturantlist.length; j++){
					$scope.rateAry.push($rootScope.getRateState($scope.resturantlist[j].reviews));
				}
				$scope.rateDisAry = [
					{rate:'stars-dis'},
					{rate:'stars-dis'},
					{rate:'stars-dis'},
					{rate:'stars-dis'},
					{rate:'stars-dis'}
				];

				$scope.openState = false;
			}
		};

		$rootScope.getFormattedTime = function (timeJson) {
			/*if (timeJson == undefined) return "00:00";
			var h = parseInt(timeJson.hour);
			var m = parseInt(timeJson.minute);
			if (h > 23) {
				h = h-24;
				//m = 59;
			}
			var period = "";
			if (!TIME_FORMAT_24) {
				if (h > 12) {
					h -= 12;
					period = " PM";
				} else if (h == 12) period = " PM";
				else period = " AM";
				if (h == 0) h = 12;
			}
			if (h < 10) h = '0' + h;
			if (m < 10) m = '0' + m;
			return h + ':' + m + period;*/

			if (timeJson == undefined) return "00:00";
            var h = parseInt(timeJson.hour);
            var m = parseInt(timeJson.minute);

            if (m < 10) m = '0' + m;
            //if(h < 24){
            if(h < 12){
                if (h < 10) h = '0' + h;
                return h + ':' + m +'am';
            }else{
                //rh = h - 24;
                rh = h - 12;
                rh = ('0' + rh).slice(-2);


                return rh + ':' + m +'pm';
            }
		};   

		$scope.getFormattedDistance = function (distance) {
			//0.621371
			var d = distance;
			var u = $scope.MLanguages.BUSINESS_LIST_OPTIONS_KM;
			if (!DISTANCE_UNIT_KM) {
				d = d * 0.621371;
				u = $scope.MLanguages.BUSINESS_LIST_OPTIONS_MILES;
			}
			return d.toFixed(2)+' '+u;
		}

		$scope.getOpenClose = function(now, oTime) {
			var dt = now;
			if (!oTime) {
				oTime = {};
				oTime.opens = { hour: "0", minute: "0" };
				oTime.closes = { hour: "0", minute: "0" };
			}
			//if (oTime.opens.hour > oTime.closes.hour) oTime.closes.hour = oTime.closes.hour+24;
			var resdt = dt.split(":");
			var resdt_timehr = resdt[0].length > 1 ? "" + resdt[0]: "0" + resdt[0];
			var resdt_timemi = resdt[1].length > 1 ? "" + resdt[1]: "0" + resdt[1];
			var dt = resdt_timehr+":"+resdt_timemi+":00"

			var openhour = oTime.opens.hour > 9 ? "" + oTime.opens.hour: "0" + oTime.opens.hour;
			var openminute = oTime.opens.minute > 9 ? "" + oTime.opens.minute: "0" + oTime.opens.minute;
			var dt1 = openhour+':'+openminute+':00'
			var closehour = oTime.closes.hour > 9 ? "" + oTime.closes.hour: "0" + oTime.closes.hour;
			var closeminute = oTime.closes.minute > 9 ? "" + oTime.closes.minute: "0" + oTime.closes.minute;
			var dt2 = closehour+':'+closeminute+':00'
		 
			if(dt >= dt1 && dt <= dt2) {
				return true;
			}else{
				return false;
			}
		};

			//$scope.loadData();
		$scope.GetDeliveryType = function(){
			alert(1)
			alert(gNearService.getData().orderType)
			return true
		};


			//----------------------------------
			gStates.setState(STATE.MENU);
			//----------------------------------

			$scope.getDeliveryFee = function (zone) {
				var zoneJson = JSON.parse(zone);
				var zone1 = zoneJson.zone1;
				return zone1.price;
			};

			$rootScope.getRateState = function (rNum){
				var rateAry = [];
				for (var i = 0; i < 5; i++){
					if (i < (5 - rNum)){
						rateAry.push({rate:'stars-dis'});
					}else {
						rateAry.push({rate:'stars'});
					}
				}
				return rateAry;
		};

		$scope.onRestaurantItem = function(selRestaurant){
			$rootScope.bufferDishData = [];         // Init Buffer Dish Data
		   ////alert(localStorageApp.getItem('LangId')+"//"+selRestaurant.id+"//"+selRestaurant.timezone)

			// Detect of Open & Close time zone ------------

			if (!$scope.getOpenClose(selRestaurant.now, selRestaurant.openTime)){
				$ionicPopup.alert({
					//title : $scope.MLanguages.MOBILE_APPNAME,
					title : $rootScope.MLanguages.MOBILE_OPEN_CLOSE_TIME,
					template : '\<center\>' + $rootScope.getFormattedTime(selRestaurant.openTime.opens) + ' - ' + $rootScope.getFormattedTime(selRestaurant.openTime.closes) + '\<\center\>'
				});
				return;
			}
			if (ADDONS.web_template) {
				localStorageApp.setItem(STORE_VAL.FROM_SEARCH, true);
				return window.location = ((WEB_ADDONS.remove_hash)?'':'#')+"/"+selRestaurant.customslug;
			}

			//-------------------------------------
			MyLoading.show($scope.MLanguages.MOBILE_GETTING_MENU);
			MenuSvc.getInfo({
				lang : localStorageApp.getItem('LangId'),
				businessId : selRestaurant.id,
				timezone : selRestaurant.timezone
			},function (s) {
				// console.log(s.result);

				var buffObj = {};
				buffObj.id = selRestaurant.id;
				buffObj.now = selRestaurant.now;
				buffObj.openTime = selRestaurant.openTime;
				buffObj.reviews = selRestaurant.reviews;
				buffObj.name = selRestaurant.info.name;
				buffObj.info = s.result;
				buffObj.header = selRestaurant.headerUrl;
				buffObj.logo = selRestaurant.logo;
				buffObj.isImg = selRestaurant.isImg;
				buffObj.isImgH = selRestaurant.isImgH;

				if(gMyLatLng.getData().lat == undefined){
					var lat = 1 
				}else{
					var lat = gMyLatLng.getData().lat  
				}

				if(gMyLatLng.getData().lng == undefined){
					var lng = 1 
				}else{
					var lng = gMyLatLng.getData().lng  
				}

				if(gMyLatLng.getData().zip == undefined){
					var zip = 1 
				}else{
					var zip = gMyLatLng.getData().zip  
				}

	// alert(localStorageApp.getItem('LangId')+"//"+selRestaurant.id+"//"+gMyLatLng.getData().lat+"//"+gMyLatLng.getData().lng+"//"+gMyLatLng.getData().zip)
				BusinessSvc.getInformation.charge({
					Id : selRestaurant.id,
					lang    :localStorageApp.getItem('LangId'),
					latitude : lat,
					longitude : lng,
					zipCode : zip
					/*latitude : 40.75368539999999,
					longitude : -73.9991637,
					zipCode : 10001*/
					
				   
				},function (s) {
					
					if (s.error == 'false'){
						buffObj.restData = s.result.business;
						buffObj.restData.minium = selRestaurant.minimum;
						//DEBUG
						buffObj.deliveryFee = selRestaurant.deliveryCost;
					   // gCurRestaurant.sharedObject = buffObj;
						// Setting Currency of Business
						// CURRENCY = selRestaurant.currency;                   // Have to convert Currency Unit
						$rootScope.c_unit = getCurrencySymbol(selRestaurant.currency);
						// Go to current Restaurant Detail page ---
					BusinessSvc.getPaymentmethod.charge({
						businessId : selRestaurant.id,
						lang: localStorageApp.getItem('LangId')
					},function (s) {
						MyLoading.hide();
						buffObj.payData = JSON.parse(s.register).paystatus;
						//gCurRestaurant.sharedObject = buffObj;
						buffObj.c_unit = getCurrencySymbol(selRestaurant.currency);
						gCurRestaurant.setData(buffObj)
						if (!ADDONS.web_template || gOrder.getData().length > 0 && gOrder.getData()[0].business != gCurRestaurant.getData().id) {
							gOrder.setData([])
							$rootScope.allDishCount = 0;
							$rootScope.refreshNumCart();
						}
						if (!ADDONS.web_template) $state.go('mobileDetailRest');
						else $state.go('detailRest');
					},function (e) {
						MyLoading.hide();
						console.log(e.message);
					});
						
					// Go to current Restaurant Detail page ---
					   
					}else {
						MyAlert.show($scope.MLanguages.MOBILE_ERROR+' : ' + s.message);
					}
				},function (e) {
					MyLoading.hide();
					MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
				});

			},function (e) {
				MyLoading.hide();
				console.log(e.message);
			});

		};

		$scope.searchText = '';
		var filterBarInstance;

		$scope.showFilterBar = function () {
			filterBarInstance = $ionicFilterBar.show({
				items: $scope.resturantlist,
				update: function (filteredItems) {
					$scope.resturantlist = filteredItems;
					$scope.nearCount = filteredItems.length;
				},
				// filterProperties: 'name'
				filter : $filter('filter')
			});
		};

		$scope.gotoHome = function(){
			$ionicHistory.clearCache().then(function(){$state.go(app_states.homeScreen)});
		};

		$rootScope.getWidthRating = function (reviews) {
			//console.log("Width: "+width);
			var ratingWidth = $('.rating').width();
			var starWidth = $('.rating').first().find('i').first().width();
			var offset = (ratingWidth-starWidth*5)/4;
			var ratio = reviews/5;
			var width = (starWidth*5*ratio)+(offset*Math.floor(reviews));
			return width;
		}

		if (ADDONS.web_template) initView();
	})

	.controller('detailRestCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicHistory, gCurRestaurant, gAllBusiness, $ionicPopover, $ionicLoading,
										   gCurDishList, gOrder, $timeout, BusinessSvc, MyLoading, MyAlert, ADDONS, $ionicModal, ProductOptionSvc, gBufferDishes, 
										   $interval, $ionicScrollDelegate, $location,$anchorScroll){									   

			
		//$scope.MLanguages = {};
		$scope.$on('$ionicView.beforeEnter',function(){

			//initView();

			$scope.item = gCurRestaurant.getData();
            $scope.HeaderTitle = $scope.item.name;
            $scope.HeaderUrl = $scope.item.header;
            $scope.LogoUrl = $scope.item.logo;

console.log($scope.item);

            $scope.resMenulist = [];
            $scope.resMenulist = $scope.item.info.categories;
            
            $scope.createSubMenus();
                
            console.log($scope.resMenulist);
            $scope.openTimes = JSON.parse($scope.item.restData.schedule);

            $scope.dummyHeader = 'img/dummy_header.png';
            $scope.dummyLogo = 'img/dummy_logo.png';

            $rootScope.gEditState = false;         // EditState for Dish

            // Getting Tap Data
            if (typeof $scope.reviewList == 'undefined' || typeof $scope.offersList == 'undefined'){
                $scope.getInfoData();
            }

            $scope.bState = {
                review : false,
                offer : false
            };
		});

		$scope.createSubMenus =function(){
            var allFood = $scope.item.info.dishes;
            for(i=0;i<$scope.resMenulist.length;i++){              
                var curDishList = [];
                for (var j = 0, len = allFood.length; j < len; j++){
                    if( $scope.resMenulist[i].id == allFood[j].category ){
                        curDishList.push(allFood[j]);
                    }
                }
                $scope.resMenulist[i].submenu = curDishList;     
                $scope.resMenulist[i].active = true;
            }  
        };
 
		$scope.toggleMenu = function(i){
            if($scope.resMenulist[i].active){
                $scope.resMenulist[i].active = false;
            }else{
                $scope.resMenulist[i].active = true;
            }
            
        };

		$scope.scrollTo = function(x){
            console.log(x,$location.hash());
            $scope.popover.hide();
            if($location.hash()!='anchor' + x){
                $location.hash('anchor' + x);
            }else{
                $ionicScrollDelegate.anchorScroll();
            }
        }

		function initView() {
			$scope.WEB_ADDONS = WEB_ADDONS;
			/*$scope.loadGoogleMaps(function () {
				$scope.getLanguage(function (err, list, dictionary) {
					if (err) MyAlert(err);
					else {
						$rootScope.MLanguages = dictionary;
						$scope.MLanguages = dictionary;

					}
				});
			});*/
			var seeCategories = null;
			$('ion-content').scroll(function() {
				var position = ionic.DomUtil.getPositionInParent($(".description .type")[0]);
				var element = $('#bar-changing');
				if (position.top < $ionicScrollDelegate.getScrollPosition().top) element.removeClass('bar-transparent');
				else element.addClass('bar-transparent');
				if (seeCategories == null) seeCategories = $("div[id^='category']");
				var curScroll = $ionicScrollDelegate.getScrollPosition().top;
				var sw = true;
				for (var i = seeCategories.length-1; i >= 0; i--) {
					var cur_pos_cat = ionic.DomUtil.getPositionInParent(seeCategories[i]);
					if (cur_pos_cat.top < curScroll) {
						$('.bar-subheader').show();
						$('.bar-subheader .title').html($('#'+seeCategories[i].id+' .category .name').html());
						sw = false;
						break;
					}
				}
				if (sw) {
					$('.bar-subheader').hide();
				}
			});
			$scope.item = gCurRestaurant.getData();
			if (ADDONS.web_template) {
				window.scrollTo(0, 0);
				MyLoading.show();
				$timeout(function function_name(argument) {
					MyLoading.hide();
				}, 500);
				fixHeight('.business', true);
				//console.log(gOrder.getData(), $scope.item);
				if (gOrder.getData().length > 0) {
					//console.log("Son los mismos negocios ?", gOrder.getData()[0].business != $scope.item.id, gOrder.getData()[0].business, $scope.item.id)
					if (gOrder.getData()[0].business != $scope.item.id) {
						gOrder.setData([]);
						$rootScope.refreshNumCart();
					}
				}
				/* Categories and cart sticky */
				$(window).scroll(function () {
					var header = $('.navbar').last();
					var cover = $('.cover').last();
					var business_content = $('.business-content').last();
					if (header.height()+cover.height()+business_content.height() > $(this).scrollTop()) {
						$('#categories-tabs').removeClass('fixed').css({
							width: '100%'
						});
					} else {
						$('#categories-tabs').removeClass('fixed');
						$('#categories-tabs').addClass('fixed').css({
							width: cover.width()
						}, 200);
					}
					var cart_stiky = $('#cart-stiky').last();
					var cart = $('.cart').last();
					var footer = $('.footer').last();
					var pos = $(this).scrollTop()+$(window).height()-footer.position().top;
					//console.log(pos+cart_stiky.outerHeight(), $(window).height());
					var toBottom = pos+cart_stiky.outerHeight() > $(window).height();
					if ($(window).width() < 768 || header.height() > $(this).scrollTop() || cart_stiky.outerHeight() > $(window).height()) {
						$('#cart-stiky').removeClass('fixed').removeClass('bottom').css({
							width: '100%',
							'margin-bottom': '0px'
						});
					} else {
						var top = $(this).scrollTop()-header.height();
						//if (toBottom) top -= cart_stiky.outerHeight()-footer.position().top+3;
						$('#cart-stiky').removeClass('fixed').removeClass('bottom');
						if (toBottom) {
							//console.log("Bottom");
							$('#cart-stiky').addClass('fixed').addClass('bottom').css({
								width: cart.width(),
								'margin-bottom': (footer.outerHeight()-($('body').outerHeight()+footer.outerHeight()-$('body').scrollTop()-$(window).height()))+'px'
							});
						} else {
							//console.log("Top");
							$('#cart-stiky').addClass('fixed').css({
								width: cart.width(),
								'margin-bottom': '0px'
							});
						}
						//cart.height(cart_stiky.outerHeight());
					}
				});
			}
			if (gOrder.getData().length > 0 && gOrder.getData()[0].business != gCurRestaurant.getData().id) {
				gOrder.setData([])
				$rootScope.allDishCount = 0;
				$rootScope.refreshNumCart();
			}
			$scope.categories = [];
			for (var i = 0; i < $scope.item.info.categories.length; i++) {
				$scope.categories[$scope.item.info.categories[i].id] = $scope.item.info.categories[i].name;
			}
			//console.log($scope.categories);
			$scope.HeaderTitle = $scope.item.name;
			$scope.HeaderUrl = $scope.item.header;
			$scope.LogoUrl = $scope.item.logo;

			$scope.curNumTab = $scope.item.info.categories.length;

			$scope.resMenulist = [];
			$scope.resMenulist = $scope.item.info.categories;

			if ($scope.resMenulist.length == 0) {
				MyAlert.show($scope.MLanguages.SORRY_NOT_HAVE_MENU).then(function () {
					if (ADDONS.web_template) window.history.back();
					else $state.go('restaurantSearch');
				});
			}
			$scope.filterCategory = $scope.WEB_ADDONS.all_categories?'':$scope.resMenulist[0].id;

			$scope.openTimes = JSON.parse($scope.item.restData.schedule);

			$scope.dummyHeader = 'img/dummy_header.png';
			$scope.dummyLogo = 'img/dummy_logo.png';

			$rootScope.gEditState = false;         // EditState for Dish

			// Getting Tap Data
			if (typeof $scope.reviewList == 'undefined' || typeof $scope.offersList == 'undefined'){
				$scope.getInfoData();
			}

			$scope.bState = {
				review : false,
				offer : false
			};

			
			$scope.get_fisrt = true;
			$scope.li_items = [];
			if (ADDONS.web_template) {
				$interval(function () {
					var categories = $('#categories-tabs').width();
					if ($scope.get_fisrt) {
						var items = $('#categories-tabs ul li');
						for (var i = 0; i < items.length; i++) {
							$scope.li_items.push($(items[i]).width());
						}
						$scope.get_fisrt = false;
					}
					var w = 0;
					for (var i = 0; i < $scope.li_items.length; i++) {
						w += $scope.li_items[i];
					}
					//console.log($scope.li_items);
					var size = 0;
					var numtab = 0;
					for (var i = 0; i < $scope.li_items.length; i++) {
						size += $scope.li_items[i];
						numtab++;
						if (size > categories) numtab--;
					}
					numtab -= 3;
					if (w >categories && $scope.curNumTab != numtab) {
						//console.log("Cambiar a "+numtab+" tabs.");
						$scope.curNumTab = numtab;
					}
				}, 500);
			}
		}

		$scope.ADDONS = ADDONS;
		$scope.menu = {
			menu : $rootScope.MLanguages.MENU_V21,
			info : $rootScope.MLanguages.INFO_V21,
			review : $rootScope.MLanguages.REVIEWSOF_V21,
			offer : $rootScope.MLanguages.OFFERS_V21
		};
		$scope.type = $scope.menu.menu;
		if (ADDONS.web_template) $scope.type = $scope.menu.info;
		$scope.setType = function(event){
			$scope.type = angular.element(event.target).text();
			// console.log($scope.type);
		};

		$scope.onViewOrder = function(){
			if (gOrder.getData().length == 0){
				MyAlert.show($scope.MLanguages.MOBILE_CARD_EMPTY);
			}else{
				$state.go('ordering.checkOut');
			}
		}

		$scope.showCategories = function () {
			$('.backdrop-categories').fadeIn(150);
			$('.float-categories').slideDown(300);
			$('.backdrop-categories').click(function () {
				$('.backdrop-categories').fadeOut(150)
				$('.float-categories').slideUp(300);
			});
		}

		$scope.scrollToCategory = function (category) {
			$('.backdrop-categories').fadeOut(150)
			$('.float-categories').slideUp(300);
			var position = ionic.DomUtil.getPositionInParent($("#category"+category)[0]);
			$ionicScrollDelegate.scrollTo(0, position.top, true);
		}

		$scope.getInfoData = function () {
			// Getting Reviews ----

			BusinessSvc.getReviews.charge({
				Id : $scope.item.id,
				lang : localStorageApp.getItem('LangId')
			},function (s) {
				if (s.error == 'true'){
					// MyAlert.show('Warning : No Business Reviews');
					$scope.bState.review = false;
					$scope.reviewList = [];
				}else {
					$scope.bState.review = true;
					$scope.reviewList = s.result;
				}
			},function (e) {
				MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
			});

			// Getting Offers ----

			BusinessSvc.getOffers.charge({
				Id : $scope.item.id,
				lang : localStorageApp.getItem('LangId')
			},function (s) {
				if (s.error == 'true'){
					//MyAlert.show('Warning : No Business Offers');
					$scope.bState.offer = false;
					$scope.offersList = [];
				}else {
					$scope.bState.offer = true;
					$scope.offersList = s.result;
					$rootScope.offersList = s.result;
					console.log($rootScope.offersList);
				}
			},function (e) {
				MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
			});
		};

		$scope.getWeekdayName = function(idx)
		{
			var weekdayname = "";
			switch (idx) {
				case 0:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_MONDAY;
					break;
				case 1:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_TUESDAY;
					break;
				case 2:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_WEDNESDAY;
					break;
				case 3:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_THURSDAY;
					break;
				case 4:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_FRIDAY;
					break;
				case 5:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_SATURDAY;
					break;
				case 6:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_SUNDAY;
					break;
			}

			return weekdayname

		}

		$scope.goDetailMenu = function(item){
			//console.log($rootScope.MLanguages);
			var allFood = $scope.item.info.dishes;
			var curDishList = [];
			for (var i = 0, len = allFood.length; i < len; i++){
				if( item.id == allFood[i].category ){
					curDishList.push(allFood[i]);
				}
			}
			var buffObj = {};
			buffObj.title = item.name;
			buffObj.info = curDishList;
			gCurDishList.setData(buffObj);

			//$state.go('ordering.detailMenu');
			$state.go('mobileDetailRest');
		};

		$scope.backToRestaurant = function () {
			if (ADDONS.single_business) {
				return $state.go(app_states.homeScreen);
			}
			if (gOrder.getData().length == 0){
				$state.go('restaurantSearch');
			}else{
				var promptPopup = $ionicPopup.confirm({
					title: $scope.MLanguages.MOBILE_APPNAME,
					template: "<p"+(($scope.arabic_rtl)?' class="arabic_rtl"':' style="text-align:center;"')+">"+$scope.MLanguages.MOBILE_QUESTION_CANCEL_ORDER+"</p>",
					cancelType: 'button-stable',
					cancelText: $scope.MLanguages.MOBILE_CHECKOUT_CANCEL,
					okText: $scope.MLanguages.MOBILE_FOURTH_PAGE_OK.toUpperCase()
				});
				promptPopup.then(function(res) {
					if (res) {
						var ary = [];
						gOrder.setData(ary);
						console.log("SET DATA: 3");
						gCurRestaurant.setData({});
						$rootScope.refreshNumCart();
						if (!ADDONS.web_template) {
							$ionicHistory.clearHistory();
							$ionicHistory.clearCache();
						}
						$state.go('restaurantSearch');
					} else {
						console.log('Pressed CANCEL!');
					}
				});
			}
		};
		$rootScope.restTapNum = {
			id : (ADDONS.web_template) ? 1:0
		};
		$rootScope.onClickCategory = function (num) {
			$rootScope.restTapNum.id = num;
		};
		var flag = false;
		var buffnum = -1;
		$scope.collapsItem = function (num) {
			if (buffnum == num){
				$scope.subCollapsNum = -1;
				buffnum = -1;
			}else {
				$scope.subCollapsNum = num;
				if (num == 1) {
					$timeout(function () {
						var loc = JSON.parse($scope.item.restData.location);
						$scope.infoMap = new GoogleMap();
						$scope.infoMap.initialize('business-info-map', loc.latitud, loc.longitud, loc.zoom);
					},200);
				}
				buffnum = num;
			}
		}

		// Web mode
		$scope.selectCategory = function ($event, category, more) {
			$event.preventDefault();
			$scope.filterCategory = category;
			$scope.isMore = (more==null)?false:more;
		}

		$scope.moreInfo = function () {
			if ($scope.modal) $scope.modal.remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/business-more-info-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		};

		$scope.closeInfo = function () {
			$scope.modal.hide();
			if ($scope.modal) $scope.modal.remove();
		}

		$scope.getLength = function (category, dishes) {
			var count = 0;
			for (var i = 0; i < dishes.length; i++) {
				if (dishes[i].category == category.id) count++;
			}
			return count;
		}

		if (ADDONS.web_template) initView();
		

		$ionicPopover.fromTemplateUrl('templates/popover.html', {
        scope: $scope,
      }).then(function(popover) {
        $scope.popover = popover;
      });

	/*})

	.controller('detailMenuCtrl', function($scope, $state, $rootScope, $ionicLoading, $ionicPopup, $ionicModal, MyLoading, MyAlert,
										   gOrder, gCurDishList, ProductOptionSvc, $ionicScrollDelegate, gBufferDishes, ADDONS, $timeout, gCurRestaurant){*/
		$scope.init = function () {
			$scope.item = gCurRestaurant.getData();
			$scope.HeaderTitle = gCurDishList.getData().title;
			$scope.resSubMenulist = [];
			$scope.resSubMenulist = gCurDishList.getData().info;
			$scope.selectedFood = {};
			$scope.ADDONS = ADDONS;
		}

		$scope.showModal = function () {
			if ($scope.modal) $scope.modal.remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/order-product-option-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				//$scope.modal.show();
				$scope.modal.show().then(function () {
					//scrollToMiddle();
					disableScroll();
				});
				$scope.$on('modal.hidden', function() {
					enableScroll();
				});
			});
		};

		$scope.showModalNoAnimation = function () {
			if ($scope.modal) $scope.modal.remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/order-product-option-popup.html', {
				scope: $scope,
				animation: 'none'
			}).then(function(modal) {
				$scope.modal = modal;
				scrollToMiddle()
				$scope.modal.show().then(function () {
					scrollToMiddle();
					disableScroll();
				});
			});
		};

		$scope.hideModal = function () {
			if ($scope.modal) $scope.modal.hide();
		};

		$scope.$on('$ionicView.beforeEnter', function(){
			$scope.init();
			if ($rootScope.gEditState){
				$rootScope.initEditDish();
			}else{
				$scope.initMyDish();
			}
		});

		//----------------------------------------------------------------------------
		$scope.initMyDish = function(){
			$scope.productOptionList = {};
			$scope.C_OState = {
				check : 'yes',
				optional : '1'
			};

			if (gOrder.getData().length == 0){
				$scope.dishes = [];
				$rootScope.allDishCount = 0;
			}else {
				$scope.dishes = gOrder.getData();
				$rootScope.allDishCount = $scope.dishes.length;
			}

			$scope.myDish = {
				"id" : '',
				"name" : '',
				"psettingval" : '',
				"price" : 0,
				"ingredients" : '',
				"options" : '',
				"optionsOnlytext" : '',
				"optionsChoiceId" : '',
				"quantity" : 1,
				"nofgty" : '1',
				"hiddengty_status" : '0',
				"total" : 0,
				"points" : null,
				"extras" : [],
				"extraModel" : [],
				"comments" : ''
			};
			if ($scope.tempCPrice != null && $scope.tempPrice != null){
				$scope.tempPrice.length = 0;
				$scope.tempCPrice.length = 0;
				$scope.tempOptions.length = 0;
			}
		};

		$rootScope.initEditDish = function () {
			var bbDishes = gBufferDishes.getData();
			console.log(bbDishes, $rootScope.editDishNum);
			$scope.productOptionList = bbDishes[$rootScope.editDishNum].oriOptions;
			$scope.selectedFood = bbDishes[$rootScope.editDishNum].info;
			$scope.pOptionModel = bbDishes[$rootScope.editDishNum].dish.extraModel[0].option;
			$scope.myDish = bbDishes[$rootScope.editDishNum].dish;
			$scope.ICheckModel = bbDishes[$rootScope.editDishNum].dish.extraModel[0].IModel;

			$scope.tempPrice = bbDishes[$rootScope.editDishNum].temp.tempPrice;
			$scope.calcPrice = bbDishes[$rootScope.editDishNum].temp.calcPrice;
			console.log(bbDishes[$rootScope.editDishNum].temp.tempOptions, bbDishes[$rootScope.editDishNum].dish.temp_data);
			$scope.tempOptions = bbDishes[$rootScope.editDishNum].dish.temp_data;

			// Saving buffer dish data as original info and oriOptions
			$scope.bufferFood = {
				info : {},
				oriOptions : {},
				temp : {},
				dish : {}
			};
			$scope.bufferFood.info = bbDishes[$rootScope.editDishNum].info;
			$scope.bufferFood.oriOptions = bbDishes[$rootScope.editDishNum].oriOptions;

			$scope.C_OState = {
				check : 'yes',
				optional : '1'
			};

			$scope.dishes = gOrder.getData();
			$rootScope.allDishCount = $scope.dishes.length;

			$scope.showModal();

			/*if ($scope.tempCPrice != null && $scope.tempPrice != null){
				$scope.tempPrice.length = 0;
				$scope.tempCPrice.length = 0;
				$scope.tempOptions.length = 0;
			}*/
		};

		//$scope.initMyDish();    // Initial MyDish Object

		$scope.newModelProduct = function (proOptList) {
			$scope.pOptionModel = {};
			for(var i = 0, len = proOptList.length; i < len; i++){
				var cond = proOptList[i].conditional;
				var maxSelNum = parseInt(proOptList[i].maxSel);
				//if (parseInt(proOptList[i].minSel) > 0){
				if (maxSelNum != 0){
					//$scope.pOptionModel['data_'+proOptList[i].id] = {};
					var tmObj = {};
					tmObj.condition = cond;
					tmObj.value = {};
					tmObj.min = parseInt(proOptList[i].minSel);
					tmObj.max = parseInt(proOptList[i].maxSel);

					for (var j = 0, slen = proOptList[i].objects.length; j < slen; j++){
						//$scope.pOptionModel['data_'+proOptList[i].id]['model_'+proOptList[i].choices[j].id] = false;
						tmObj.value['model_'+proOptList[i].objects[j].choiceId] = false;
					}
					$scope.pOptionModel['data_'+proOptList[i].optionId] = tmObj;
				}else {
					var tObj = {};
					tObj.condition = cond;
					tObj.value = 'none';
					tObj.min = parseInt(proOptList[i].minSel);
					tObj.max = parseInt(proOptList[i].maxSel);
					//$scope.pOptionModel['data_'+proOptList[i].id] = 'none';
					$scope.pOptionModel['data_'+proOptList[i].optionId] = tObj;
				}
			}
			$scope.myDish.price = $scope.oriPrice;
			$scope.myDish.total = $scope.oriPrice;
			$scope.calcPrice = $scope.oriPrice;
		};

		// Click to Single Dish------------------------------------------------

		$scope.onProductOption = function(foodItem){
			$scope.initMyDish();
			$scope.bufferFood = {};
			MyLoading.show($rootScope.MLanguages.MOBILE_FRONT_LOAD_SEARCHING);
			$scope.selectedFood = foodItem;
			// var aa = $scope.selectedFood.ingredients[0];
			if ($scope.selectedFood.ingredients[0] == "[") {
				$scope.selectedFood.ingredients = JSON.parse($scope.selectedFood.ingredients);
			}
			$scope.oriPrice = parseFloat(foodItem.price);

			$scope.bufferFood.info = $scope.selectedFood;      // Add BufferDishData Information for Current Dish

			getIngredientModel($scope.selectedFood.ingredients);
			ProductOptionSvc.getInfo({
				Id : $scope.selectedFood.id,
				lang : localStorageApp.getItem('LangId')
			},function (s) {
				if (s.error == 'false'){
					MyLoading.hide();
					var proOptList = detectCondition(s.result.product.options);
					$scope.newModelProduct(proOptList);
					$scope.productOptionList = s.result.product;
					for (var i = 0; i < $scope.productOptionList.options.length; i++) {
						$scope.productOptionList.options[i].show = ($scope.productOptionList.options[i].conditional == 'no');
					}
					//console.log($scope.productOptionList);
					$scope.productOptionList.options = proOptList;

					$scope.bufferFood.oriOptions = $scope.productOptionList;       // Add Product options by original

					$scope.showModal();
				}else{
					MyLoading.hide();
					MyAlert.show($scope.MLanguages.MOBILE_GET_PRODUCT_OPTIONS_ERROR+" : " + e.message);
					/*$scope.productOptionList = $scope.selectedFood;
					for (var i = 0; i < $scope.productOptionList.options.length; i++) {
						$scope.productOptionList.options[i].show = ($scope.productOptionList.options[i].conditional == 'no');
					}
					$scope.myDish.total = parseFloat($scope.selectedFood.price);
					$scope.calcPrice = parseFloat($scope.selectedFood.price);

					$scope.bufferFood.oriOptions = $scope.productOptionList;       // Add Product options by original

					$scope.showModal();                    //Display Product Option Screen*/
				}
			},function (e) {
				MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
			});
		};

		// Ingredient Check Model -----------------------------------------------

		function getIngredientModel(items) {
			$scope.ICheckModel = {};
			var i = 0, len = items.length;
			for (; i < len; i++) {
				var buff = {
					id : 'ICM_' + i,
					checked : false
				};
				$scope.ICheckModel['' + items[i]] = buff;
			}
		}

		$scope.onCheckIngredient = function(item) {
			/*if ($scope.ICheckModel[''+item].checked == true) {
				$scope.ICheckModel[''+item].checked = false;
			}else {
				$scope.ICheckModel[''+item].checked = true;
			}*/
		};

		function detectCondition(optList) {
			var buffAry = [];
			var buffCondAry = [];
			for (var i = 0; i < optList.length; i++){
				if (optList[i].conditional === "no"){
					buffAry.push(optList[i]);
				}else {
					buffCondAry.push(optList[i]);
				}
			}
			var addedAry = buffAry;
			// If condition Array have some, find the parent of condition option, and insert after parent----

			if (buffCondAry.length != 0){

				for (var j = 0, slen = buffCondAry.length; j < slen; j++){
					var respectIds = buffCondAry[j].respectTo.split(',');
					for (i = 0; i < addedAry.length; i++) {
						if (addedAry[i].optionId == respectIds[0]){
							addedAry.splice(i+1,0,buffCondAry[j]);
						}
					}
				}
			}

			return addedAry;
		}

		$scope.offProductOption = function(){
			$scope.hideModal();//Close Product Option Screen
			$ionicScrollDelegate.$getByHandle('modalContent').scrollTop(true);
			//$scope.modal.remove();
			if ($rootScope.gEditState){
				$rootScope.gEditState = false;
				if (!ADDONS.web_template) $state.go('ordering.checkOut');
				// Web mode
				//$scope.calTotal();
			} else {
				/*$state.go($state.current, {}, {reload: true});
				if (!ADDONS.web_template) $state.go('mobileDetailRest');
								else $state.go('detailRest');
				setTimeout(function () {
					$state.go('ordering.detailMenu');
				}, 20);*/
				//$state.go('ordering.detailMenu');
				//$state.go($state.current, {}, {reload: true});
			}
			// Web mode
			if (ADDONS.web_template) $scope.resetCart();
		};

		window.onhashchange = function() {
			if (ADDONS.web_template) {
				if($scope.offProductOption) $scope.offProductOption();
				if($scope.hideSelectAddress) $scope.hideSelectAddress();
			}
		}

		// Total Price Calculating ----------------------
		$scope.tempCPrice = [];
		$scope.tempOptions = [];
		$scope.onCheckOption = function (option, item) {            ///  Implements price and data in Radio Option
			//TEST
			//$scope.tempCPrice = [];
			//$scope.tempOptions = [];
			// END TEST
			if ($scope.pOptionModel['data_'+option.optionId]['value']['model_'+item.choiceId] === true){
				$scope.calcPrice += parseFloat(item.price);
				$scope.myDish.total = $scope.calcPrice * $scope.myDish.quantity;         // calculate Total Price
				item.optionId = option.optionId;
				$scope.myDish.extras.push(item);
				var bOption = {};
				bOption.id = item.choiceId;
				bOption.option = option;
				bOption.choice = item;
				bOption.prefix = '';
				$scope.tempOptions.push(bOption);
			}else {
				$scope.calcPrice -= parseFloat(item.price);
				$scope.myDish.total = $scope.calcPrice * $scope.myDish.quantity;         // calculate Total Price

				var items = $scope.myDish.extras;
				var remIndex = items.map(function(a) {return a.id; }).indexOf(item.choiceId);
				items.splice(remIndex,1);

				var items1 = $scope.tempOptions;
				var remIndex1 = items1.map(function(a) {return a.id; }).indexOf(item.choiceId);
				items1.splice(remIndex1,1);
			}
		};

		$scope.tempPrice = [];
		$scope.listIndex = 0;
		$scope.onClickOptions = function (option, item, index) {        ///  Implements price and data in Radio Option
			//console.log(option, item, index);
			//console.log($scope.productOptionList);
			//console.log($scope.pOptionModel);
			//$state.reload();
			var leng = $scope.productOptionList.options.length;
			var optionState = false;
			var subtract = [];
			var subtract_options = [];
			var additems = [];
			for(var a = 0; a < leng; a++) {
				if($scope.productOptionList.options[a].respectTo != "") {
					//console.log("Entra: "+$scope.productOptionList.options[a].respectTo);
					var respectIds = $scope.productOptionList.options[a].respectTo.split(',');
					optionState = false;
					if (respectIds[0] == option.optionId) {
						optionState = true;
						//console.log("optionState TRUE");
					}
					if ($scope.productOptionList.options[a].conditional == 'yes') {
						if (respectIds[1] == item.choiceId && optionState) {
							$scope.productOptionList.options[a].show = true;
							$scope.pOptionModel['data_'+$scope.productOptionList.options[a].optionId].choosed = true;
							additems.push($scope.pOptionModel['data_'+$scope.productOptionList.options[a].optionId].value);
						}else if (optionState) {
							$scope.productOptionList.options[a].show = false;
							$scope.pOptionModel['data_'+$scope.productOptionList.options[a].optionId].choosed = false;
							subtract.push($scope.productOptionList.options[a].optionId);
							subtract_options.push($scope.productOptionList.options[a].respectTo);
						}
					}
				}
			}
			$timeout(function () {
				$ionicScrollDelegate.resize();
			}, 200);
			//if (flag && respectIds.length > 0) return;
			var state = false;
			for (var i = 0, len = $scope.tempPrice.length; i < len; i++){
				if ($scope.tempPrice[i].option.optionId == option.optionId){
					$scope.calcPrice -= parseFloat($scope.tempPrice[i].choice.price);
					$scope.calcPrice += parseFloat(item.price);
					$scope.myDish.total = $scope.calcPrice * $scope.myDish.quantity; // Calculate Total Price

					item.optionId = option.optionId;

					// Replacing Selected Choice in same option
					$scope.tempPrice[i].choice = item;
					var j = 0, jLen = $scope.myDish.extras.length;
					for (; j < jLen; j++){
						if ($scope.myDish.extras[j].optionId == option.optionId) {
							var items = $scope.myDish.extras;
							var remIndex = items.map(function(a) {return a.choiceId; }).indexOf(item.choiceId);
							items.splice(remIndex,1);
							break;
						}
					}
					$scope.myDish.extras.push(item);

					for (var i = 0; i < additems.length; i++) {
						//console.log(additems[i]);
						if (additems[i].choiceId) {
							$scope.calcPrice += parseFloat(additems[i].price);
							$scope.myDish.total = $scope.calcPrice * $scope.myDish.quantity;
							bOption = {};
							bOption.id = additems[i].choiceId;
							bOption.option = additems[i];
							bOption.choice = additems[i];
							//bOption.prefix = 'Please choose your ';
							$scope.tempOptions.push(bOption);
						}
					}
					// subtract option items
					for (var i = 0; i < subtract_options.length; i++) {
						for (var j = 0; j < $scope.tempOptions.length; j++) {
							if ($scope.tempOptions[j].option.respectTo == subtract_options[i]) {
								console.log("Eliminar", $scope.tempOptions[j].id, j);
								$scope.pOptionModel['data_'+$scope.tempOptions[j].option.optionId]['value']['model_'+$scope.tempOptions[j].choice.choiceId] = false;
								$scope.onCheckOption($scope.tempOptions[j].option, $scope.tempOptions[j].choice);
								j--;
							}
						}
					}

					// subtract items
					for (var i = 0; i < subtract.length; i++) {
						for (var j = 0; j < $scope.tempOptions.length; j++) {
							if ($scope.tempOptions[j].choice.optionId == subtract[i]) {
								$scope.calcPrice -= parseFloat($scope.tempOptions[j].choice.price);
								$scope.myDish.total = $scope.calcPrice * $scope.myDish.quantity;
								var auxTempOptions = [];
								for (var k = 0; k < $scope.tempOptions.length; k++) {
									if (k != j){
										auxTempOptions.push($scope.tempOptions[k]);
									}
								}
								$scope.tempOptions = auxTempOptions;
							}
						}
					}

					// Replacin Selected Choice in temporary Option List
					var k = 0, kLen = $scope.tempOptions.length;
					for (; k < kLen; k++) {
						if ($scope.tempOptions[k].option.optionId == option.optionId) {
							$scope.tempOptions[k].choice = item;
						}
					}

					state = false;
					break;
				}else{
					state = true;
				}
			}
			if (state == true || $scope.tempPrice.length == 0){
				var buffObj = {
					option : option,
					choice : item
				};

				$scope.tempPrice.push(buffObj);
				$scope.calcPrice += parseFloat(buffObj.choice.price); // Calc Price
				$scope.myDish.total = $scope.calcPrice * $scope.myDish.quantity; // calculate Total Price
				item.optionId = option.optionId;
				$scope.myDish.extras.push(item);

				var bOption = {};
				bOption.id = item.choiceId;
				bOption.option = option;
				bOption.choice = item;
				//bOption.prefix = 'Please choose your ';
				$scope.tempOptions.push(bOption);
			}
		};

		//-----------------------------------------------------------------
		$scope.onPlusQuantity = function(){
			$scope.myDish.quantity++;
			$scope.myDish.total = $scope.calcPrice * $scope.myDish.quantity;
		};
		$scope.onMinusQuantity = function(){
			if($scope.myDish.quantity == 1){
				return;
			}
			$scope.myDish.quantity--;
			$scope.myDish.total = $scope.calcPrice * $scope.myDish.quantity;
		};

		//-----------------------------------------------------------------

		function checkPOptioins() {
			var goState = true;
			var count = 0;
			var counttrue = 0;
			var valid = true;
			for (var key_opt in $scope.pOptionModel) {
				var count = 0;
				if ($scope.pOptionModel[key_opt].condition == 'no' || ($scope.pOptionModel[key_opt].condition == 'yes' && $scope.pOptionModel[key_opt].choosed)) {
					if ($scope.pOptionModel[key_opt].value.choiceId) {
						count = $scope.pOptionModel[key_opt].min;
					} else {
						for (var key_val in $scope.pOptionModel[key_opt].value) {
							if ($scope.pOptionModel[key_opt].value[key_val]) {
								count++;
							}
						}
					}
					if ($scope.pOptionModel[key_opt].min > count 
						|| $scope.pOptionModel[key_opt].max < count) {
						valid = false;
					}
				}
			}
			return valid;
		}

		//-----------------------------------------------------------------
		$scope.onAddToCart = function (obj) {

			//console.log(obj);

			// Check Required Field -----------

			if (!checkPOptioins()) {
				//MyAlert.show($scope.MLanguages.MOBILE_SELECT_REQUIRED_OPTIONS);
				/*$ionicPopup.alert({
					title : $scope.MLanguages.MOBILE_APPNAME,
					template : '\<center\>'+$scope.MLanguages.MOBILE_SELECT_REQUIRED_OPTIONS+'\<\/center\>'
				});*/
				var alertPopup = $ionicPopup.alert({
					title: $scope.MLanguages.MOBILE_APPNAME,
					template: $scope.MLanguages.MOBILE_SELECT_REQUIRED_OPTIONS
				});
				//MyAlert.show($scope.MLanguages.MOBILE_SELECT_REQUIRED_OPTIONS);
				alertPopup.then(function(res) {
					//alertPopup.close();
					$scope.hideModal();
					setTimeout(function () {
						$scope.$apply(function () {
							$scope.showModalNoAnimation();
							setTimeout(function () {
								$scope.$apply(function () {
									$ionicScrollDelegate.scrollBottom();
								});
							}, 10);
						});
					}, 20);
				});

				return;
			}
			if (!$rootScope.gEditState){
				$scope.myDish.tempId = makeid();
				$rootScope.allDishCount++;
			}
			$scope.myDish.id = $scope.selectedFood.id;
			$scope.myDish.business = $scope.item.id;
			$scope.myDish.slug = $state.params.business;
			$scope.myDish.name = $scope.selectedFood.name;
			$scope.myDish.price = $scope.selectedFood.price;
			$scope.myDish.ingredients = $scope.selectedFood.ingredients;

			var buffObj = {};
			buffObj['id'] = obj.id;
			buffObj['option'] = $scope.pOptionModel;    // ProductOption Model
			buffObj['IModel'] = $scope.ICheckModel;     // Ingredient Model
			$scope.myDish.extraModel.push(buffObj);

			var bOptions = '';
			var bChoice = '';
			var bChoiceId = '';

			/// Ingredient Model Setup

			// $scope.ICheckModel['' + items[i]] = buff;
			angular.forEach($scope.ICheckModel, function (value, key) {
				if (value.checked == true) {
					bOptions += '_@_Ingredients@u@' + key;
				}
			});
			//if ($rootScope.gEditState) $scope.tempOptions = $scope.myDish.temp_data;
			var len = $scope.tempOptions.length;
			for (var i = 0; i < len; i++){
				bOptions += '_@_'+$scope.tempOptions[i].option.optionText+'@u@'+$scope.tempOptions[i].choice.choiceName + '    '+$rootScope.c_unit + (parseFloat($scope.tempOptions[i].choice.price)).toFixed(2);
				if (i == 0){
					bChoice += ''+$scope.tempOptions[i].choice.choiceName;
					bChoiceId += ''+$scope.tempOptions[i].choice.choiceId;
				}else {
					bChoice += ',' + $scope.tempOptions[i].choice.choiceName;
					bChoiceId += ','+ $scope.tempOptions[i].choice.choiceId;
				}
			}

			$scope.bufferFood.temp = {
				tempOptions : [],
				calcPrice : $scope.calcPrice,
				tempPrice : []
			};
			$scope.bufferFood.temp.tempOptions = $scope.tempOptions;
			$scope.bufferFood.temp.tempPrice = $scope.tempPrice;

			$scope.myDish.options = bOptions;
			$scope.myDish.optionsOnlytext = bChoice;
			$scope.myDish.optionsChoiceId = bChoiceId;

			$scope.bufferFood.dish = $scope.myDish;                 // Add BufferDishData Dish for Current Dish

			var bDishes = gBufferDishes.getData();
			$scope.myDish.temp_data = JSON.parse(JSON.stringify($scope.tempOptions));
			if ($rootScope.gEditState) {
				$scope.dishes = gOrder.getData();
				var j = 0, llen = $scope.dishes.length;
				for (; j < llen; j++){
					if ($scope.dishes[j].tempId == $scope.myDish.tempId) {
						$scope.dishes[j] = $scope.myDish;                       // updating gOrderData with updated dishData
						console.log("EDIT 1");
					}
					if(bDishes[j].dish.tempId == $scope.myDish.tempId) {
						bDishes[j] = $scope.bufferFood;                            // Updating BufferDishData with Updated DishData
						console.log("EDIT 2");	
					}
				}
			}else{
				bDishes.push($scope.bufferFood);
				//$scope.myDish.temp_data = $scope.bufferFood;
				$scope.dishes.push($scope.myDish);
			}

			if (ADDONS.web_template) {
				if ($scope.dishes.length == 1 && WEB_ADDONS.check_address && !localStorageApp.getItem(STORE_VAL.FROM_SEARCH)) {
					localStorageApp.removeItem(STORE_VAL.FROM_SEARCH);
					$scope.showSelectAddress();
				} else localStorageApp.removeItem(STORE_VAL.FROM_SEARCH);
			}

			gBufferDishes.setData(bDishes);     // Set Buffer Dish Data
			gOrder.setData($scope.dishes);      // Set Global Order Data
			$rootScope.gOrder = $scope.dishes;
			$scope.offProductOption();
		   // $scope.initMyDish();
		};

		$rootScope.getFormattedOptions = function (option_str) {
			var buff1 = option_str.split('_@_');
			var buff2 = [];
			for(var i = 1; i < buff1.length; i++){
				var buff3 = buff1[i].split('@u@');
				var a = buff3[1].split('    ');
				var b = a.join(':');
				buff2.push(b);
			}
			options = buff2.join(', ');
			options = options.replace(/undefined/g, '');
			return options;
		};

		//----------------------------------------------------------------------------

		$scope.onOkEdit = function ( product ) {
			$rootScope.gEditState = false;
			$scope.hideModal();
			$state.go('ordering.checkOut');
		};

		//----------------------------------------------------------------------------
		$scope.prices = {
			breadList: 'bl',
			sizeList: 'sl',
			sauceList: 'sul'
		};

		$scope.onViewOrder = function(){
			if (gOrder.getData().length == 0){
				MyAlert.show($scope.MLanguages.MOBILE_CARD_EMPTY);
			}else{
				$state.go('ordering.checkOut');
			}
		}

		//Web mode
		$rootScope.resetCart = function () {
			console.log('resetCart');
			$rootScope.refreshNumCart();
			$scope.order_total = 0;
			$scope.order_qty = 0;
			if (!$scope.dishes) return;
			for (var i = 0; i < $scope.dishes.length; i++) {
				$scope.order_total += $scope.dishes[i].total;
				$scope.order_qty += $scope.dishes[i].quantity;
				var options = $rootScope.parseOptions($scope.dishes[i].options)
				var html = '';
				for (var option in options) {
					//console.log(key, yourobject[key]);
					html += '<span>';
					html += '<strong>'+option+'</strong><br>';
					html += '<span>'+$rootScope.parseSuboptions(options[option])+'</span>';
					html += '</span>';

				}
				$scope.dishes[i].strOptions = html;
			}
			$scope.resetOrdetData();
		}

	})

	.controller('pOptionCtrl', function ($scope, $state, $ionicScrollDelegate) {
		$scope.$on('$ionicModalView.enter', function() {
			// Code you want executed every time view is opened
			$ionicScrollDelegate.scrollTop();
			// console.log('Opened!')
		});
		$scope.modalInit = function () {
			$ionicScrollDelegate.$getByHandle('modalContent').scrollTop(true);
		}
	})

	.controller('editOptionCtrl', function ($scope, $rootScope, $state) {
		$scope.$on('$ionicView.enter', function() {
			// Code you want executed every time view is opened

		});

	})

	.controller('businessCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicHistory, gCurRestaurant, gAllBusiness,
										   gCurDishList, gOrder, $timeout, BusinessSvc, MyLoading, MenuSvc, MyAlert, ADDONS,
										   $ionicModal, $interval, $timeout, GeoCoderSvc, gBufferDishes, gNearService, GeolocationSvc, 
										   AddressLookupSvc, gMyLatLng, LocationService){

		//$scope.MLanguages = {};
		$scope.$on('$ionicView.beforeEnter',function(){
			initView();
		});

		$scope.ADDONS = ADDONS;

		$scope.myOrder = {
			curAddress: ''
		}

		/*$scope.orderData = {
			type: 'delivery',
			address: $scope.myOrder.curAddress
		}*/

		function initView() {
			$scope.WEB_ADDONS = WEB_ADDONS;
			$scope.loadGoogleMaps(function () {
				$scope.getLanguage(function (err, list, dictionary) {
					if (err) MyAlert(err);
					else {
						//$rootScope.MLanguages = dictionary;
						//$scope.MLanguages = dictionary;
						$scope.menu = {
							menu : $rootScope.MLanguages.MENU_V21,
							info : $rootScope.MLanguages.INFO_V21,
							review : $rootScope.MLanguages.REVIEWSOF_V21,
							offer : $rootScope.MLanguages.OFFERS_V21
						};
						$scope.type = $scope.menu.menu;
						if (ADDONS.web_template) $scope.type = $scope.menu.info;
						BusinessSvc.getInformationBySlug.charge({
							businessSlug : $state.params.business,
							lang    :localStorageApp.getItem(STORE_VAL.LANG)
						}, function (res) {
							console.log(res);
							if (res.error == true || !res.result) return window.location = ((WEB_ADDONS.remove_hash)?'':'#')+'/404'
							$scope.item = {};
							res.result.business = res.result.business[0];
							$scope.item.restData = res.result.business;
							//$scope.item = res.result.business;

							MyLoading.show($scope.MLanguages.MOBILE_GETTING_MENU);
							MenuSvc.getInfo({
								lang : localStorageApp.getItem(STORE_VAL.LANG),
								businessId : res.result.business.id,
								timezone : res.result.business.timezone
							},function (s) {
								// console.log(s.result);

								//var buffObj = {};
								//console.log(res.result.business);
								$scope.item.id = res.result.business.id;
								$scope.item.now = res.result.business.now;
								$scope.item.openTime = res.result.business.openTime;
								$scope.item.reviews = res.result.business.reviews;
								$scope.item.name = res.result.business.info.name;
								$scope.item.header = res.result.business.header;
								$scope.item.logo = res.result.business.logo;
								$scope.item.isImg = 1;
								$scope.item.isImgH = 1;
								$scope.item.info = s.result;
								//console.log($scope.item);

								/*if(gMyLatLng.getData().lat == undefined){
									var lat = 1 
								}else{
									var lat = gMyLatLng.getData().lat  
								}

								if(gMyLatLng.getData().lng == undefined){
									var lng = 1 
								}else{
									var lng = gMyLatLng.getData().lng  
								}

								if(gMyLatLng.getData().zip == undefined){
									var zip = 1 
								}else{
									var zip = gMyLatLng.getData().zip  
								}*/

								/*BusinessSvc.getInformation.charge({
									Id : selRestaurant.id,
									lang    :localStorageApp.getItem('LangId'),
									latitude : lat,
									longitude : lng,
									zipCode : zip
								},function (s) {
									
									if (s.error == 'false'){
										buffObj.restData = s.result.business;
										buffObj.restData.minium = selRestaurant.minimum;
										//DEBUG
										buffObj.deliveryFee = selRestaurant.deliveryCost;
									   // gCurRestaurant.sharedObject = buffObj;
										// Setting Currency of Business
										// CURRENCY = selRestaurant.currency;                   // Have to convert Currency Unit
										$rootScope.c_unit = getCurrencySymbol(selRestaurant.currency);
										// Go to current Restaurant Detail page ---
										*/
									//buffObj.restData = s.result.business;
									$scope.item.restData.minium = res.result.business.minimum == undefined?0:res.result.business.minimum;
									$scope.item.deliveryFee = res.result.business.deliveryCost;                 // Have to convert Currency Unit
									$rootScope.c_unit = getCurrencySymbol(res.result.business.currency);
									$scope.item.c_unit = getCurrencySymbol(res.result.business.currency);
									//console.log(gCurRestaurant.getData());
									BusinessSvc.getPaymentmethod.charge({
										businessId : res.result.business.id,
										lang: localStorageApp.getItem(STORE_VAL.LANG)
									},function (s) {
										//console.log("Payment", s);
										MyLoading.hide();
										$scope.item.payData = JSON.parse(s.register).paystatus;
										gCurRestaurant.sharedObject = $scope.item;
										console.log("Set data 4");
										console.log("SET DATA: 4");
										gCurRestaurant.setData($scope.item);
										$scope.categories = [];
										console.log($scope.item.info.categories);
										if ($scope.item.info.categories.length == 0) {
											gOrder.setData([])
											gBufferDishes.setData([]);
											$scope.dishes = gOrder.getData();
											$rootScope.allDishCount = 0;
											$rootScope.refreshNumCart();
										}
										for (var i = 0; i < $scope.item.info.categories.length; i++) {
											$scope.categories[$scope.item.info.categories[i].id] = $scope.item.info.categories[i].name;
										}
										//console.log($scope.categories);
										$scope.HeaderTitle = $scope.item.name;
										$scope.HeaderUrl = $scope.item.header;
										$scope.LogoUrl = $scope.item.logo;

										$scope.curNumTab = $scope.item.info.categories.length;

										$scope.resMenulist = [];
										$scope.resMenulist = $scope.item.info.categories;

										//console.log($scope.resMenulist);
										$scope.filterCategory = $scope.WEB_ADDONS.all_categories?'':$scope.resMenulist[0].id;

										$scope.openTimes = JSON.parse($scope.item.restData.schedule);

										$scope.dummyHeader = 'img/dummy_header.png';
										$scope.dummyLogo = 'img/dummy_logo.png';

										$rootScope.gEditState = false;         // EditState for Dish

										// Getting Tap Data
										if (typeof $scope.reviewList == 'undefined' || typeof $scope.offersList == 'undefined'){
											$scope.getInfoData();
										}

										$scope.bState = {
											review : false,
											offer : false
										};

										if (gOrder.getData().length == 0){
											$scope.dishes = [];
											$rootScope.allDishCount = 0;
										}else {
											if ($scope.item.id == gOrder.getData()[0].business) {
												$scope.dishes = gOrder.getData();
												$rootScope.allDishCount = $scope.dishes.length;
											} else {
												gOrder.setData([])
												gBufferDishes.setData([]);
												$scope.dishes = gOrder.getData();
												$rootScope.allDishCount = 0;
												$rootScope.refreshNumCart();
											}
										}
										/*gCurRestaurant.sharedObject = buffObj;
										if (!ADDONS.web_template) $state.go('mobileDetailRest');
										else $state.go('detailRest');*/
										if (ADDONS.web_template) {
											window.scrollTo(0, 0);
											MyLoading.show();
											$interval(function () {
												var categories = $('#categories-tabs').outerWidth();
												if ($scope.get_fisrt) {
													var items = $('#categories-tabs ul li');
													if (items.length > 0) {
														for (var i = 0; i < items.length; i++) {
															$scope.li_items.push($(items[i]).outerWidth()+5.5);
														}
														$scope.get_fisrt = false;
													}
												}
												var w = 100;
												var size = 0;
												var numtab = 0;
												for (var i = 0; i < $scope.li_items.length; i++) {
													w += $scope.li_items[i];
													size += $scope.li_items[i];
													numtab++;
													if (size > categories) {
														numtab--;
													}
												}
												numtab -= 3;
												if (!WEB_ADDONS.all_categories) numtab++;
												if (w > categories && $scope.curNumTab != numtab) {
													$scope.curNumTab = numtab;
												} //else if ($scope.curNumTab != numtab) $scope.curNumTab = $scope.li_items.length;
											}, 250);
											$timeout(function function_name(argument) {
												MyLoading.hide();
											}, 500);
											fixHeight('.business', true);
											if (gOrder.getData().length > 0) {
												if (gOrder.getData()[0].business != $scope.item.id) {
													gOrder.setData([]);
													$rootScope.refreshNumCart();
													console.log(gOrder.getData());
												}
											}
											/* Categories and cart sticky */
											$(window).scroll(function () {
												var header = $('.navbar').last();
												var cover = $('.cover').last();
												var business_content = $('.business-content').last();
												if (header.height()+cover.height()+business_content.height() > $(this).scrollTop()) {
													$('#categories-tabs').removeClass('fixed').css({
														width: '100%'
													});
												} else {
													$('#categories-tabs').removeClass('fixed');
													$('#categories-tabs').addClass('fixed').css({
														width: cover.width()
													}, 200);
												}
												var cart_stiky = $('#cart-stiky').last();
												var cart = $('.cart').last();
												var footer = $('.footer').last();
												var pos = $(this).scrollTop()+$(window).height()-footer.position().top;
												//console.log(pos+cart_stiky.outerHeight(), $(window).height());
												var toBottom = pos+cart_stiky.outerHeight() > $(window).height();
												if ($(window).width() < 768 || header.height() > $(this).scrollTop() || cart_stiky.outerHeight() > $(window).height()) {
													$('#cart-stiky').removeClass('fixed').removeClass('bottom').css({
														width: '100%',
														'margin-bottom': '0px'
													});
												} else {
													var top = $(this).scrollTop()-header.height();
													//if (toBottom) top -= cart_stiky.outerHeight()-footer.position().top+3;
													$('#cart-stiky').removeClass('fixed').removeClass('bottom');
													if (toBottom) {
														//console.log("Bottom");
														$('#cart-stiky').addClass('fixed').addClass('bottom').css({
															width: cart.width(),
															'margin-bottom': (footer.outerHeight()-($('body').outerHeight()+footer.outerHeight()-$('body').scrollTop()-$(window).height()))+'px'
														});
													} else {
														//console.log("Top");
														$('#cart-stiky').addClass('fixed').css({
															width: cart.width(),
															'margin-bottom': '0px'
														});
													}
													//cart.height(cart_stiky.outerHeight());
												}
											});
										}
									},function (e) {
										MyLoading.hide();
										console.log(e.message);
									});
							},function (e) {
								MyLoading.hide();
								console.log(e.message);
							});
						});
					}
				});
			});
			//$scope.item = gCurRestaurant.getData();
			$scope.get_fisrt = true;
			$scope.li_items = [];
		}

		/*$scope.showSelectAddress = function () {
			if ($scope.addr_modal) $scope.addr_modal.remove();
			var curType = $scope.orderData.type;
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/select-address-business.html', {
				scope: $scope,
				animation: 'slide-in-up',
				backdropClickToClose: false
			}).then(function(addr_modal) {
				$scope.addr_modal = addr_modal;
				$scope.addr_modal.show().then(function () {
					$scope.orderData.type = curType;
					$scope.orderData.address = $scope.myOrder.curAddress;
					//scrollToMiddle();
					window.scrollTo(0, 0);
					disableScroll();
					setTimeout(function () {
						$($(".pac-container")[$(".pac-container").length-1]).appendTo(".modal-backdrop");
					}, 200);
				});
				$scope.$on('modal.hidden', function() {
					enableScroll();
				});
			});
		}

		$scope.checkAddress = function (order) {
			console.log(order, (order.type == 'delivery')?1:0);
			MyLoading.show();
			GeoCoderSvc.getCountryCityFromAddress(order.address).then(function (s) {
				BusinessSvc.getByCondition.charge({
					lang        : localStorageApp.getItem(STORE_VAL.LANG),
					type        : (order.type == 'delivery')?1:0,
					country     : s.country,
					city        : s.city,
					address     : order.address,//$scope.myOrder.curAddress,
					latitude    : s.location.lat,
					longitude   : s.location.lng
				},function (res) {
					console.log(res);
					if (res.error == 'false') {
						var sw = false;
						for (var i = 0; i < res.result.businesses.length; i++) {
							console.log(res.result.businesses[i].id == $scope.item.id);
							if (res.result.businesses[i].id == $scope.item.id) sw = true;
						}
						if (sw) {
							var nearService = {};
							nearService.nearAddress = order.address;
							nearService.nearCount = res.result.businesses.length;
							nearService.orderType = order.type;
							nearService.whereAll = '';
							gNearService.setData(nearService);
							$scope.hideSelectAddress();
						} else MyAlert.show($scope.MLanguages.BUSINESS_NOT_DELIVER);
					} else MyAlert.show($scope.MLanguages.BUSINESS_NOT_DELIVER);
					MyLoading.hide();
				});
			},function (e) {
				MyLoading.hide();
				MyAlert.show(e);
			});
		}

		$scope.hideSelectAddress = function () {
			if ($scope.addr_modal) {
				console.log("Hide modal");
				$scope.addr_modal.hide();
				$scope.addr_modal.remove();
			}
		}*/

		$scope.setType = function(event){
			$scope.type = angular.element(event.target).text();
			// console.log($scope.type);
		};

		$scope.onViewOrder = function(){
			if (gOrder.getData().length == 0){
				MyAlert.show($scope.MLanguages.MOBILE_CARD_EMPTY);
			}else{
				$state.go('ordering.checkOut');
			}
		}

		$scope.getInfoData = function () {
			// Getting Reviews ----

			BusinessSvc.getReviews.charge({
				Id : $scope.item.id,
				lang : localStorageApp.getItem('LangId')
			},function (s) {
				if (s.error == 'true'){
					// MyAlert.show('Warning : No Business Reviews');
					$scope.bState.review = false;
					$scope.reviewList = [];
				}else {
					$scope.bState.review = true;
					$scope.reviewList = s.result;
				}
			},function (e) {
				MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
			});

			// Getting Offers ----

			BusinessSvc.getOffers.charge({
				Id : $scope.item.id,
				lang : localStorageApp.getItem('LangId')
			},function (s) {
				if (s.error == 'true'){
					//MyAlert.show('Warning : No Business Offers');
					$scope.bState.offer = false;
					$scope.offersList = [];
				}else {
					$scope.bState.offer = true;
					$scope.offersList = s.result;
					$rootScope.offersList = s.result;
				}
			},function (e) {
				MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
			});
		};

		$scope.getWeekdayName = function(idx)
		{
			var weekdayname = "";
			switch (idx) {
				case 0:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_MONDAY;
					break;
				case 1:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_TUESDAY;
					break;
				case 2:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_WEDNESDAY;
					break;
				case 3:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_THURSDAY;
					break;
				case 4:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_FRIDAY;
					break;
				case 5:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_SATURDAY;
					break;
				case 6:
					weekdayname = $rootScope.MLanguages.CONTROL_PANEL_BUSINESS_SCHEDULES_SUNDAY;
					break;
			}

			return weekdayname

		}

		$scope.goDetailMenu = function(item){
			//console.log($rootScope.MLanguages);
			var allFood = $scope.item.info.dishes;
			var curDishList = [];
			for (var i = 0, len = allFood.length; i < len; i++){
				if( item.id == allFood[i].category ){
					curDishList.push(allFood[i]);
				}
			}
			var buffObj = {};
			buffObj.title = item.name;
			buffObj.info = curDishList;
			gCurDishList.setData(buffObj);

			//$state.go('ordering.detailMenu');
			$state.go('mobileDetailRest');
		};

		$scope.backToRestaurant = function () {
			if (ADDONS.single_business) {
				return $state.go(app_states.homeScreen);
			}
			if (gOrder.getData().length == 0){
				$state.go('restaurantSearch');
			}else{
				var promptPopup = $ionicPopup.confirm({
					title: $scope.MLanguages.MOBILE_APPNAME,
					template: "<p"+(($scope.arabic_rtl)?' class="arabic_rtl"':' style="text-align:center;"')+">"+$scope.MLanguages.MOBILE_QUESTION_CANCEL_ORDER+"</p>",
					cancelType: 'button-stable',
					cancelText: $scope.MLanguages.MOBILE_CHECKOUT_CANCEL,
					okText: $scope.MLanguages.MOBILE_FOURTH_PAGE_OK.toUpperCase()
				});
				promptPopup.then(function(res) {
					if (res) {
						console.log('Pressed OK!');
						var ary = [];
						gOrder.setData(ary);
						console.log("SET DATA: 5");
						gCurRestaurant.setData({});
						$rootScope.refreshNumCart();
						if (!ADDONS.web_template) {
							$ionicHistory.clearHistory();
							$ionicHistory.clearCache();
						}
						$state.go('restaurantSearch');
					} else {
						console.log('Pressed CANCEL!');
					}
				});
			}
		};
		$rootScope.restTapNum = {
			id : (ADDONS.web_template) ? 1:0
		};
		$rootScope.onClickCategory = function (num) {
			$rootScope.restTapNum.id = num;
		};
		var flag = false;
		var buffnum = -1;
		$scope.collapsItem = function (num) {
			if (buffnum == num){
				$scope.subCollapsNum = -1;
				buffnum = -1;
			}else {
				$scope.subCollapsNum = num;
				if (num == 1) {
					$timeout(function () {
						var loc = JSON.parse($scope.item.restData.location);
						$scope.infoMap = new GoogleMap();
						$scope.infoMap.initialize('business-info-map', loc.latitud, loc.longitud, loc.zoom);
					},200);
				}
				buffnum = num;
			}
		}

		// Web mode
		$scope.selectCategory = function ($event, category, more) {
			$event.preventDefault();
			$scope.filterCategory = category;
			$scope.isMore = (more==null)?false:more;
		}

		window.onhashchange = function() {
			console.log("Hide all modals");
			$scope.closeInfo();
		}

		$scope.moreInfo = function () {
			if ($scope.modal_info) $scope.modal_info.remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/business-more-info-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal_info = modal;
				$scope.modal_info.show();
			});
		};

		$scope.closeInfo = function () {
			$scope.modal_info.hide();
			if ($scope.modal_info) {
				$scope.modal_info.hide();
				$scope.modal_info.remove();
			}
		}

		$scope.getLength = function (category, dishes) {
			var count = 0;
			for (var i = 0; i < dishes.length; i++) {
				if (dishes[i].category == category.id) count++;
			}
			return count;
		}

		if (ADDONS.web_template) initView();

		var map = null;
		var marker = null;
		var infowindow = null;
		var intervalmap = null;
		$scope.showModal = function () {
			$scope.hideSelectAddress();
			if ($scope.modal) {
				$scope.modal.remove();
			}
			$("#map").remove();
			var pos_element = 0;
			$($("[googleplace]")[pos_element]).remove();
			$('ion-modal-view ion-content').remove();
			//$($(".pac-container")[1]).remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/advanced-search-popup.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show().then(function () {
					$("#rest-full-address").blur();
					var content = $('ion-modal-view ion-content');
					var div = document.getElementById('map');
					var height = content.height();
					var width = content.width();
					$("#map").height(height);
					$("#map").width(width);
					intervalmap = setInterval(function () {
						//console.log(content);
						//console.log($("#map").width(), $("#map").height(), content.width(), content.height());
						if ((height != content.height() || width != content.width()) || (height != $("#map").height() || width != $("#map").width())) {
							console.log("Cambio");
							height = content.height();
							width = content.width();
							$("#map").height(content.height());
							$("#map").width(content.width());
							google.maps.event.trigger(map, 'resize');
						}
					}, 100);
					var options = {
						types: []
					};
					var elements = $("[googleplace]");
					var autocomplete = new google.maps.places.Autocomplete(elements[pos_element], options);
					autocomplete.addListener('place_changed', function() {
						console.log(autocomplete.getPlace().formatted_address);
						$scope.myOrder.curAddress = autocomplete.getPlace().formatted_address;
						reloadMap(map, marker, infowindow, autocomplete.getPlace().geometry.location, autocomplete.getPlace().formatted_address)
						LocationService.searchAddress($scope.myOrder.curAddress).then(function(result) {
							//$scope.search.error = null;
							//$scope.search.suggestions = result;
							//console.log(result[0]);
							$scope.tmp_googleplace = result[0];
						}, function(status){
							//$scope.search.error = "There was an error :( " + status;
							console.log("error" + status);
						});
					});
					setTimeout(function () {
						$($(".pac-container")[$(".pac-container").length-1]).appendTo(".modal-backdrop");
					}, 200);
					function reloadMap(p_map, p_marker, p_infowindow, position, content) {
						map = new google.maps.Map(document.getElementById('map'), {
						  zoom: 18,
						  center: position
						});
						marker = new google.maps.Marker({
						  position: position,
						  map: map
						});
						infowindow = new google.maps.InfoWindow({
							content: parseAddress($scope.myOrder.curAddress),
							disableAutoPan: true
						});
						google.maps.event.clearListeners(map,'center_changed');
						map.addListener('center_changed', function() {
							//console.log(map.getCenter());
							setTimeout(function () {
								if (!$scope.isFocusDir) {
									console.log("Center 1");
									marker.setPosition(map.getCenter());
									AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
										MyLoading.hide();
										swres = true;
										$scope.location = {
											address : addr.address,
											location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
										};
										gMyLatLng.setData($scope.location.location);
										$scope.myOrder.curAddress = $scope.location.address;
										if (infowindow) infowindow.close();
										infowindow = new google.maps.InfoWindow({
											content: parseAddress($scope.location.address),
											disableAutoPan: true
										});
										infowindow.open(map, marker);
									},function(error){
										MyLoading.hide();
										swres = true;
										$scope.myOrder.curAddress = ADDRESS.street;
										MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
									});
								}
							}, 300);
						});
						infowindow.open(map, marker);
					}
					$scope.myOrder.curAddress = ADDRESS.street;
					var uluru = { lat: ADDRESS.latitude, lng: ADDRESS.longitude };
					map = new google.maps.Map(document.getElementById('map'), {
					  zoom: 18,
					  center: uluru
					});
					marker = new google.maps.Marker({
					  position: map.getCenter(),
					  map: map
					});
					map.addListener('center_changed', function() {
						//console.log(map.getCenter());
						setTimeout(function () {
							if (!$scope.isFocusDir) {
								console.log("Center 2");
								marker.setPosition(map.getCenter());
								AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
									MyLoading.hide();
									swres = true;
									$scope.location = {
										address : addr.address,
										location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
									};
									gMyLatLng.setData($scope.location.location);
									$scope.myOrder.curAddress = $scope.location.address;
									infowindow.close();
									infowindow = new google.maps.InfoWindow({
										content: parseAddress($scope.location.address),
										disableAutoPan: true
									});
									infowindow.open(map, marker);
								},function(error){
									MyLoading.hide();
									swres = true;
									$scope.myOrder.curAddress = ADDRESS.street;
									MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
								});
							}
						}, 300);
					});
					map.addListener('resize', function() {
						//console.log(map.getCenter());
						map = new google.maps.Map(document.getElementById('map'), {
							zoom: 18,
							center: uluru
						});
						marker = new google.maps.Marker({
							position: map.getCenter(),
							map: map
						});
						map.addListener('center_changed', function() {
							//console.log(map.getCenter());
							setTimeout(function () {
								if (!$scope.isFocusDir) {
									console.log("Center 3");
									marker.setPosition(map.getCenter());
									AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
										MyLoading.hide();
										swres = true;
										$scope.location = {
											address : addr.address,
											location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
										};
										gMyLatLng.setData($scope.location.location);
										$scope.myOrder.curAddress = $scope.location.address;
										infowindow.close();
										infowindow = new google.maps.InfoWindow({
											content: parseAddress($scope.location.address),
											disableAutoPan: true
										});
										infowindow.open(map, marker);
									},function(error){
										MyLoading.hide();
										swres = true;
										$scope.myOrder.curAddress = ADDRESS.street;
										MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
									});
								}
							}, 300);
						});
					});
					infowindow = new google.maps.InfoWindow({
						content: parseAddress($scope.myOrder.curAddress),
						disableAutoPan: true
					});
					MyLoading.show($scope.MLanguages.MOBILE_FETCHING);
					var swres = false;
					GeolocationSvc().then(function(position) {
						AddressLookupSvc.lookupByAddress(position.lat, position.lng).then(function(addr) {
							MyLoading.hide();
							swres = true;
							$scope.location = {
								address : addr.address,
								location : { lat : position.lat, lng : position.lng, zip : addr.zip }
							};
							gMyLatLng.setData($scope.location.location);
							$scope.myOrder.curAddress = $scope.location.address;
							map = new google.maps.Map(document.getElementById('map'), {
								zoom: 18,
								center: { lat : position.lat, lng : position.lng, zip : addr.zip }
							});
							marker = new google.maps.Marker({
								position: { lat : position.lat, lng : position.lng, zip : addr.zip },
								map: map
							});
							infowindow.close();
							infowindow = new google.maps.InfoWindow({
								content: parseAddress($scope.location.address),
								disableAutoPan: true
							});
							infowindow.open(map, marker);
							map.addListener('center_changed', function() {
								//console.log(map.getCenter());
								setTimeout(function () {
									if (!$scope.isFocusDir) {
										marker.setPosition(map.getCenter());
										AddressLookupSvc.lookupByAddress(map.getCenter().lat(), map.getCenter().lng()).then(function(addr) {
											MyLoading.hide();
											swres = true;
											$scope.location = {
												address : addr.address,
												location : { lat : map.getCenter().lat(), lng : map.getCenter().lng(), zip : addr.zip }
											};
											gMyLatLng.setData($scope.location.location);
											$scope.myOrder.curAddress = $scope.location.address;
											infowindow.close();
											infowindow = new google.maps.InfoWindow({
												content: parseAddress($scope.location.address),
												disableAutoPan: true
											});
											infowindow.open(map, marker);
										},function(error){
											MyLoading.hide();
											swres = true;
											$scope.myOrder.curAddress = ADDRESS.street;
											MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
										});
									}
								}, 300);
							});
						},function(error){
							MyLoading.hide();
							swres = true;
							$scope.myOrder.curAddress = ADDRESS.street;
							MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
						});

					},function(err){
						MyLoading.hide();
						$scope.myOrder.curAddress = ADDRESS.street;
						swres = true;
						MyAlert.show(err.message);
					});
					setTimeout(function () {
						if (!swres) {
							MyLoading.hide();
							$scope.myOrder.curAddress = ADDRESS.street;
							MyAlert.show($scope.MLanguages.MOBILE_GET_LOCATION_ERROR);
						}
					}, 10000);

				});
			});
		};

		function parseAddress(address) {
			var pos = address.indexOf(',');
			if (pos != -1) {
				var parts = address.split(',');
				address = parts[0];
				for (var i = 1; i < parts.length; i++) {
					address += '<br>'+parts[i];
				}
			}
			return address;
		}

		$scope.cleanAddress = function () {
			$scope.myOrder.curAddress = '';
		}

		/*$scope.$on('modal.hidden', function() {
			$scope.hideModal();
		});*/

		$scope.hideModal = function () {
			if ($scope.modal != null && $scope.modal.isShown()) $scope.modal.hide();
			if (map) {
				google.maps.event.clearListeners(map,'center_changed');
			}
			map = null;
			marker = null;
			infowindow = null;
			clearInterval(intervalmap);
		};

		$scope.findRest = function () {
			$scope.hideModal();
			$scope.showSelectAddress();
		}

		$scope.openMap = function () {
			if ($scope.ADDONS.advanced_search) {
				if (typeof cordova !== undefined) return $scope.showModal();
				cordova.plugins.diagnostic.isLocationAvailable(function(available){
					if (available) {
						console.log("Pedir permiso.");
						cordova.plugins.diagnostic.requestLocationAuthorization(function(status){
							switch(status){
								case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
									console.log("Permission not requested");
									break;
								case cordova.plugins.diagnostic.permissionStatus.GRANTED:
									console.log("Permission granted");
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED:
									console.log("Permission denied");
									break;
								case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
									console.log("Permission permanently denied");
									break;
								case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
									console.log("Permission granted only when in use");
									break;
							}
							$scope.showModal();
						}, function(error){
							console.error("Error: "+error);
						}, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);
					} else {
						console.log("Pedir permiso GSP.");
						cordova.plugins.locationAccuracy.canRequest(function(canRequest){
							if(canRequest){
								cordova.plugins.locationAccuracy.request(function(){
									console.log("Request successful");
									$scope.openMap();
								}, function (error){
									$scope.showModal();
								}, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY // iOS will ignore this
								);
							}
						});
					}
				}, function(error){
					console.log("Error GPS.");
					$scope.showModal();
				});
			}
		}
	})

	.controller('checkOutCtrl',function($scope, $state, $rootScope, $ionicLoading, $ionicModal, $ionicPopup, $ionicHistory,
										gNearService,gDeliveryComment, gAllBusiness, gCurRestaurant, gOrder, gUserData,
										gBusinessData, CheckoutInfoSvc, gStates, gBufferDishes, ADDONS, $interval, gMyLatLng, BusinessSvc){

		$scope.ADDONS = ADDONS;
		$scope.citems = 0;
		$scope.show = function() {
			$ionicLoading.show({
				template: '<p>{{MLanguages.MOBILE_FRONT_LOAD_GETTING_DATA}}</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
			});
		};
		$scope.hide = function(){
			$ionicLoading.hide();
		};

		$scope.$on('$ionicView.beforeEnter', function(){
		   initOrderData();
		});

		if (ADDONS.web_template) {
			//initOrderData();
			var checkCurOrder = $interval(function () {
				if (gCurRestaurant.getData().id) {
					$interval.cancel(checkCurOrder);
					$scope.getLanguage(function (err, list, dictionary) {
						//$scope.MLanguages = dictionary;
						//$rootScope.MLanguages = dictionary;
						initOrderData();
					});
				}
			}, 100);
		}
		$rootScope.resetOrdetData = function () {
			initOrderData();
			$scope.updateOrderData();
		}
		function initOrderData () {
			// Getting Current Business Information -------------
			$scope.curBusiness = gCurRestaurant.getData();
			$scope.curBusinessInfo = $scope.curBusiness.restData;
			$scope.curBusinessInfo.deliveryCost = $scope.curBusiness.deliveryFee;

			//console.log("initOrderData", $scope.curBusiness);

			if (ADDONS.web_template && gOrder.getData().length > 0) {
				console.log("Borrar", gOrder.getData()[0].business, gCurRestaurant.getData().id);
				if (gOrder.getData()[0].business != gCurRestaurant.getData().id) {
					gOrder.setData([]);
					$rootScope.refreshNumCart();
				}
			}
			$scope.curMyDishes = gOrder.getData();
			//if (ADDONS.web_template) $scope.curMyDishes = $rootScope.gOrder;
			//console.log($scope.curMyDishes);
			$scope.deliveryFee = $scope.curBusiness.deliveryFee*((gNearService.getData().orderType == 'pickup')?0:1);
			$scope.delivery = {
				comments : ''
			};

			if ($scope.curBusinessInfo.minium == "") $scope.curBusinessInfo.minium = "0";
			$scope.minimumPrice = parseFloat($scope.curBusinessInfo.minium);
			$scope.subTotal = 0;

			$scope.order_qty = 0;
			for (var i = 0, len = $scope.curMyDishes.length; i < len; i++) {
				$scope.subTotal += $scope.curMyDishes[i].total;
				$scope.order_qty += $scope.curMyDishes[i].quantity;
			}

			/*Begin Offers*/
			console.log($scope.subTotal);
			console.log($rootScope.offersList, $scope.curBusiness);
			$scope.discount = 0;

			BusinessSvc.getOffers.charge({
				Id : $scope.curBusiness.id,
				lang : localStorageApp.getItem('LangId')
			},function (s) {
				if (!s.error){
					for (var i = 0; i < s.result.offers.length; i++) {
						console.log(s.result.offers[i]);
						if ($scope.subTotal > s.result.offers[i].minprice) {
							console.log("Valido");
							if (s.result.offers[i].type == '1') {
								console.log("%");
								$scope.discount = ($scope.subTotal*parseFloat(s.result.offers[i].rate)/100).toFixed(2);
							} else if (s.result.offers[i].type == '2') {
								console.log("$");
								$scope.discount = parseFloat(s.result.offers[i].rate).toFixed(2);
							}
							console.log($scope.discount);
							break;
						}
					}
				}
			});
			/*End Offers*/

			$scope.calcTotalPrice = 0;
			if($scope.curBusinessInfo.serviceFee == ""){
				$scope.curBusinessInfo.serviceFee = 0;
			}
			var feePro = parseFloat($scope.curBusinessInfo.serviceFee) * 0.01;
			$scope.serviceFee = $scope.subTotal * feePro;

			// Relation of Tax --------------------------
			var taxPro = parseFloat($scope.curBusinessInfo.tax) * 0.01;
			$scope.taxPrice = $scope.subTotal * taxPro;

			$scope.tax = [
				{ id : 1, val : $rootScope.MLanguages.Tax_not_included_V2 },
				{ id : 2, val : $rootScope.MLanguages.Tax_included_V2 }
			];

			$scope.taxType = $scope.tax[parseInt($scope.curBusinessInfo.taxType) - 1].val;
			/*if ($scope.curBusinessInfo.taxType == '2'){
				$scope.calcTotalPrice = $scope.subTotal + $scope.serviceFee + parseFloat($scope.deliveryFee);
			}else {
				$scope.calcTotalPrice = $scope.subTotal + $scope.serviceFee + parseFloat($scope.deliveryFee) + $scope.taxPrice;
			}*/
			if ($scope.curBusinessInfo.taxType == '2'){
				$scope.calcTotalPrice = $scope.subTotal + parseFloat($scope.deliveryFee);
			}else {
				$scope.calcTotalPrice = $scope.subTotal + parseFloat($scope.deliveryFee) + $scope.taxPrice;
			}

			$scope.calcTotalPrice += $scope.serviceFee;

			$scope.businessData = {
				"Total" : $scope.calcTotalPrice.toFixed(2),
				"business" : [],
				"buyer" : {},
				"customslug" : $scope.curBusinessInfo.customSlug,
				"discountprice" : 0,
				"grandtotal" : $scope.subTotal.toFixed(2),
				"reserve" : {},
				"reserveFee" : 0,
				"reservePrice" : {},
				"reserveQty" : {},
				"reservepaymethod" : {
					"payu":false,
					"cash":false,
					"card":false,
					"paypal":false,
					"paypaladaptive":false,
					"authorize":false,
					"braintree":false,
					"mercury":false,
					"worldpay":false,
					"mercadopago":false,
					"transactium":false,
					"pexpress":false,
					"maksekeskus":false,
					"voguepay":false,
					"skrill":false,
					"payeezy":false,
					"stripe":false,
					"paypalpro":false,
					"paygistix":false
				},
				"reservepaymethoddetails" : {
					"payu":true,
					"cash":true,
					"card":true,
					"paypal":true,
					"paypaladaptive":true,
					"authorize":false,
					"braintree":false,
					"mercury":false,
					"worldpay":false,
					"mercadopago":false,
					"transactium":false,
					"pexpress":false,
					"maksekeskus":false,
					"voguepay":false,
					"skrill":false,
					"payeezy":false,
					"stripe":true,
					"paypalpro":true,
					"paygistix":true
				},
				"reservestatus" : false,
				"servicefee" : $scope.curBusinessInfo.serviceFee,
				"servicefeeTotal" : $scope.serviceFee.toFixed(2),
				"servicefeeTotal1" : $scope.serviceFee,
				"tax" : ($scope.taxPrice).toFixed(2),
				"total" : $scope.subTotal + $scope.serviceFee, //Aqui DEBUG
				"twilioenabledclient" : false,
				"searchinfo" : {}
			};

			$scope.singleBusiness = {
				"id" : $scope.curBusinessInfo.id,
				"name" : $scope.curBusinessInfo.info.name,
				"tel" : $scope.curBusinessInfo.tel,
				"email" : $scope.curBusinessInfo.email,
				"paymethod" : {
					"cash":false,
					"card":false,
					"paypal":false,
					"paypaladaptive":false,
					"authorize":false,
					"braintree":false,
					"mercury":false,
					"worldpay":false,
					"mercadopago":false,
					"transactium":false,
					"pexpress":false,
					"maksekeskus":false,
					"voguepay":false,
					"skrill":false,
					"payeezy":false,
					"stripe":false,
					"payu":false
				},
				"paymethoddetail" : {
					"cash":true,
					"card":true,
					"paypal":true,
					"paypaladaptive":false,
					"authorize":false,
					"braintree":false,
					"mercury":false,
					"worldpay":false,
					"mercadopago":false,
					"transactium":false,
					"pexpress":false,
					"maksekeskus":false,
					"voguepay":false,
					"skrill":false,
					"payeezy":false,
					"payu":false
				},
				"shipping" : $scope.curBusinessInfo.deliveryCost,
				"minimum" : $scope.curBusinessInfo.minium,
				"dishes" : [],
				"twiliophone" : $scope.curBusinessInfo.twilioPhone,
				"twilioenabled" : $scope.curBusinessInfo.twilioEnabled,
				"acceptsms" : $scope.curBusinessInfo.acceptsms
			};

			$rootScope.buyerInfo = {
				"id" : "",
				"address" :"",
				"city" :"",
				"cityname" :"",
				"tax" :$scope.curBusinessInfo.tax,
				"taxtype" :$scope.curBusinessInfo.taxType,
				"deliveryType" :"",
				"deliverydate" :"ASAP",
				"comments" : "",
				"name" :"",
				"lastname2" :"",
				"email" :"",
				"api" :"",
				"colony" :"",
				"tel" :"",
				"checkoutfields" : [
					"Phone",
					"Receive SMS",
					"Tip For The Driver",
					"Discount Coupon",
					"ChackoutMap",
					"Name",
					"Last Name",
					"Email",
					"Full Address",
					"APT\/Suit",
					"Area \/ Neighborhood"
				]
			};
			$scope.citems = gOrder.getData().length;
		}

		$scope.updateOrderData = function () {
			$scope.singleBusiness.dishes = $scope.curMyDishes;
			$scope.businessData.business.push($scope.singleBusiness);
			$scope.businessData.buyer = $rootScope.buyerInfo;
			//$scope.businessData.taxPrice = $scope.taxPrice;
			//$scope.businessData.taxType = $scope.curBusinessInfo.taxtype;
			gBusinessData.setData($scope.businessData);
		};

		$scope.C_OState = {
			check : 'yes',
			optional : '1'
		};

		$scope.parseDataFloat = function (number) {
			var str_num = ''+number;
			str_num = str_num.replace(/,/g, '');
			return parseFloat(str_num);
		}

		// Checking User Information--------------------------
		$scope.onFinalCheckOut = function(){

			gStates.setState(STATE.ORDERING);
			//gStates.setState(STATE.MY_ORDER);
			//gStates.getState() == STATE.MY_ORDER

			$scope.updateOrderData();
			if (typeof gUserData.getData().id == 'undefined'){
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				gDeliveryComment.setData($scope.delivery.comments);
				$rootScope.afterLogin = 'ordering.detailMenu';
				$state.go((ADDONS.web_template?'main.':'')+'signUp');
			}else {
				$scope.show($ionicLoading);
				CheckoutInfoSvc.getInfo({

				}, function(res) {

					if (res.error == 'false') {
						$rootScope.infoFields = res.result.checkout;
						$scope.checkFields = [];
						angular.forEach(res.result.checkout, function (obj) {
							if (obj.status == true) {
								$scope.checkFields.push(obj.field_name);
							}
						});
						$rootScope.buyerInfo.id = gUserData.getData().id;          // String
						$rootScope.buyerInfo.address = gUserData.getData().address;          // String
						$rootScope.buyerInfo.city = gUserData.getData().city;                // Number
						$rootScope.buyerInfo.cityname = gMyLatLng.getData().cityname;     // String
						//$rootScope.buyerInfo.tax = ''+$scope.taxPrice;                 // Number
						//$rootScope.buyerInfo.taxtype = $scope.curBusinessInfo.taxtype;             // Number
						$rootScope.buyerInfo.deliveryType = gNearService.getData().orderType;   // String
						$rootScope.buyerInfo.deliverydate = "ASAP";     // String(date)
						$rootScope.buyerInfo.name = gUserData.getData().name;               // String
						$rootScope.buyerInfo.lastname2 = gUserData.getData().lastname2;         // String
						$rootScope.buyerInfo.email = gUserData.getData().email;   // String
						$rootScope.buyerInfo.api = gUserData.getData().api;                 // String
						$rootScope.buyerInfo.colony = gUserData.getData().colony;            // String
						$rootScope.buyerInfo.tel = gUserData.getData().tel;           // String
						$rootScope.buyerInfo.checkoutfields = $scope.checkFields;
						$rootScope.buyerInfo.comments = $scope.delivery.comments;

						$scope.businessData.buyer = $rootScope.buyerInfo;
						gBusinessData.setData($scope.businessData);
						$scope.hide();
					}
				});

				$rootScope.bufferDishData = [];
				$state.go(app_states.finalCheckOut);
			}
		};

		$rootScope.parseOptions = function (options) {
			options = options.split('_@_');
			options.splice(0,1);
			//console.log(options);
			var p_options = {};
			for (var i = 0; i < options.length; i++) {
				var option = options[i].split('@u@');
				var select = option[1].split('    ');
				if (p_options[option[0]] == undefined) p_options[option[0]] = [];
				p_options[option[0]].push({name: select[0], price: select[1]});
			}
			return p_options;
		}

		$rootScope.parseSuboptions = function (options) {
			var html = "";
			for (var i = 0; i < options.length; i++) {
				html += options[i].name+((options[i].price != undefined)?' '+options[i].price:'')+"<br>";
			}
			return html;
		}

		$scope.offFinalCheckOut = function(){
			$scope.modal.hide();
		};

		// Management Dish - Edit - Remove --------------------

		$scope.onClickEdit = function ( sDish ) {
			$rootScope.gEditState = true;
			var bDishes = gBufferDishes.getData();
			var i = 0, len = bDishes.length;
			for (; i < len; i++){
				if (sDish.tempId === bDishes[i].dish.tempId && sDish.id == bDishes[i].dish.id){
					$scope.currentBufferDish = bDishes[i];
					$rootScope.editDishNum = i;
				}
			}
			//if (!ADDONS.web_template) $state.go('ordering.detailMenu');
			if (!ADDONS.web_template) $state.go('detailRest');
			else $rootScope.initEditDish();
		};

		$scope.onClickRemove = function ( sDish ) {
			var bDishes = gBufferDishes.getData();
			var cDishes = gOrder.getData();
			for (var i = 0; i < bDishes.length; i++) {
				for (var j = 0; j < cDishes.length; j++) {
					if (bDishes[i].dish.tempId == cDishes[j].tempId && bDishes[i].dish.tempId == sDish.tempId) {
						bDishes.splice(i, 1);
						cDishes.splice(j, 1);
					}
				}
			}
			gBufferDishes.setData(bDishes);
			gOrder.setData(cDishes);
			//$rootScope.refreshNumCart();
			$scope.resetCart();
			//initOrderData();
			//$scope.resetOrdetData();
			$scope.citems = gOrder.getData().length;
		};

		$scope.onCloseOption = function () {
			$scope.modal.hide();
		};

		// Cancel Button Action ---------------------

		$scope.onClickCancel = function () {
			if (gOrder.getData().length == 0){
				if (ADDONS.single_business) $state.go(app_states.homeScreen);
				else $state.go('restaurantSearch');
			}else{
				var promptPopup = $ionicPopup.confirm({
					title: $scope.MLanguages.MOBILE_APPNAME,
					template: "<p"+(($scope.arabic_rtl)?' class="arabic_rtl"':' style="text-align:center;"')+">"+$scope.MLanguages.MOBILE_QUESTION_CANCEL_ORDER+"</p>",
					cancelType: 'button-stable',
					cancelText: $scope.MLanguages.MOBILE_CHECKOUT_CANCEL,
					okText: $scope.MLanguages.MOBILE_FOURTH_PAGE_OK.toUpperCase()
				});
				promptPopup.then(function(res) {
					if (res) {
						console.log('Pressed OK!');
						var ary = [];
						gOrder.setData(ary);
						$ionicHistory.clearCache();
						if (ADDONS.single_business) $state.go(app_states.homeScreen);
						else $state.go('restaurantSearch');
					} else {
						console.log('Pressed CANCEL!');
					}
				});
			}
		}
	})

	.controller('signUpCtrl',function($scope, $state, $rootScope, $ionicLoading, $ionicHistory, $http, $ionicModal, $ionicPopup,
									  UserSvc, CheckoutInfoSvc, MyLoading, MyAlert,
									  gAllBusiness, gNearService, gBusinessData, gDeliveryComment, gCurRestaurant, gOrder,
									  gUserData, gStates, PushNotificationSvc,
									  ngFB) {

				$scope.data = {};
				$scope.openPopPass = function() {


					$ionicPopup.show({
						template: '<input type="text" ng-model="data.email">',
						title: 'Please type your Email',
						scope: $scope,
						buttons: [
						{ text: 'Cancel' },
						{
							text: '<b>Submit</b>',
							type: 'button-positive',
							onTap: function(e) {
							if (!$scope.data.email) {
								e.preventDefault();
							} else {
								$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
									$http({
										method: 'POST',
										url: 'https://biteontime.com.au/panel/lib/front-main.php',
										data: $.param({
											f:'RecoverPassword',
											email: $scope.data.email
										}),
										headers: {'Content-Type': 'application/x-www-form-urlencoded'}
									}).success(function (data, status, headers, config) {

									if(data.substr(0, 2)=='ok'){
										$ionicPopup.alert({
											title: 'Alert',
											template: 'Reset password instructions sent on mail.'
										});
										}else{

											$ionicPopup.alert({
											title: 'Alert',
											template: 'Email does not match our database.'
										});
										}

									}).error(function (data, status, headers, config) {
										$ionicPopup.alert({
											title: 'Alert',
											template: 'Server Unreachable.'
										});
									});

									$scope.data = {};
							}
							}
						}
						]
					});

				};										  
		
		$scope.ADDONS = ADDONS;
		$scope.show = function() {
			$ionicLoading.show({
				template: '<p>{{MLanguages.MOBILE_FRONT_LOAD_GETTING_DATA}}</p><ion-spinner icon="ripple" class="spinner-assertive"></ion-spinner>'
			});
		};
		$scope.hide = function(){
			$ionicLoading.hide();
		};

		$scope.$on('$ionicView.beforeEnter',function(){
			initVariable();
		});
		// init variables -------------------------------

		function initVariable () {
			fixHeight('.bg-gray');
			setTimeout(function () {
				window.scrollTo(0, 0);
			}, 150);
			$scope.signUpUser = {
				"name"        : '',
				"lastname"    : '',
				"lastname2"   : '',
				"email"       : '',
				"password"    : '',
				"address"     : '',
				"colony"      : '',
				"zip"         : '',
				"country"     : 1,
				"city"        : 1,
				"tel"         : '',
				"cel"         : '',
				"api"         : '',
				"imgpath"     : '',
				"level"       : 3
			};

			$scope.signInUser = {
				email : '',
				pwd : ''
			};

			if (!$rootScope.buyerInfo) {
				$rootScope.buyerInfo = {
					"id" : "",
					"address" :"",
					"city" :"",
					"cityname" :"",
					"tax" : "",
					"taxtype" : "",
					"deliveryType" :"",
					"deliverydate" :"ASAP",
					"comments" : "",
					"name" :"",
					"lastname2" :"",
					"email" :"",
					"api" :"",
					"colony" :"",
					"tel" :"",
					"checkoutfields" : [
						"Phone",
						"Receive SMS",
						"Tip For The Driver",
						"Discount Coupon",
						"ChackoutMap",
						"Name",
						"Last Name",
						"Email",
						"Full Address",
						"APT\/Suit",
						"Area \/ Neighborhood"
					]
				};
			}

			$scope.allData = gBusinessData.getData();
			//if ($scope.MLanguages == undefined) {
				$scope.getLanguage(function (err, list, dictionary) {
					if (err) MyAlert(err);
					else {
						//$rootScope.MLanguages = dictionary;
						//$scope.MLanguages = dictionary;
					}
				});
			//}
		}

		if (ADDONS.web_template) initVariable();

		// Buyer Info Setting ---------------------------

		//if (typeof $scope.allData.buyer != 'undefined'){
		//    $scope.buyerInfo = $scope.allData.buyer;
		//}else {
		//    $scope.buyerInfo = {};
		//}

		$scope.buyerInfoSetting = function (user) {
			$scope.show($ionicLoading);
			// Getting CheckOut Fields and Setting the Buyer Data
			if (user.id == '-1'){
				// setting user data with temp userdata have structure of signinUser
				gUserData.setData($scope.signInUser);
			}
			$scope.setBuyer();
		};

		$scope.setBuyer = function () {

			CheckoutInfoSvc.getInfo({

			},function (res) {
				if (res.error == "false"){
					$scope.checkFields = [];
					angular.forEach(res.result.checkout, function(obj){
						if (obj.status == true){
							$scope.checkFields.push(obj.field_name);
						}
					});
					$scope.hide();
					console.log($rootScope.buyerInfo, gUserData.getData());
					// Setting User's Informations------------------------
					$rootScope.buyerInfo.id = gUserData.getData().id;
					$rootScope.buyerInfo.address = gUserData.getData().address;          // String
					$rootScope.buyerInfo.city = gUserData.getData().city;                // Number
					$rootScope.buyerInfo.cityname = gUserData.getData().cityname;      // String
					//$rootScope.buyerInfo.tax = "1";                                     // Number
					//$rootScope.buyerInfo.taxtype = "1";                                  // Number
					$rootScope.buyerInfo.deliveryType = gNearService.getData().orderType;           // String
					$rootScope.buyerInfo.deliverydate = "ASAP";                          // String(date)
					$rootScope.buyerInfo.name = gUserData.getData().name;               // String
					$rootScope.buyerInfo.lastname2 = gUserData.getData().lastname2;         // String
					$rootScope.buyerInfo.email = gUserData.getData().email;              // String
					$rootScope.buyerInfo.api = gUserData.getData().api;                 // String
					$rootScope.buyerInfo.colony = gUserData.getData().colony;            // String
					$rootScope.buyerInfo.tel = gUserData.getData().tel;                  // String
					$rootScope.buyerInfo.checkoutfields = $scope.checkFields;
					$rootScope.buyerInfo.comments = gDeliveryComment.getData();

					// Setting Business Data ---------------------------------
					$scope.allData.buyer = $rootScope.buyerInfo;
					gBusinessData.setData($scope.allData);
					if (gStates.getState() == STATE.PROFILE){
						$ionicHistory.nextViewOptions({
							disableBack: false
						});
						$state.go(app_states.profile);
					} else if(gStates.getState() == STATE.MY_ORDER) {
						$ionicHistory.nextViewOptions({
							disableBack: false
						});
						$state.go('sideMenu.myOrder');
					} else if(gStates.getState() == STATE.MY_CARD) {
						$ionicHistory.nextViewOptions({
							disableBack: false
						});
						$state.go('sideMenu.myCard');
					} else if (gStates.getState() == STATE.ORDERING) {
						$state.go(app_states.finalCheckOut);
					} else {
						$ionicHistory.nextViewOptions({
							disableBack: false
						});
						$state.go(app_states.homeScreen);
					}
					$scope.offSigninPopup();

				}else{
					$scope.hide();
					MyAlert.show("\<center\>"+$scope.MLanguages.MOBILE_GETTING_USER_DATA_ERROR+"\<\/center\>");
				}
			});
		};
		//-------------------------------------------------
		$scope.onClickBack = function () {
			if (gStates.getState() == STATE.ORDERING){
				var promptPopup = $ionicPopup.confirm({
					title: $scope.MLanguages.MOBILE_APPNAME,
					template: "<p"+(($scope.arabic_rtl)?' class="arabic_rtl"':' style="text-align:center;"')+">"+$scope.MLanguages.MOBILE_CARD_EMPTY+"</p>",
					cancelType: 'button-stable',
					cancelText: $scope.MLanguages.MOBILE_CHECKOUT_CANCEL,
					okText: $scope.MLanguages.MOBILE_FOURTH_PAGE_OK.toUpperCase()
				}).then(function(res){
					if (res){
						console.log('Pressed OK!');
						var ary = [];
						gOrder.setData(ary);
						//$ionicHistory.clearCache();
						//$ionicHistory.clearHistory();
						$ionicHistory.nextViewOptions({
							disableBack: false
						});
						$state.go(app_states.homeScreen);
					}else {

					}
				});
			}else {
				$ionicHistory.nextViewOptions({
					disableBack : false
				});
				//DEBUG
				$state.go(app_states.homeScreen);
			}
		};
		$scope.onClickCheckOut = function () {
			$state.go(app_states.finalCheckOut);
		};

		// ------ Implement of Sign-in Popup ------------------------------
		$scope.onSigninPopup = function(){
			if ($scope.modal) $scope.modal.remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/sign-in.html', {
				scope: $scope,
				animation: 'slide-in-up'
			}).then(function(modal) {
				$scope.modal = modal;
				$scope.modal.show();
			});
		};
		$scope.offSigninPopup = function(){
			if ($scope.modal) $scope.modal.hide();
		};

		// LOGIN PART -------------------------------------------------------

		$scope.signIn = function () {
			if ($scope.signInUser.email == '' || $scope.signInUser.pwd == '' ) {
				MyAlert.show($scope.MLanguages.MOBILE_FILL_REQUIRED_FIELDS);
				return;
			}

			$scope.show($ionicLoading);

			UserSvc.login.getUser({
				lang : localStorageApp.getItem('LangId'),
				email : $scope.signInUser.email,
				password : $scope.signInUser.pwd
			},function (res) {
				if (res.error == "false"){
					// Check if user is enabled
					if(res.result.user.enabled == false) {
						$scope.hide();
						MyAlert.show("\<center\>"+$scope.MLanguages.MOBILE_NOT_ALLOWED_ADMIN+"\<\/center\>");
						return;
					}
					// Getting User by ID -------------------------------------------
					USER_STATE = 'LOGIN';
					LOGIN_STATE = true;

					getUserInformation(res.result.user);

					localStorageApp.setItem(STORE_VAL.USR_ID, res.result.user.id);
					localStorageApp.setItem(STORE_VAL.LOGIN, true);
					localStorageApp.setItem(STORE_VAL.LOGIN_ACCOUNT, JSON.stringify({
						lang : localStorageApp.getItem('LangId'),
						email : $scope.signInUser.email,
						password : $scope.signInUser.pwd
					}));
					//--------------------------------------------------
				}else {
					$scope.hide();
					MyAlert.show($scope.MLanguages.MOBILE_INVALID_USER_DATA);
				}
			});

		};

		// Get User and Setting Buyer information by ID ----------------

		function getUserInformation ( user ) {

			// Registration of Device Token --------------------
			var device_kind = 0;
			if (ionic.Platform.isIOS()){
				device_kind = 1;
			}else{
				device_kind = 0;
			}
			 // alert("kind" + device_kind + "user" + user.id + "device_id" + GCM_DEVICE_TOKEN);
			if (GCM_DEVICE_TOKEN != ''){
				// alert('Token OK!');
				PushNotificationSvc.register.update({
					usrid : user.id,
					device_token : GCM_DEVICE_TOKEN,
					device_type : device_kind,
					businessid : '',
					device_apptype : APP_ID
				},{
					usrid : user.id,
					device_token : GCM_DEVICE_TOKEN,
					device_type : device_kind,
					businessid : '',
					device_apptype : APP_ID
				},function(res){
					// MyAlert.show("Succeed!");
					// $rootScope.SaveToken = true;
				},function (e) {
					 MyAlert.show(JSON.stringify(e));
				});
			}

			// Setting user information to temporary
			gUserData.setData(user);        // Setting User Data
			if (USER_STATE == 'FB_USER'){
				var buffUser = gUserData.getData();
				buffUser.profilepic = $scope.fbImagePath;
				gUserData.setData(buffUser);
			}
			if (user.address != ''){
				//gMyLatLng.setData(getLocationFromAddress(res.register[0].address));         // Get My Location from full address
			}

			$scope.buyerInfoSetting(user); // BuyerInfoSetting
		}

		// ------ Implement of Register Popup ------------------------------
		$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/register.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modal1 = modal;
		});
		$scope.onRegPopup = function(){
			$scope.modal1.show();
		};
		$scope.offRegPopup = function(){
			$scope.modal1.hide();
		};
		//-------------------------------------------------------------------
		$scope.onClickSignUp = function () {
			if ($scope.signUpUser.name == '' || $scope.signUpUser.email == '' || $scope.signUpUser.password == '') {
				MyAlert.show('\<center\>'+$scope.MLanguages.MOBILE_FILL_REQUIRED_FIELDS+'\<\/center\>');
				return;
			}

			USER_STATE = 'SIGNUP';      // Setting User State
			$scope.signUpUser.level = 3;        // Setting User Level
			$scope.onRegister();
		};

		$scope.onRegister = function () {
			MyLoading.show($scope.MLanguages.MOBILE_REGISTRING);

			UserSvc.signUp.charge({
				lang    : localStorageApp.getItem('LangId'),
				name    : $scope.signUpUser.name,
				email   : $scope.signUpUser.email,
				password: $scope.signUpUser.password,
				lastName : '',
				country : '1',
				city : '1',
				street : '',
				postCode : '',
				landPhone :'',
				mobilePhone : '',
				apt : '',
				level : $scope.signUpUser.level
			},{},function (res) {
				MyLoading.hide();
				if (res.message == "success"){
					LOGIN_STATE = true;
					console.log(res);
					var usr = res.result.user;
					//localStorageApp.setItem(STORE_VAL.USR_ID, usr.id);
					gUserData.setData(usr);
					getUserInformation(usr);


					//getUserInformation(res.result.user);
					localStorageApp.setItem(STORE_VAL.USR_ID, res.result.user.id);
					localStorageApp.setItem(STORE_VAL.LOGIN, true);
					localStorageApp.setItem(STORE_VAL.LOGIN_ACCOUNT, JSON.stringify({
						lang : localStorageApp.getItem('LangId'),
						email : $scope.signUpUser.email,
						password : $scope.signUpUser.password
					}));

				}else {
					MyAlert.show(res.message);
				}
			},function (e) {
				MyLoading.hide();
				MyAlert.show(e.statusText);
			});
		};

		$scope.onClickGuest = function() {
			if (gStates.getState() == STATE.PROFILE){
				$ionicHistory.nextViewOptions({
					disableBack: false
				});
				$state.go(app_states.homeScreen);
			}else if(gStates.getState() == STATE.MY_ORDER) {
				$ionicHistory.nextViewOptions({
					disableBack: false
				});
				$state.go(app_states.homeScreen);
			}
			else if(gStates.getState() == STATE.MY_CARD) {
				$ionicHistory.nextViewOptions({
					disableBack: false
				});
				$state.go(app_states.homeScreen);
			}
			
			else if (gStates.getState() == STATE.ORDERING) {
				//$scope.buyerInfoSetting('-1'); // BuyerInfoSetting
				USER_STATE = 'GUEST';
				$scope.signUpUser.id = '-1';
				gUserData.setData($scope.signUpUser);
				$scope.setBuyer();

				//$state.go("finalCheckOut");
			}
		};

		// FB Login Part --------------------------------------------------

		$scope.fbLogin = function () {
			ngFB.login({scope: 'email,public_profile,publish_actions,user_location'}).then(function (response) {
				if (response.status === 'connected') {
					LOGIN_STATE = true;
					USER_STATE = 'FB_USER';
					console.log('Facebook login succeeded');
					$scope.getFBProfile();

				} else {
					alert($scope.MLanguages.MOBILE_FACEBOOK_LOGIN_ERROR);
				}
			});
		};

		$scope.getFBProfile = function () {
			$scope.show($ionicLoading);
			ngFB.api({
				path : '/me',
				params : {fields: 'id,name,email,location'}
			}).then(
				function (user) {
					$scope.user = user;
					$scope.setUserToBuyer(user);
				},
				function (error) {
					alert($scope.MLanguages.MOBILE_FACEBOOK_ERROR+' : ' + error.message);
					$scope.hide();
				}
			)
		};

		$scope.setUserToBuyer = function (user) {

			var nameAry = (user.name).split(" ");
			$scope.signUpUser.name = nameAry[0];
			$scope.signUpUser.lastname = nameAry[1];
			$scope.signUpUser.email = user.email;
			$scope.signUpUser.password = 'fbuser';
			$scope.fbImagePath = 'http://graph.facebook.com/'+ user.id +'/picture?width=270&height=270';

			UserSvc.login.getUser({
				lang : localStorageApp.getItem('LangId'),
				email : user.email,
				password : 'fbuser'
			},function (res) {
				if (res.error == "false"){

					getUserInformation(res.result.user);
					localStorageApp.setItem(STORE_VAL.IS_FBUSER, "true");
					localStorageApp.setItem(STORE_VAL.USR_ID, res.result.user.id);
					localStorageApp.setItem(STORE_VAL.LOGIN, true);
					localStorageApp.setItem(STORE_VAL.LOGIN_ACCOUNT, JSON.stringify({
						lang : localStorageApp.getItem('LangId'),
						email : user.email,
						password : 'fbuser'
					}));
					//--------------------------------------------------
				}else {
					$scope.onRegister();
				}
			});

		};

		//-------------------------------------------------------------------
	})

	.controller('registerCtrl',function($scope, $state, $ionicModal, gAllBusiness, gCurRestaurant, gOrder) {

	})

	.controller('finalCheckOutCtrl', function($scope, $rootScope, $state, $ionicScrollDelegate, $ionicLoading, $ionicModal,
											  $ionicPopup, $ionicHistory, gNearService, gAllBusiness, gCurRestaurant,gBufferDishes,
											  gOrder, gUserData, gBusinessData, UserSvc,
											  gMyLatLng, PaypalService,PaymentStripe,stripCardSvc, OrderSvc, DiscountCouponSvc, 
											  MyAlert, MyLoading, API_ENDPOINT, JqueryPostDataSvc,cardRecordSrv,PAYMENT_GATWAY_KEY,
											  ConfirmSvc, ADDONS, CheckoutInfoSvc, BusinessSvc, gStates, paypalCardSvc, $interval) {

		$scope.ADDONS = ADDONS;
		$scope.WEB_ADDONS = WEB_ADDONS;
		$scope.DRIVER_TIP = DRIVER_TIP;
		$scope.infoFields = {};


		$scope.show = function() {
			$ionicLoading.show({
				template: '<p>'+$scope.MLanguages.MOBILE_ORDERING+'</p><ion-spinner icon="lines" class="spinner-assertive"></ion-spinner>'
			});
		};

		$scope.hide = function(){
			$ionicLoading.hide();			
		}; 
		
		$scope.userState = USER_STATE;
		$scope.user_login = gUserData.getData().id != undefined && gUserData.getData().id != -1;
		console.log($scope.user_login);

		// Part of Display for map ---------------------------------------------------

		$scope.$on('$ionicView.beforeEnter', function(){
			/*$ionicScrollDelegate.scrollTop();
			$scope.loadMap();
			if(!$scope.initVariablesStart) {
				$scope.initVariables();
			}*/
			initView();
		});

		$scope.$on('$ionicView.beforeLeave', function() {
			$scope.offConfirm(true);
		});

		$scope.callbackAddress = function (check) {
			console.log(check);
			$scope.order_buyer.address = gNearService.getData().nearAddress;
		}

		$scope.showCheckAddress = function () {
			if (WEB_ADDONS.check_address_checkout) $scope.showSelectAddress($scope.callbackAddress);
		}

		function initView() {
			if (!gBusinessData.getData().business || gOrder.getData().length == 0) {
				return window.location = ((WEB_ADDONS.remove_hash)?'':'#')+'/';
			}
			$scope.loadGoogleMaps(function () {
				$scope.getLanguage(function (err, list, dictionary) {
					setTimeout(function () {
						window.scrollTo(0, 0);
					}, 150);
					//$scope.MLanguages = dictionary;
					//$rootScope.MLanguages = dictionary;
					$ionicScrollDelegate.scrollTop();
					//$scope.loadMap();
					//if(!$scope.initVariablesStart) {
					//}

					console.log(gUserData.getData());
					CheckoutInfoSvc.getInfo({
					}, function(res) {
						if (res.error == 'false') {
							$scope.initVariables();
							$rootScope.buyerInfo = {
								"id" : "",
								"address" :"",
								"city" :"",
								"cityname" :"",
								"tax" :$scope.curBusinessInfo.tax,
								"taxtype" :$scope.curBusinessInfo.taxType,
								"deliveryType" :"",
								"deliverydate" :"ASAP",
								"comments" : "",
								"name" :"",
								"lastname2" :"",
								"email" :"",
								"api" :"",
								"colony" :"",
								"tel" :"",
								"checkoutfields" : [
									"Phone",
									"Receive SMS",
									"Tip For The Driver",
									"Discount Coupon",
									"ChackoutMap",
									"Name",
									"Last Name",
									"Email",
									"Full Address",
									"APT\/Suit",
									"Area \/ Neighborhood"
								]
							};
							$scope.infoFields = res.result.checkout;
							$scope.checkFields = [];
							angular.forEach(res.result.checkout, function (obj) {
								if (obj.status == true) {
									$scope.checkFields.push(obj.field_name);
								}
							});
							$scope.buyerInfo.id = gUserData.getData().id;          // String
							$scope.buyerInfo.address = gNearService.getData().address;          // String
							$scope.buyerInfo.city = gUserData.getData().city;                // Number
							$scope.buyerInfo.cityname = gUserData.getData().cityname;      // String
							//$scope.buyerInfo.tax = ''+$scope.taxPrice;                 // Number
							//$scope.buyerInfo.taxtype = $scope.curBusinessInfo.taxtype;             // Number
							$scope.buyerInfo.deliveryType = gNearService.getData().orderType;   // String
							$scope.buyerInfo.deliverydate = "ASAP";     // String(date)
							$scope.buyerInfo.name = gUserData.getData().name;               // String
							$scope.buyerInfo.lastname2 = gUserData.getData().lastname2;         // String
							$scope.buyerInfo.email = gUserData.getData().email;   // String
							$scope.buyerInfo.api = gUserData.getData().api;                 // String
							$scope.buyerInfo.colony = gUserData.getData().colony;            // String
							$scope.buyerInfo.tel = gUserData.getData().tel;           // String
							$scope.buyerInfo.checkoutfields = $scope.checkFields;
							//$scope.buyerInfo.comments = $scope.delivery.comments;

							$scope.curBusiness.buyer = $scope.buyerInfo;
							gBusinessData.setData($scope.curBusiness);
							//$scope.hide();
						}
					});

					$scope.payment=[];
					var eachpay = "";
					for(var i in gCurRestaurant.getData().payData ) {
						//alert(i+''+gCurRestaurant.getData().payData[i]);
						/*if(i == "cash" && (gCurRestaurant.getData().payData[i] == 't')  ) {
							eachpay = { val : i, name : $scope.MLanguages.CASH_DELIVERY.toLowerCase(), img : 'img/cash-icon.png'};
							$scope.payment.push(eachpay);
						} else if(i == "card" && (gCurRestaurant.getData().payData[i] == 't')  ) {
							eachpay = { val : i, name : $scope.MLanguages.CARD_DELIVERY.toLowerCase(), img : 'img/debit-icon.png'};
							$scope.payment.push(eachpay);
						} else if(i == "ionicstripe" && (gCurRestaurant.getData().payData[i] == 't')  ) {
							eachpay = { val : 'stripe', name : $scope.MLanguages.PAYMENT_STRIPE_PAY.toLowerCase()+" "+$scope.MLanguages.BUSINESS_LIST_PAYMENT.toLowerCase(), img : 'img/stripe-icon.png'};
							$scope.payment.push(eachpay);
						}*/

						for(var i in gCurRestaurant.getData().payData ) {
							if(i == "cash" && (gCurRestaurant.getData().payData[i] == 't')  ) {
								eachpay = { val : i, name : $scope.MLanguages.CASH_DELIVERY.toLowerCase(), img : 'img/cash-icon.png'};
								$scope.payment.push(eachpay);
							} else if (i == "card" && (gCurRestaurant.getData().payData[i] == 't')  ) {
								eachpay = { val : i, name : $scope.MLanguages.CARD_DELIVERY.toLowerCase(), img : 'img/debit-icon.png'};
								$scope.payment.push(eachpay);
							} else if (i == "ionicstripe" && (gCurRestaurant.getData().payData[i] == 't')  ) {
								eachpay = { val : 'stripe', name : $scope.MLanguages.PAYMENT_STRIPE_PAY.toLowerCase()+" "+$scope.MLanguages.BUSINESS_LIST_PAYMENT.toLowerCase(), img : 'img/stripe-icon.png'};
								$scope.payment.push(eachpay);
							} else if (i == "paypal" && (gCurRestaurant.getData().payData[i] == 't')  ) {
								eachpay = { val : 'paypal', name : $scope.MLanguages.PAYMENT_PAYPAL.toLowerCase()+" "+$scope.MLanguages.BUSINESS_LIST_PAYMENT.toLowerCase(), img : 'img/paypal-icon.png'};
								$scope.payment.push(eachpay);
							} else if (i == "paypaladaptive" && (gCurRestaurant.getData().payData[i] == 't')  ) {
								eachpay = { val : 'paypaladaptive', name : $scope.MLanguages.PAYMENT_PAYPAL_ADAPTIVE.toLowerCase()+" "+$scope.MLanguages.BUSINESS_LIST_PAYMENT.toLowerCase(), img : 'img/paypal-icon.png'};
								$scope.payment.push(eachpay);
							}
						}
					}
				});
			});
		}


		$rootScope.$watch('MLanguages', function(newValue, oldValue) {
			if ($scope.MLanguages.CASH_DELIVERY) {
				$scope.payment=[];
				var eachpay = "";
				/*for(var i in gCurRestaurant.getData().payData ) {
					//alert(i+''+gCurRestaurant.getData().payData[i]);
					if(i == "cash" && (gCurRestaurant.getData().payData[i] == 't')  ) {
						eachpay = { val : i, name : $scope.MLanguages.CASH_DELIVERY.toLowerCase(), img : 'img/cash-icon.png'};
						$scope.payment.push(eachpay);
					} else if(i == "card" && (gCurRestaurant.getData().payData[i] == 't')  ) {
						eachpay = { val : i, name : $scope.MLanguages.CARD_DELIVERY.toLowerCase(), img : 'img/debit-icon.png'};
						$scope.payment.push(eachpay);
					} else if(i == "ionicstripe" && (gCurRestaurant.getData().payData[i] == 't')  ) {
						eachpay = { val : 'stripe', name : $scope.MLanguages.PAYMENT_STRIPE_PAY.toLowerCase()+" "+$scope.MLanguages.BUSINESS_LIST_PAYMENT.toLowerCase(), img : 'img/stripe-icon.png'};
						$scope.payment.push(eachpay);
					}
				}*/
				for(var i in gCurRestaurant.getData().payData ) {
					if(i == "cash" && (gCurRestaurant.getData().payData[i] == 't')  ) {
						eachpay = { val : i, name : $scope.MLanguages.CASH_DELIVERY.toLowerCase(), img : 'img/cash-icon.png'};
						$scope.payment.push(eachpay);
					} else if (i == "card" && (gCurRestaurant.getData().payData[i] == 't')  ) {
						eachpay = { val : i, name : $scope.MLanguages.CARD_DELIVERY.toLowerCase(), img : 'img/debit-icon.png'};
						$scope.payment.push(eachpay);
					} else if (i == "ionicstripe" && (gCurRestaurant.getData().payData[i] == 't')  ) {
						eachpay = { val : 'stripe', name : $scope.MLanguages.PAYMENT_STRIPE_PAY.toLowerCase()+" "+$scope.MLanguages.BUSINESS_LIST_PAYMENT.toLowerCase(), img : 'img/stripe-icon.png'};
						$scope.payment.push(eachpay);
					} else if (i == "paypal" && (gCurRestaurant.getData().payData[i] == 't')  ) {
						eachpay = { val : 'paypal', name : $scope.MLanguages.PAYMENT_PAYPAL.toLowerCase()+" "+$scope.MLanguages.BUSINESS_LIST_PAYMENT.toLowerCase(), img : 'img/paypal-icon.png'};
						$scope.payment.push(eachpay);
					} else if (i == "paypaladaptive" && (gCurRestaurant.getData().payData[i] == 't')  ) {
						eachpay = { val : 'paypaladaptive', name : $scope.MLanguages.PAYMENT_PAYPAL_ADAPTIVE.toLowerCase()+" "+$scope.MLanguages.BUSINESS_LIST_PAYMENT.toLowerCase(), img : 'img/paypal-icon.png'};
						$scope.payment.push(eachpay);
					}
				}
				if ($scope.paymentModel && $scope.paymentModel.val == 'none') {
					$scope.paymentModel = {
						val : 'none',
						model : $scope.MLanguages.PLEASE_SELECT
					};
					$scope.stripepaymentModel = {
						val : 'none',
						model : $scope.MLanguages.PLEASE_SELECT
					};
				}
			}
		});

		$scope.gMap2 = new GoogleMap();
		$scope.loadMap = function(){
			var latLng = gMyLatLng.getData();
			$scope.gMap2.initialize('map2', latLng.lat, latLng.lng, 15);
		};

		//---------------------------------------------------------------------
		//"_@_Please choose size@u@large    ₨3.00_@_Make it combo@u@No    ₨0.00"
		//"_@_test@u@test 1    ₨1.00_@_test@u@test3    ₨3.00_@_test@u@test 2    ₨2.00"
		$scope.parseOptions = function (options) {
			options = options.split('_@_');
			options.splice(0,1);
			//console.log(options);
			var p_options = {};
			for (var i = 0; i < options.length; i++) {
				var option = options[i].split('@u@');
				var select = option[1].split('    ');
				if (p_options[option[0]] == undefined) p_options[option[0]] = [];
				p_options[option[0]].push({name: select[0], price: select[1]});
			}
			return p_options;
		}

		$scope.parseSuboptions = function (options) {
			var html = "";
			for (var i = 0; i < options.length; i++) {
				html += options[i].name+((options[i].price != undefined)?' '+options[i].price:'')+"<br>";
			}
			return html;
		}
		$scope.initVariables = function () {
			fixHeight('.form.full');
			$scope.initVariablesStart = true;
			$scope.data = {
				driveTips: '0.00'
			};

			$scope.finalCheckout = {
				specialcomment : ''
			};

			$scope.paymentModel = {
				val : 'none',
				model : "Please Select" //$scope.MLanguages.PLEASE_SELECT
			};
			$scope.stripepaymentModel = {
				val : 'none',
				model : $scope.MLanguages.PLEASE_SELECT
			};
			//------------------------------------------------------------------------------------------
			if($state.params.addCardstripe == true || $state.params.addCardstripe == "true") {
				$scope.refreshCard();
			}
			//------------------------------------------------------------------------------------------
			
			$scope.curMyDishes = gOrder.getData();
			$scope.order_qty = 0;
			var subtotal = 0;
			for (var i = 0; i < $scope.curMyDishes.length; i++) {
				$scope.order_qty += $scope.curMyDishes[i].quantity;
				subtotal += $scope.curMyDishes[i].total;
			}
			subtotal = subtotal;
			$scope.order_buyer = gUserData.getData();
			$scope.order_buyer.coupon = '';
			$scope.order_buyer.couponstatus = false;
			$scope.c_unit = gCurRestaurant.getData().c_unit;
			console.log($scope.order_buyer);
			//console.log();
			// Getting Current Business Data from Cache ------------------
			$scope.curBusiness = gBusinessData.getData();
			if (ADDONS.web_template && $scope.curBusiness.business.length == 0) window.location = ((WEB_ADDONS.remove_hash)?'':'#')+'/'+$scope.curBusiness.customslug;
			$scope.curBusiness.business[0].currency = gCurRestaurant.getData().c_unit;
			$scope.getdeliveryType = gNearService.getData().orderType;
			$scope.curBusiness.total = subtotal/*$scope.curBusiness.total - $scope.curBusiness.servicefeeTotal1*/;
			$scope.subTotalPrice = $scope.curBusiness.total; //Restar fee
			$scope.totalPrice = $scope.curBusiness.total;
			$scope.curBusinessInfo = gCurRestaurant.getData().restData;
			$scope.deliveryFee = gCurRestaurant.getData().deliveryFee*((gNearService.getData().orderType == "pickup")?0:1);

			//$scope.curStreet = $scope.curBusinessInfo.street + ', ' + gNearService.getData().nearAddress;
			$scope.curStreet = gNearService.getData().nearAddress;
			//$scope.order_buyer.address = $scope.curStreet;
			$scope.taxPrice = parseFloat($scope.curBusiness.tax);

			$scope.driverTipsList = [
                { text: "0%", value:($scope.totalPrice * (0/100)).toFixed(2)},
                { text: "5%", value:($scope.totalPrice * (5/100)).toFixed(2)},
                { text: "10%", value:($scope.totalPrice * (10/100)).toFixed(2)},
                { text: DRIVER_TIPS.tip_4+"%", value:($scope.totalPrice * (DRIVER_TIPS.tip_4/100)).toFixed(2)},
                { text: DRIVER_TIPS.tip_5+"%", value:($scope.totalPrice * (DRIVER_TIPS.tip_5/100)).toFixed(2)}
            ];

			$scope.bState = {
				review : false,
				offer : false
			};

			BusinessSvc.getOffers.charge({
				Id : gCurRestaurant.getData().id,
				lang : localStorageApp.getItem(STORE_VAL.LANG)
			},function (s) {
				if (s.error == 'true'){
					//MyAlert.show('Warning : No Business Offers');
					$scope.bState.offer = false;
					$scope.offersList = [];
				}else {
					$scope.bState.offer = true;
					$scope.offersList = s.result;
					$rootScope.offersList = s.result;
				}
				$scope.changedRadioValue();

				/// Fetching Order Data ----------------------------------------------

				$scope.curBusiness.Total = (parseFloat($scope.orderTotal)).toFixed(2);
				$scope.curBusiness.grandtotal = $scope.curBusiness.Total;
			},function (e) {
				MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
			});

			if (LOGIN_STATE) {
				if (USER_STATE == 'FB_USER'){
				  /*  $ionicPopup.alert({
						title : $scope.MLanguages.MOBILE_APPNAME,
						subTitle : 'Welcome to login!',
						template : "User : " + $scope.order_buyer.email
					})*/;
				}else {
					/*$ionicPopup.alert({
						title : $scope.MLanguages.MOBILE_APPNAME,
						subTitle : 'Welcome to login!',
						template : "User : " + $scope.order_buyer.email + "\r\nPassword : " + $scope.order_buyer.password
					})*/;
				}
			}
			/// -------------------- ----------------------------------------------
		}

		$scope.refreshCard = function () {
				$scope.paymentModel.val = "stripe";
				$scope.paymentModel.model = "stripe payment";
				
				MyLoading.show($scope.MLanguages.MOBILE_FRONT_LOAD_LOADING);
				$scope.stripe_customerid="";
				var cUser = gUserData.getData();
				stripCardSvc.getCardByUser.getCard({
					userId : cUser.id,
					key : PAYMENT_GATWAY_KEY.StripeApiSetKey
				},function (s) {
					MyLoading.hide();
					if (s.status == "false" || s.status == false) {
						$scope.modal2.hide();
						if (!ADDONS.web_template) $state.go('sideMenu.myCard');
					} else {
						$scope.stipe_customer_history =s.register;
						$scope.stripe_customerid =  s.register[0].customerid;
						$scope.modalstripe.show();  
					}
				}, function (e) {
					MyLoading.hide();
					MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
				});
			}

		$scope.changedRadioValue = function()
		{
			if ($scope.curBusiness.buyer.taxtype == '2'){
				$scope.orderTotal = parseFloat($scope.totalPrice) + $scope.curBusiness.servicefeeTotal1 + parseFloat($scope.deliveryFee) + parseFloat($scope.data.driveTips); // Total Price for Ordering
			}else {
				$scope.orderTotal = parseFloat($scope.totalPrice) + $scope.curBusiness.servicefeeTotal1 + parseFloat($scope.deliveryFee) + parseFloat($scope.data.driveTips) + $scope.taxPrice; // Total Price for Ordering
			}
			//Discount Offer          
			$scope.curBusiness.discountoffer = false; 
			if($rootScope.offersList && $rootScope.offersList.offers.length > 0){
				var disprice=0;
				for(var ofr in $rootScope.offersList.offers){
					if($scope.curBusiness.discountoffer == false){
						if($rootScope.offersList.offers[ofr].type == 1){
							disprice = $scope.subTotalPrice*parseFloat($rootScope.offersList.offers[ofr].rate)/100;
							console.log(disprice);
							$scope.curBusiness.discountprice = disprice;
						}else if($rootScope.offersList.offers[ofr].type == 2){
							disprice = parseFloat($rootScope.offersList.offers[ofr].rate);
						}
						if(parseFloat($scope.orderTotal) >= parseFloat($rootScope.offersList.offers[ofr].minprice)){
							if(parseFloat($scope.orderTotal)>= parseFloat(disprice)){
								$scope.orderTotal = parseFloat(parseFloat($scope.orderTotal) - (parseFloat(disprice)*(ADDONS.discount_offer ? 1:0)));
								$scope.curBusiness.discounttype = $rootScope.offersList.offers[ofr].type;
								$scope.curBusiness.discountrate = $rootScope.offersList.offers[ofr].rate; 
								$scope.curBusiness.discountactive = true;
								$scope.curBusiness.discountprice = $scope.FormatPriceNotFree(disprice);
								$scope.curBusiness.discountcategory = "discountoffer";
								$scope.curBusiness.discountoffer = true;                            
							}else{
								$scope.curBusiness.discountprice="";
							}   
						}else{
							$scope.curBusiness.discountprice="";
						}
					}
					
				}
			}
			//Discount Offer

			//Discount Code
			console.log($scope.curBusiness);
			if($scope.curBusiness.discountoffer == false){
				var disprice="";
				if($scope.curBusiness.discounttype == 1){
					disprice = parseFloat((parseFloat($scope.orderTotal)*parseFloat($scope.curBusiness.discountrate))/100);
					$scope.curBusiness.discountprice = disprice;
				}else if($scope.curBusiness.discounttype == 2){
					disprice = parseFloat($scope.curBusiness.discountrate);
				}

				if(parseFloat($scope.orderTotal) >= parseFloat($scope.curBusiness.discountminshop)){
					if(parseFloat($scope.orderTotal)>= parseFloat(disprice)){
						$scope.orderTotal = parseFloat(parseFloat($scope.orderTotal) - parseFloat(disprice));
						$scope.order_buyer.coupon = $scope.curBusiness.discountcode;
						$scope.curBusiness.discountactive = true;
						$scope.curBusiness.discountprice = $scope.FormatPriceNotFree(disprice);                        
					}else{
						$scope.curBusiness.discountprice="";
					}   
				}else{
					$scope.curBusiness.discountprice="";
				}
			}            
			//Discount Code
			//$scope.orderTotal = parseFloat($scope.orderTotal) + parseFloat($scope.data.driveTips);
		};
		$scope.FormatPriceNotFree= function (b){
			return parseFloat(b).toFixed(2);
		};

		$scope.onClickDetail = function ()
		{
			$state.go('ordering.checkOut');
		};

		// Order Confirm Part ------------------------
		$scope.onConfirm = function(){
			if (!ADDONS.web_template) {
				/*$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/order-confirm-popup.html', {
					scope: $scope,
					animation: 'slide-in-up'
				}).then(function(modal) {
					$scope.modal1 = modal;
					$scope.modal1.show().then(function () {
						$scope.hide();
					});
					$scope.curOrderType = gNearService.getData().orderType;
				});*/
				$scope.data={};
					var myPopup = $ionicPopup.show({
					templateUrl:'templates/'+ADDONS.template+'/order-confirm-popup.html',     
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
				
			} else {
				$rootScope.confirmData = {
					curBusinessData: $scope.curBusinessData,
					placedOrderId: $scope.placedOrderId,
					order_buyer: $scope.order_buyer,
					curMyDishes: $scope.curMyDishes,
					finalCheckout: $scope.finalCheckout,
					subTotalPrice: $scope.subTotalPrice,
					curBusiness: $scope.curBusiness,
					deliveryFee: $scope.deliveryFee,
					data: $scope.data,
					orderTotal: $scope.orderTotal,
					paymentModel: $scope.paymentModel,
					curOrderType: gNearService.getData().orderType
				};
				$state.go('main.confirm');
			}
			//$scope.offCheckOut();
		};
		
		/*$scope.offConfirm = function(sw){
			$scope.modal1.hide();
			$scope.modal1.remove();
			if (!ADDONS.web_template && !sw) $scope.onGoToHome();
		};*/
		$scope.onGoToHome = function(){
			$ionicHistory.clearHistory();
			$ionicHistory.clearCache().then(function(){ $state.go(app_states.homeScreen)});
			if (!ADDONS.web_template) $state.go(app_states.homeScreen);
		};

		$scope.fieldDetect = function( str ) {
			MyAlert.show(str);
			$ionicScrollDelegate.scrollTop();
		};
		//<!----------------------------------Stripe Payment section ----------------->
		$scope.stripeconfirmpayment = function() {
			PaymentStripe.payprocessProcess.finalpay({
				orderDescription : "ORDER-"+$scope.placedOrderId,
				orderid : $scope.placedOrderId,
				amount : $scope.orderTotal,
				key : PAYMENT_GATWAY_KEY.StripeApiSetKey,
				customer_id :  $scope.stripe_customerid
			},function (s) {
				console.log(s)
				//$scope.hide();
				if(s.status == false || s.status == "false" ) {
					MyAlert.show('\<center\>'+$scope.MLanguages.MOBILE_NOT_PAID_CORRECTLY+'\<\/center\>');	
					console.log($scope.MLanguages.MOBILE_NOT_PAID_CORRECTLY);
					MyLoading.hide();
					$scope.modal2.show();
				} else {
					if(s.register.failure_message != "-1" ){
						MyAlert.show('\<center\>'+$scope.MLanguages.MOBILE_NOT_PAID_CORRECTLY+'\<\/center\>');
						console.log($scope.MLanguages.MOBILE_NOT_PAID_CORRECTLY);	
					}
					ConfirmSvc.getInfo({
						orderId    : $scope.placedOrderId,
						ordercomment : '',
						lang : localStorageApp.getItem('LangId')
					},function (s) {
						//$scope.hide();
						console.log(s)
						initOrderData();
						$scope.onConfirm();
					},function (e) {});
					//$scope.onConfirm();
				}
			},function (e) {
				MyLoading.hide();
				MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
			});
		};
		//<!----------------------------------Payment section ----------------->

		$scope.onSocialShare = function (num) {
			if (num == 1) {         // Facebook
				window.plugins.socialsharing.shareViaFacebook($scope.MLanguages.MOBILE_FACEBOOK_SHARED_MESSAGE,null,null,function() {
				}, function(error){alert(error)});
			}else if (num == 2) {   // Twitter
				window.plugins.socialsharing.shareViaTwitter($scope.MLanguages.MOBILE_FACEBOOK_SHARED_MESSAGE,null,null,function() {
				}, function(error){alert(error)});
			}else {                 // Common Share
				window.plugins.socialsharing.share($scope.MLanguages.MOBILE_FACEBOOK_SHARED_MESSAGE, null, null, '', function() {
				}, function(error){alert(error)});
			}
		};

		function sCallBack() {
			alert($scope.MLanguages.MOBILE_FACEBOOK_SHARED_SUCCESS);
		}
		function eCallBack(e) {
			alert(JSON.stringify(e));
		}

		//---Payment select Part ---------------------- , card on delivery, and paypal
	   //  alert(JSON.stringify(gCurRestaurant.getData().payData))

		//this.arrayText.push(obj);
	 
		 
		   //eachpay = { val : i, name : i+' payment', img : ''};
	   /* $scope.payment = [
			{ val : 'cash', name : 'Cash on delivery', img : 'img/cash-icon.png'},
			{ val : 'card', name : 'Card on delivery', img : 'img/debit-icon.png'},
			{ val : 'stripe', name : 'Stripe payment', img : 'img/stripe-icon.png'},
		//    { val : 'paypal', name : 'Paypal', img : 'img/paypal-icon.png'}
		];*/

		/// Paypal ------------------------
		
		$scope.stripeonClickMethod = function ( item ) {
			console.log(item);
			$scope.stripepaymentModel.val = item.id;
			$scope.stripepaymentModelRec = item;	
		};
		$scope.onClickMethod = function ( item ) {
			console.log(item);
			$rootScope.fromMyCards = false;
			$scope.curBusiness.business[0].paymethod.paypaladaptive = false;
			$scope.curBusiness.business[0].paymethod.stripe = false;
			$scope.curBusiness.business[0].paymethod.paypal = false;
			/*if (item.val == 'paypal'){
				//$scope.onClickPaypal();
				if (typeof PayPalMobile.init == 'undefined') return;
				$ionicLoading.show();
				PaypalService.initPaymentUI().then(function () {
					$ionicLoading.hide();
					PaypalService.makePayment($scope.orderTotal, $scope.MLanguages.MOBILE_TOTAL_AMOUNT).then(function (response) {
						MyAlert.show($scope.MLanguages.MOBILE_SUCCESS+' : '+JSON.stringify(response));
						//alert('Success'+JSON.stringify(response));
						$scope.paymentModel.val = $scope.MLanguages.PAYMENT_GATEWAY_ALL_PAID_WITH_PAYPAL;
						$scope.curBusiness.business[0].paymethod.paypal = true;
						//  $scope.curBusiness.business[0].paymethoddetail.paypaladaptive = true;
						$scope.modal2.hide();
					}, function (error) {
						$scope.paymentModel = {
							val : 'none',
							model : $scope.MLanguages.PLEASE_SELECT
						};
						MyAlert.show($scope.MLanguages.MOBILE_TRANSACTION_CANCELED);
						//alert('Transaction Canceled');
					});
				});
			}*/
			if (item.val == 'paypal'){
				$scope.paymentModel.val = item.val;            
				$scope.curBusiness.paypalid = "APP";
				$scope.curBusiness.business[0].paymethod.paypal = true;
			} else if(item.val == 'paypaladaptive'){                
				$scope.paymentModel.val = item.val;
				$scope.curBusiness.business[0].paymethod.paypaladaptive = true;              
            } else if (item.val == 'stripe') {
				$scope.paymentModel.val = item.val;
				if (USER_STATE == 'GUEST') {
					MyAlert.show($scope.MLanguages.MOBILE_REQUIRED_LOGIN_TO_PAID);
					promptPopup.then(function() {
						$scope.modal2.hide();
						$state.go('signUp');
					});
					//$state.go('ordering.checkOut');
				} else {
					MyLoading.show($scope.MLanguages.MOBILE_FRONT_LOAD_LOADING);
					$scope.stripe_customerid="";
					var cUser = gUserData.getData();

					BusinessSvc.getPaymentmethod.charge({
						businessId    : '0',
						lang    :localStorageApp.getItem(STORE_VAL.LANG)
					},function (s) {
						stripepermission = JSON.parse(s.register);
						$scope.stripepermissions =stripepermission.paydtl.ionicstripe.status;
						PAYMENT_GATWAY_KEY.Stripepermissiom = stripepermission.paydtl.ionicstripe.status;
						PAYMENT_GATWAY_KEY.StripeApiSetKey= stripepermission.paydtl.ionicstripe.stripeapikey;
						PAYMENT_GATWAY_KEY.StripeKey= stripepermission.paydtl.ionicstripe.publishablekey;
						stripCardSvc.getCardByUser.getCard({
							userId : cUser.id,
							key : PAYMENT_GATWAY_KEY.StripeApiSetKey
						},function (s) {
							MyLoading.hide();
							/*if (s.status == "false" || s.status == false) {
								$scope.modal2.hide();
								if (!ADDONS.web_template) {
									$state.go('sideMenu.myCard');
								} else {
									$scope.showAddNewCard();
								}
							} else {*/
								if(s.register.length == 0) {
									$scope.modal2.hide();
									$state.go('sideMenu.cardDetail');
								} else {
									$scope.stipe_customer_history = s.register;
									$scope.stripe_customerid = s.register[0].customerid;
									$scope.modalstripe.show();	
								}
							//}
						},function (e) {
							MyLoading.hide();
							MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
						});
					},function (e) {
						// alert(e)
						MyLoading.hide();
						console.log(e.message);
					});
				}
			}else{
				$scope.paymentModel.val = item.val;
			}
		};

		$scope.discountcodeCheck = function() {
			console.log($scope.order_buyer.coupon);
			if($scope.order_buyer.couponstatus == true){
				return;
			}
			DiscountCouponSvc.getrecord.info({
				businessid :  $scope.curBusiness.business[0].id,
				code   : $scope.order_buyer.coupon,
				total    : $scope.curBusiness.grandtotal
			},function (response) {
				console.log(response);
				$scope.curBusiness.discountcategory = "discountcode";
				$scope.curBusiness.discountcode = response.discountcode;
				$scope.curBusiness.discounttype = response.discounttype;
				$scope.curBusiness.discountrate = response.discountrate;
				$scope.curBusiness.discountminshop = response.discountminshop;
				$scope.curBusiness.minshop = 0;

				if(response.status == true){
					$scope.order_buyer.couponstatus = true;
					var disprice="0.00";
					if($scope.curBusiness.discounttype){
						
						if($scope.curBusiness.discounttype == 1){
							disprice = parseFloat((parseFloat($scope.orderTotal)*parseFloat($scope.curBusiness.discountrate))/100);
							$scope.curBusiness.discountprice = disprice;
						}else if($scope.curBusiness.discounttype == 2){
							disprice = parseFloat($scope.curBusiness.discountrate);
						}

						if(parseFloat($scope.orderTotal) >= parseFloat($scope.curBusiness.discountminshop)){
							if(parseFloat($scope.orderTotal)>= parseFloat(disprice)){
								$scope.orderTotal = parseFloat(parseFloat($scope.orderTotal) - parseFloat(disprice));
								$scope.order_buyer.coupon = $scope.curBusiness.discountcode;
								$scope.curBusiness.discountactive = true;
								$scope.curBusiness.discountprice = $scope.FormatPriceNotFree(disprice);                                
								$scope.curBusiness.discountcode = true                                
							}else{
								$scope.curBusiness.discountprice="";
							}   
						}else{
							$scope.curBusiness.discountprice="";
						}
					}
					$scope.curBusiness.Total = (parseFloat($scope.orderTotal)).toFixed(2);
            		$scope.curBusiness.grandtotal = $scope.curBusiness.Total;                    
					return disprice;
				}
			},function (e) {
				MyAlert.show(e.statusText);
			});
		};

		//-------------------------------------------------------------------------------

		$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/payment-select-popup.html', {
			scope: $scope,
			animation: 'slide-in-left',
			backdropClickToClose: false
		}).then(function(modal) {
			$scope.modal2 = modal;
		});
		
		
		$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/payment-choose-stripe.html', {
			scope: $scope,
			animation: 'slide-in-left'
		}).then(function(modal) {
			$scope.modalstripe = modal;
		});
		
		$scope.onPaymentPopup = function(){
			$scope.modal2.show();
		};
		
		
		 $scope.setStripeOption = function() {
		 	MyLoading.show();
			if ($scope.stripepaymentModel.val === 'none') {
				MyAlert.show($scope.MLanguages.MOBILE_CHOOSE_CARD);
				return;
			}
			if($scope.stripepaymentModelRec.default_source == false || $scope.stripepaymentModelRec.default_source == "false" ) {
				cardRecordSrv.setDefaultCardByUser.defaultCard({
					cardid : $scope.stripepaymentModelRec.id,
					customerid :  $scope.stripepaymentModelRec.customerid,
					key : PAYMENT_GATWAY_KEY.StripeApiSetKey
				},function (s) {
					// alert(JSON.stringify(s))
					MyLoading.hide();
					$scope.curBusiness.business[0].paymethod.stripe = true;
					MyAlert.show("\<center\>"+$scope.MLanguages.MOBILE_CARD_SET_SUCCESS+"\<\/center\>");
					$scope.modalstripe.hide();
				},function (e) {
					//alert("ll")
					MyLoading.hide();
					MyAlert.show($rootScope.MLanguages.MOBILE_ERROR+' : ' + $rootScope.MLanguages.MOBILE_CANNOT_CONNECT_SERVER);
				});
			} else {
				$scope.curBusiness.business[0].paymethod.stripe = true;
				MyLoading.hide();
				$scope.modalstripe.hide();
				//alert($scope.stripepaymentModelRec.default_source);
			}
		};
//pay with cash
		$scope.offPaymentPopup = function(){
			if ($scope.paymentModel.val === 'none') {
				MyAlert.show($scope.MLanguages.BUSINESS_PAYMENT_VALIDATION+'!');
				return;
			}
			for(var i in $scope.curBusiness.business[0].paymethod){
                if(i == $scope.paymentModel.val){
                    $scope.curBusiness.business[0].paymethod[i] = true;
                }else{
                    $scope.curBusiness.business[0].paymethod[i] = false;
                }
            } 
			//$scope.curBusiness.business[0].paymethod[$scope.paymentModel.val] = true;
			$scope.curBusiness.business[0].paymethoddetail[$scope.paymentModel.val] = true;
			$scope.modal2.hide();
		};

		 $scope.offStripePaymentPopup = function(){
		   /* if ($scope.paymentModel.val === 'none') {
				$ionicPopup.alert({
					title : $scope.MLanguages.MOBILE_APPNAME,
					template : 'Please select Payment Method!'
				});
				return;
			}
			$scope.curBusiness.business[0].paymethod[$scope.paymentModel.val] = true;
			$scope.curBusiness.business[0].paymethoddetail[$scope.paymentModel.val] = true;*/
			$scope.modalstripe.hide();
		};
		
		
		$scope.addNewCardChkout = function(){
			if (!ADDONS.web_template) {
				$scope.modalstripe.hide();
				$scope.modal2.hide();
				$state.go('sideMenu.cardDetail');
			} else $scope.showAddNewCard();
		};

		$scope.showAddNewCard = function(){
			if ($scope.modal_add_payment != null) $scope.modal_add_payment.remove();
			$ionicModal.fromTemplateUrl('templates/'+ADDONS.template+'/my-card-details.html', {
			scope: $scope,
			animation: 'slide-in-up'
			}).then(function(modal) {
				console.log(modal);
				$scope.modal_add_payment = modal;
				$scope.modal_add_payment.show();
			});
		}

		$scope.closeAddNewCard = function () {
			console.log('closeAddNewCard');
			$scope.modal_add_payment.hide();
			$scope.modal_add_payment.remove();
			$scope.refreshCard();
		}

		//---------------------------------------------

		$scope.placedData = {};
		$scope.placeOrderNow = function () {
			$scope.orderTotal = parseFloat($scope.orderTotal.toFixed(2));

			//console.log($scope.order_buyer, $scope.infoFields);

			if (($scope.order_buyer.name == undefined || $scope.order_buyer.name == '') && $scope.infoFields['Name'].status && $scope.infoFields['Name'].required) {
				MyAlert.show($scope.MLanguages.NAME_IS_REQUIRED);
				return;
			}

			if (($scope.order_buyer.lastname2 == undefined || $scope.order_buyer.lastname2 == '') && $scope.infoFields['Last Name'].status && $scope.infoFields['Last Name'].required) {
				MyAlert.show($scope.MLanguages.LASTNAME_IS_REQUIRED);
				return;
			}

			if (($scope.order_buyer.email == undefined || $scope.order_buyer.email == '') && $scope.infoFields['Email'].status && $scope.infoFields['Email'].required) {
				MyAlert.show($scope.MLanguages.EMAIL_IS_REQUIRED);
				return;
			}

			if (($scope.order_buyer.city == undefined || $scope.order_buyer.city == '') && $scope.infoFields['City'].status && $scope.infoFields['City'].required) {
				MyAlert.show($scope.MLanguages.CITY_IS_REQUIRED);
				return;
			}

			if (($scope.order_buyer.neighbour == undefined || $scope.order_buyer.neighbour == '') && $scope.infoFields['Area / Neighborhood'].status && $scope.infoFields['Area / Neighborhood'].required) {
				MyAlert.show($scope.MLanguages.NEIGHBOUR_IS_REQUIRED);
				return;
			}

			if (($scope.order_buyer.address == undefined || $scope.order_buyer.address == '') && $scope.getdeliveryType == 'delivery' && $scope.infoFields['Full Address'].status && $scope.infoFields['Full Address'].required) {
				MyAlert.show($scope.MLanguages.ADDRESS_IS_REQUIRED);
				return;
			}

			if (($scope.order_buyer.zip == undefined || $scope.order_buyer.zip == '') && $scope.infoFields['Zipcode'].status && $scope.infoFields['Zipcode'].required) {
				MyAlert.show($scope.MLanguages.ZIPCODE_IS_REQUIRED);
				return;
			}

			if (($scope.order_buyer.tel == undefined || $scope.order_buyer.tel == '') && $scope.infoFields['Phone'].status && $scope.infoFields['Phone'].required) {
				MyAlert.show($scope.MLanguages.PHONE_IS_REQUIRED);
				return;
			}

		/*	if (($scope.order_buyer.receive_sms == undefined || $scope.order_buyer.receive_sms == '') && $scope.infoFields['Receive SMS'].status && $scope.infoFields['Receive SMS'].required) {
				MyAlert.show($scope.MLanguages.RECEIVE_SMS_IS_REQUIRED);
				return;
			}*/
/*			if (($scope.order_buyer.takeout_date == undefined || $scope.order_buyer.takeout_date == '') && $scope.infoFields['Takeout Date'].status && $scope.infoFields['Takeout Date'].required) {
				MyAlert.show($scope.MLanguages.TAKEOUT_DATE_IS_REQUIRED);
				return;
			}*/

			if (($scope.finalCheckout.specialcomment == undefined || $scope.finalCheckout.specialcomment == '') && $scope.infoFields['APT/Suit'].status && $scope.infoFields['APT/Suit'].required) {
				MyAlert.show($scope.MLanguages.TAKEOUT_DATE_IS_REQUIRED);
				return;
			}

			/*if (($scope.finalCheckout.where_find_us == undefined || $scope.finalCheckout.where_find_us == '') && $scope.infoFields['Where did you find about us'].status && $scope.infoFields['Where did you find about us'].required) {
				MyAlert.show($scope.MLanguages.WHERE_FIND_US_IS_REQUIRED);
				return;
			}*/

			if (($scope.order_buyer.couponstatus == undefined || $scope.order_buyer.couponstatus == '') && $scope.infoFields['Discount Coupon'].status && $scope.infoFields['Discount Coupon'].required) {
				MyAlert.show($scope.MLanguages.DISCOUNT_COUPON_IS_REQUIRED);
				return;
			}

			if ($scope.orderTotal == null) return;
			if ($scope.order_buyer.name == '' || $scope.order_buyer.email == '' ||
				$scope.order_buyer.address == '' || $scope.order_buyer.tel == '') {
				$scope.fieldDetect($scope.MLanguages.MOBILE_FILL_REQUIRED_FIELDS);
				return;

			}
			if ($scope.paymentModel.val == 'none'){
				$scope.fieldDetect($scope.MLanguages.BUSINESS_PAYMENT_VALIDATION);
				return;
			}

			/*if ($scope.getdeliveryType == 'delivery' && $scope.order_buyer.address == undefined){
                $scope.fieldDetect($scope.MLanguages.MOBILE_FILL_REQUIRED_FIELDS);
                return;
            }*/

			$scope.show($ionicLoading);

			// Update Buyer Infomations for order data
			$scope.curBusiness.buyer.name = $scope.order_buyer.name;
			$scope.curBusiness.buyer.email = $scope.order_buyer.email;
			$scope.curBusiness.buyer.address = $scope.order_buyer.address;
			$scope.curBusiness.buyer.street = $scope.order_buyer.address;
			$scope.curBusiness.buyer.tel = $scope.order_buyer.tel;
			$scope.curBusiness.buyer.tips = $scope.data.driveTips;
			$scope.curBusiness.buyer.api = $scope.finalCheckout.specialcomment;
			if (ADDONS.precise_coordinates) $scope.curBusiness.buyer.location = gMyLatLng.getData();
			$scope.curBusiness.Total = $scope.orderTotal;
			$scope.curBusiness.total = $scope.orderTotal;

			$scope.curBusiness.buyer.cityname = $rootScope.cityname ;

			if (USER_STATE != 'GUEST'){

				UserSvc.updateUser.update({
					lang : localStorageApp.getItem('LangId'),
					Id   : $scope.order_buyer.id,
					name    : $scope.order_buyer.name,
					email   : $scope.order_buyer.email,
					password: $scope.order_buyer.password,
					lastName : $scope.order_buyer.lastname,
					country : $scope.order_buyer.country,
					city : $scope.order_buyer.city,
					street : $scope.order_buyer.address,
					postCode : $scope.order_buyer.zip,
					landPhone : $scope.order_buyer.tel,
					mobilePhone : $scope.order_buyer.cel,
					apt : $scope.order_buyer.api
				},{},
				function (res) {
					onPlaceOrder();
				},function (e) {
					$scope.hide();
				});

			} else {
				$scope.order_buyer.cityname = '';
				gUserData.setData($scope.order_buyer);
				$scope.curBusiness.buyer.id = '-1';
				$scope.curBusiness.buyer.cityname = $rootScope.cityname ;
				$scope.curBusiness.buyer.city = '1';

				// placeOrder ------------------
				onPlaceOrder();
			}

			function onPlaceOrder() {
				gBusinessData.setData($scope.curBusiness);
				//console.log($scope.curBusiness, gMyLatLng.getData());
				// Request Post Data to server on JQuery------------------------
				var postData = {
					data : JSON.stringify($scope.curBusiness),
					userId : gUserData.getData().id,
					comment : ''
				};
				//console.log(postData);
				var url = API_ENDPOINT.order + '/place';
				JqueryPostDataSvc.post(url, postData).then(function (s) {
					console.log(s);
					if (s.error == 'false'){
						$scope.placedOrderId = s.result.orderId;
						// All Order data init
						if ($scope.paymentModel.val == "stripe") {
							$scope.stripeconfirmpayment();
						} else if ($scope.paymentModel.val == "paypal" || $scope.paymentModel.val == "Paypal"){                            
							var paypalRedirectUrl = API_ENDPOINT.payment.rooturl+'/paypalcustom'+"?id="+$scope.placedOrderId ;
							var rpaypalCls = window.open(paypalRedirectUrl, '_blank','location=no,clearcache=yes');     
							$scope.windowclosePaypal = rpaypalCls;
							$scope.myPaypalReturnChk = null;
							$scope.myPaypalReturnChk =  $interval($scope.paypalconfirmpayment, 2000);
						} else if ($scope.paymentModel.val == "paypaladaptive" || $scope.paymentModel.val == "Paypaladaptive") {
							var paypaladaptiveRedirectUrl = API_ENDPOINT.payment.PaypalAdaptive.calling+"?id="+$scope.placedOrderId ;
							var rpaypaladapCls = window.open(paypaladaptiveRedirectUrl, '_blank','location=no,clearcache=yes');     
							$scope.windowclosePaypaladaptive = rpaypaladapCls;
							$scope.myPaypalReturnChk = null;
							$scope.myPaypalReturnChk =  $interval($scope.paypaladaptiveconfirmpayment, 2000);
						} else {
							ConfirmSvc.getInfo({
								orderId    : s.result.orderId,
								ordercomment : s.result.comment,
								lang : localStorageApp.getItem('LangId')
							},function (s) {
								//$scope.hide();
								gStates.setState(STATE.PROFILE);
								$scope.curBusinessData = s;
								console.log(s)
								initOrderData();
								$scope.onConfirm();
							},function (e) {});
						}
						/*ConfirmSvc.getInfo({
							orderId    : s.result.orderId,
							ordercomment : s.result.comment,
							lang : localStorageApp.getItem('LangId')
						},function (s) {
							//$scope.hide();
							gStates.setState(STATE.PROFILE);
							$scope.curBusinessData = s;
							initOrderData();
							console.log($scope.paymentModel.val);
							if($scope.paymentModel.val == "stripe") {
								$scope.stripeconfirmpayment();
							} else{
								$scope.onConfirm();
							}
						},function (e) {

						});*/
					}else {
						MyAlert.show($scope.MLanguages.MOBILE_PLACE_ORDER_ERROR);
					}
				},function (e) {

				});
			}
		};

		function initOrderData(){
			//$ionicHistory.clearCache();
			//$ionicHistory.clearHistory();
			var ary = [];
			gOrder.setData(ary);
			gBusinessData.setData({});
			console.log("SET DATA: 6");
			gCurRestaurant.setData({});
			gAllBusiness.setData([]);
			gBufferDishes.setData(ary);
			
			$ionicLoading.hide();
		}

/* paypal */
		$scope.paypalconfirmpayment = function(){
			if ($scope.windowclosePaypal.closed){
				//$scope.hide(); 
				MyAlert.show('Opps! Payment process is not completed ');
				$interval.cancel($scope.myPaypalReturnChk);
				$scope.onConfirm();
			} else {
				paypalCardSvc.getCardifo.returnChk({
					orderid : $scope.placedOrderId
				},function (s) {
					if (s.status == true) {
						//$scope.hide();
						$interval.cancel($scope.myPaypalReturnChk);
						$scope.myPaypalReturnChk = null;
						$scope.windowclosePaypal.close();
						MyAlert.show('Payment process successfully and txn id ' + s.paypaltx_value);
						ConfirmSvc.getInfo({
							orderId    : $scope.placedOrderId,
							ordercomment : '',
							lang : localStorageApp.getItem('LangId')
						},function (s) {
							//$scope.hide();
							console.log(s)
							initOrderData();
							$scope.onConfirm();
						},function (e) {});                        
					}
				}, function (e) {
					MyLoading.hide();
					MyAlert.show('Error : ' + e.statusText);
				});
			}
		};

		$scope.paypaladaptiveconfirmpayment= function(){
			if ($scope.windowclosePaypaladaptive.closed) {
				//$scope.hide(); 
				MyAlert.show('Opps! Payment process is not completed');
				$interval.cancel($scope.myPaypalReturnChk);
				$scope.onConfirm();
			} else {
				paypalCardSvc.getCardifo.returnChk({
					orderid : $scope.placedOrderId
				},function (s) {
					if (s.status == true) {
						//$scope.hide();   
						$interval.cancel($scope.myPaypalReturnChk);
						$scope.myPaypalReturnChk = null;
						$scope.windowclosePaypaladaptive.close();
						MyAlert.show('Payment process successfully and txn id ' + s.paypaltx_value);
						ConfirmSvc.getInfo({
							orderId    : $scope.placedOrderId,
							ordercomment : '',
							lang : localStorageApp.getItem('LangId')
						},function (s) {
							//$scope.hide();
							console.log(s)
							initOrderData();
							$scope.onConfirm();
						},function (e) {});                        
					}
				},function (e) {
					MyLoading.hide();
					MyAlert.show('Error : ' + e.statusText);
				});
			}
		};



		$scope.onAutoCompleteAddress = function() {
            setTimeout(function() {
                if (typeof document.getElementsByClassName('backdrop')[0] != 'undefined' &&
                    typeof document.getElementsByClassName('pac-container')[0] != 'undefined'){
                    for (var i = 0; i < document.getElementsByClassName('pac-container').length; i++){
                        document.getElementsByClassName('pac-container')[i].setAttribute('data-tap-disabled', true);
                    }
                    for (i = 0; i < document.getElementsByClassName('backdrop').length; i++){
                        document.getElementsByClassName('backdrop')[i].setAttribute('data-tap-disabled', true);
                    }
                }
            }, 100);

        }


		$scope.onAutoCompleteAddress = function() {
			setTimeout(function() {
				if (typeof document.getElementsByClassName('backdrop')[0] != 'undefined' &&
					typeof document.getElementsByClassName('pac-container')[0] != 'undefined'){
					for (var i = 0; i < document.getElementsByClassName('pac-container').length; i++){
						document.getElementsByClassName('pac-container')[i].setAttribute('data-tap-disabled', true);
					}
					for (i = 0; i < document.getElementsByClassName('backdrop').length; i++){
						document.getElementsByClassName('backdrop')[i].setAttribute('data-tap-disabled', true);
					}
				}
			}, 100);
		}
		if (ADDONS.web_template) initView();
	})

	.controller('confirmCtrl',function($scope, $rootScope, $state, $stateParams, gNearService){
		//console.log($rootScope.confirmData);
		$scope.curBusinessData = $rootScope.confirmData.curBusinessData;
		$scope.order_buyer = $rootScope.confirmData.order_buyer;
		$scope.curMyDishes = $rootScope.confirmData.curMyDishes;
		$scope.placedOrderId = $rootScope.confirmData.placedOrderId;
		$scope.finalCheckout = $rootScope.confirmData.finalCheckout;

		$scope.subTotalPrice = $rootScope.confirmData.subTotalPrice;
		$scope.curBusiness = $rootScope.confirmData.curBusiness;
		$scope.c_unit = $scope.curBusiness.business[0].currency;
		$scope.deliveryFee = $rootScope.confirmData.deliveryFee;
		$scope.data = $rootScope.confirmData.data;
		$scope.orderTotal = $rootScope.confirmData.orderTotal;

		$scope.paymentModel = $rootScope.confirmData.paymentModel;
		$scope.curOrderType = gNearService.getData().orderType;
	})

	.controller('notfoundCtrl',function($scope, $rootScope){
		$scope.getLanguage(function (err, list, dictionary) {
			//$scope.MLanguages = dictionary;
			//$rootScope.MLanguages = dictionary;
		});
	})

	.controller('checkDetailCtrl',function($scope, $ionicLoading, $compile){

	})

	.controller('MapCtrl', function($scope, $ionicLoading, $compile) {

	})

	.controller('MapCtrl2', function($scope, $ionicLoading, $compile) {

	})

	.directive('googleplace', function($rootScope) {
		return {
			require: 'ngModel',
			scope: {
				ngModel: '=',
				details: '=?'
			},
			link: function(scope, element, attrs, model) {
				$rootScope.loadGoogleMaps(function () {
					var options = {
						types: []
					};
					scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

					google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
						scope.$apply(function() {
							scope.details = scope.gPlace.getPlace();
							element[0].value = scope.details.formatted_address;
							model.$setViewValue(element.val());
						});
					});
				});
			}
		};
	})

	.directive('errSrc', function() {
		return {
			link: function(scope, element, attrs) {
				element.bind('error', function() {
					if (attrs.src != attrs.errSrc) {
						attrs.$set('src', attrs.errSrc);
					}
				});
			}
		}
	})

	.directive('imageonload', function() {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				element.bind('load', function() {
					//alert('image is loaded');
					AVATAR_LOAD = true;
				});
				element.bind('error', function(){
					//alert('image could not be loaded');
					scope.$on('$ionicView.loaded',function(){
						//alert("");
					});
					AVATAR_LOAD = false;
				});
			}
		};
	})

	.directive('myRepeat', [ '$animate', function($animate) {

		var updateScope = function(scope, index, valueIdentifier, value, key, arrayLength) {
			scope[valueIdentifier] = value;
			scope.$index = index;
			scope.$first = (index === 0);
			scope.$last = (index === (arrayLength - 1));
			scope.$middle = !(scope.$first || scope.$last);
			scope.$odd = !(scope.$even = (index&1) === 0);
		};

		return {
			restrict: 'A',
			transclude: 'element',
			compile: function($element, $attrs) {

				var expression = $attrs.myRepeat;

				var match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)?\s*$/);

				var valueIdentifier = match[1];
				var collection = match[2];

				return function($scope, $element, $attr, ctrl, $transclude) {

					$scope.$watchCollection(collection, function(collection) {
						var index, length,
							previousNode = $element[0],
							collectionLength,
							key, value;

						collectionLength = collection.length;

						for (index = 0; index < collectionLength; index++) {
							key = index;
							value = collection[key];

							$transclude(function(clone, scope) {
								$animate.enter(clone, null, angular.element(previousNode));
								previousNode = clone;
								updateScope(scope, index, valueIdentifier, value, key, collectionLength);
							});

						}
					});

				}
			}
		}

	}])
	/*.directive('select', function($interpolate) {
		return {
			restrict: 'E',
			require: 'ngModel',
			link: function(scope, elem, attrs, ctrl) {
				var defaultOptionTemplate;
				scope.defaultOptionText = attrs.defaultOption || 'Please select';
				defaultOptionTemplate = '<option value="" disabled selected style="display: none;">{{defaultOptionText}}</option>';
				elem.prepend($interpolate(defaultOptionTemplate)(scope));
			}
		};
	})*/
	.directive('starRating', function () {
		return {
			restrict: 'A',
			template: '<ul class="rating">' +
			'<li ng-repeat="star in stars" ng-class="star">' +
			'<span class="icon ion-star"></span>' +
			'</li>' +
			'</ul>',
			scope: {
				ratingValue: '=',
				max: '='
			},
			link: function (scope, elem, attrs) {
				var aux = JSON.stringify(scope.ratingValue);
				scope.stars = [];
				for (var i = 0; i < scope.max; i++) {
					scope.stars.push({
						filled: i < scope.ratingValue,
						unfilled: i >= scope.ratingValue
					});
				}
			}
		}
	})
	.directive('onErrorSrc', function() {
		return {
			link: function(scope, element, attrs) {
				attrs.onErrorSrc
				element.bind('error', function() {
					element.remove();
					$('#'+attrs.onErrorSrc).remove();
				});
			}
		}
	})
	.filter('safeHtml', function ($sce) {
		return function (val) {
			return $sce.trustAsHtml(val);
		};
	});
