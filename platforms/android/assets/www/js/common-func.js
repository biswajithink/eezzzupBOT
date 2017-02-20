/**
 * Created by STORM on 2/8/2016.

var SEVER_API_KEY_CURRENT = 'AIzaSyCH4hL3Mc7jh8wejEe3MBLDRe68MwoJujc';
var SENDER_ID_CURRENT = '1021116265386';
*/

var ROOT_URL = (validProp(config_builder.root_url)) ? config_builder.root_url : 'https://www.biteontime.com.au';
var API_URL = (validProp(config_builder.url_api)) ? config_builder.url_api : 'https://amec1api2.yourordering.com/sys';
var APP_ID = 'OrderingApp';
var API_PROJECT_NAME = (validProp(config_builder.api_project_name)) ? config_builder.api_project_name : 'amec1043';
var APP_ID_IONIC_CLOUD = (validProp(config_builder.ionic_cloud)) ? config_builder.ionic_cloud : 'e25d2da0';
var GCM_SENDER_ID = (validProp(config_builder.google_cloud_message_id)) ? config_builder.google_cloud_message_id : '138937902417';
var ONE_SIGNAL_ID = (validProp(config_builder.onesignal_id)) ? config_builder.onesignal_id : 'f4d9d806-882e-4b96-b7d1-4f3e478e8726';
var GCM_DEVICE_TOKEN = '';
var GM_API_KEY = (validProp(config_builder.google_maps_key_api)) ? config_builder.google_maps_key_api : 'AIzaSyCB78DCZMD1oPmtXB3OlbCbUqS-D4bQRXs';
var SEARCH_BY_ADDRESS = (validProp(config_builder.search_by_address)) ? config_builder.search_by_address : true;
var TIME_FORMAT_24 = (validProp(config_builder.time_format_24h)) ? config_builder.time_format_24h : true;
var DISTANCE_UNIT_KM = (validProp(config_builder.distance_unit_km)) ? config_builder.distance_unit_km : true;
var BUSINESS_ID = (validProp(config_builder.single_business_id)) ? parseInt(config_builder.single_business_id) : 57; //Only single business
var FB_APP_ID = (validProp(config_builder.facebook_id)) ? config_builder.facebook_id : '739943399474623';//'225514411127555';


var DRIVER_TIP = (validProp(config_builder.user_driver_tip)) ? config_builder.user_driver_tip : true;
var DRIVER_TIPS = {
    tip_1: (validProp(config_builder.driver_tip_1)) ? parseInt(config_builder.driver_tip_1) : 0,
    tip_2: (validProp(config_builder.driver_tip_2)) ? parseInt(config_builder.driver_tip_2) : 10,
    tip_3: (validProp(config_builder.driver_tip_3)) ? parseInt(config_builder.driver_tip_3) : 15,
    tip_4: (validProp(config_builder.driver_tip_4)) ? parseInt(config_builder.driver_tip_4) : 20,
    tip_5: (validProp(config_builder.driver_tip_5)) ? parseInt(config_builder.driver_tip_5) : 25
};
//Default address position
var ADDRESS = {
    street: (validProp(config_builder.default_address_street)) ? config_builder.default_address_street : '5th Ave, New York, NY, EE. UU.',
    latitude: (validProp(config_builder.default_address_latitude)) ? parseFloat(config_builder.default_address_latitude) : 40.7750534,
    longitude: (validProp(config_builder.default_address_longitude)) ? parseFloat(config_builder.default_address_longitude) : -73.965151
}

var STATE = {                   // App State
    PROFILE : 'userProfileState',
    MY_ORDER : 'myOrderState',
	MY_CARD : 'myCardState',
    ORDERING : 'orderingState',
    MENU : 'homeScreenState',
    NO_INTERNET : 'NoInternetConnection',
    STATE_OK : 'ConnectionOk'
};
var CURRENCY = '$';             // Currency of Current Business
var USER_STATE = 'SIGN_UP';     // State of User's such as Login, SignUp, Guest

var AVATAR_LOAD = true;
var G_NETSTATE = 'OK';
var LOGIN_STATE = false;

var STORE_VAL = {
    USR_ID : 'user_id',
    PUSH : 'push_state',
    LOGIN : 'login_state',
    LOGIN_ACCOUNT : 'login_account',
    IS_FBUSER : 'is_fbsuer',
    LANG: 'LangId',
    DICTIONARY: 'dictionary',
    LANG_LIST: 'lang_list',
    RESET_LANG: 'reset_lang',
    ORDER_TYPE: 'order_type',
    ADDRESS: 'address',
    FROM_SEARCH: 'from_search',
    USER_DATA: 'user_data',
    BUSINESS_DATA: 'business_data',
    NEAR_SERVICE: 'near_service',
    ORDER_DATA: 'order_data',
    CUR_RESTAURANT: 'cur_restaurant',
    MY_STRIPE_CARD: 'my_stripe_card',
    BUFFER_DISHES: 'buffer_dishes',
    ALL_BUSINESS: 'all_business',
    MY_LAT_LNG: 'my_lat_lng',
    MY_ADDRESS: 'my_address',
};
var DEVICE_TYPE = {
    IOS : 'ios',
    ANDROID : 'android'
};
var COMMON_DATA = {
    serviceFee : ''
};
var ORDER_STATES = ['PENDING','COMPLETE','CANCELLED','PREPARATION','ON_ITS_WAY','CANCELLED_RESTAURANT','CANCELLED_BY_DRIVER','ACCEPTED_BY_RESTAURANT'];

// Updates
UPDATE_BACKGROUND = (validProp(config_builder.background_update)) ? config_builder.background_update : false;
RESET_AFTER_UPDATE = (validProp(config_builder.reset_after_update)) ? config_builder.reset_after_update : false;
ENABLE_UPDATE = (validProp(config_builder.enable_update)) ? config_builder.enable_update : false;

//ADDONS
var ADDONS = {
    multilanguage: true,
    pickup: true,
    business_enhacements: true,
    product_enhacements: true,
    cart_enhacements: true,
    share_order: true,
    discount_offer: true,
    discount_code: true,
    stripe_payment: true,
    template: (validProp(config_builder.addons.template)) ? config_builder.addons.template : 'app1',
    facebook_login: true,
    guest_login: true,
    paypal_payment: (validProp(config_builder.addons.paypal_payment)) ? config_builder.addons.paypal_payment : true,
};

var WEB_ADDONS = {
    all_categories: true,
    check_address: true,
    remove_hash: false,
    payment_option_inline: true,
    check_address_checkout: true,
    welcome_fullscreen: true,
};

var REMEMBER_LAST_ADDRESS = ADDONS.template == 'app2';

if (!ADDONS.web_template && (window.location.pathname == '/' || window.location.pathname == '/index.html' || window.location.pathname == 'index.html' || window.location.pathname.indexOf('index.html') != -1)) {
    console.log(window.location.pathname);
    window.location = 'index_movil.html';
}

var themes = $("link[id^='app']");
for (var i = 0; i < themes.length; i++) {
    if ($(themes[i]).attr('id') != ADDONS.template) themes[i].remove();
}

function validProp(prop) {
    return prop != null && prop != undefined;
}

/*var localStorageApp = {};
try {
    localStorage.setItem("TST", 1);
    localStorageApp = localStorage;
} catch (e) {
    localStorageApp = {
        keyValues: {},
        length: 0,
        setItem: function (key, value) {
            this.keyValues[key] = value;
        },
        getItem: function (key) {
            if (this.keyValues[key] == undefined) return null;
            else return this.keyValues[key];
        },
        removeItem: function (key) {
            this.keyValues[key] = null;
        }
    };
}*/

//FastClick.attach(document.body, options);

Date.prototype.Format = function(fmt)
{ //author: meizz
    var hours,ap;
    if (this.getHours() >= 12){
        hours = this.getHours() - 12;
        ap = 'PM';
    }else {
        hours = this.getHours();
        ap = 'AM';
    }
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : hours,                              //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds(),             //毫秒
        "P"  : ap
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
};

function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function onNotificationGCM (e){
    switch( e.event )
    {
        case 'registered':
            if (e.regid.length > 0) {
                //alert(e.regid);
                GCM_DEVICE_TOKEN = e.regid;
            }
            break;

        case 'message':
            //alert("What is it?");

            break;

        case 'error':

            alert(e.message);
            break;

        default:
            break;
    }
}

// APN Push ecb -----------------------------------------------------
function onNotificationAPN(e) {
    if (e.alert) {
        //alert(e.alert);
    }
    if (e.sound) {
        // playing a sound also requires the org.apache.cordova.media plugin
        /*var snd = new Media(e.sound);
         snd.play();*/
    }
    if (e.badge) {
        // pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
    }
}

function testPOSTRequest ( url, postJsonData ) {

    // $.ajax({
    //     url: url,
    //     type: 'POST',
    //     dataType: 'JSON',
    //     data: postJsonData,
    //     crossDomain: true,
    //     cache: false,
    //     success:  function(s){
    //         alert("Successful" + JSON.stringify(s));
    //         // alert("Successful Token Register!!");
    //     },
    //     error: function(e){
    //         alert("Error" + JSON.stringify(e));
    //         // alert("Failed Token Register!!");
    //     }
    // });
    $.post(url, postJsonData, function (s) {
        alert("Result : " + JSON.stringify(s));
    });
}

function getCurrencySymbol( currency_str ){

    if(currency_str == 'AED'){
        return 'AED';
    }
    if(currency_str == 'USD'){
        return '$';
    }
    if(currency_str == 'EUR'){
        return '€';
    }
    if(currency_str == 'MXN'){
        return '$';
    }
    if(currency_str == 'AUD'){
        return '$';
    }
    if(currency_str == 'BRL'){
        return 'R$';
    }
    if(currency_str == 'CAD'){
        return '$';
    }
    if(currency_str == 'CZK'){
        return 'Kč';
    }
    if(currency_str == 'DKK'){
        return 'kr';
    }
    if(currency_str == 'HKD'){
        return '$';
    }
    if(currency_str == 'HUF'){
        return 'Ft';
    }
    if(currency_str == 'ILS'){
        return '₪';
    }
    if(currency_str == 'JPY'){
        return '¥';
    }
    if(currency_str == 'MYR'){
        return 'RM';
    }
    if(currency_str == 'NOK'){
        return 'kr';
    }
    if(currency_str == 'NZD'){
        return '$';
    }
    if(currency_str == 'PHP'){
        return '₱';
    }
    if(currency_str == 'PLN'){
        return 'zł';
    }
    if(currency_str == 'GBP'){
        return '£';
    }
    if(currency_str == 'SGD'){
        return '$';
    }
    if(currency_str == 'SEK'){
        return 'kr';
    }
    if(currency_str == 'CHF'){
        return 'CHF';
    }
    if(currency_str == 'TWD'){
        return 'NT$';
    }
    if(currency_str == 'THB'){
        return '฿';
    }
    if(currency_str == 'TRY'){
        return '₤';
    }
    if(currency_str == 'ALL'){
        return 'Lek';
    }

    if(currency_str == 'AFN'){
        return '؋';
    }
    if(currency_str == 'ARS'){
        return '$';
    }
    if(currency_str == 'AWG'){
        return 'ƒ';
    }
    if(currency_str == 'AZN'){
        return 'ман';
    }
    if(currency_str == 'BSD'){
        return '$';
    }
    if(currency_str == 'BBD'){
        return '$';
    }
    if(currency_str == 'BYR'){
        return 'p.';
    }

    if(currency_str == 'BZD'){
        return 'BZ$';
    }
    if(currency_str == 'BMD'){
        return '$';
    }
    if(currency_str == 'BOB'){
        return '$b';
    }
    if(currency_str == 'BAM'){
        return 'KM';
    }

    if(currency_str == 'BWP'){
        return 'P';
    }
    if(currency_str == 'BGN'){
        return 'лв';
    }
    if(currency_str == 'BND'){
        return '$';
    }
    if(currency_str == 'KHR'){
        return '៛';
    }
    if(currency_str == 'KYD'){
        return '$';
    }
    if(currency_str == 'CLP'){
        return '$';
    }
    if(currency_str == 'CNY'){
        return '¥';
    }
    if(currency_str == 'COP'){
        return '$';
    }
    if(currency_str == 'CRC'){
        return '₡';
    }
    if(currency_str == 'HRK'){
        return 'kn';
    }

    if(currency_str == 'CUP'){
        return '₱';
    }
    if(currency_str == 'DOP'){
        return 'RD$';
    }
    if(currency_str == 'XCD'){
        return '$';
    }
    if(currency_str == 'EGP'){
        return '£';
    }
    if(currency_str == 'SVC'){
        return '$';
    }
    if(currency_str == 'EEK'){
        return 'kr';
    }
    if(currency_str == 'FKP'){
        return '£';
    }
    if(currency_str == 'FJD'){
        return '$';
    }
    if(currency_str == 'GHC'){
        return '¢';
    }
    if(currency_str == 'GIP'){
        return '£';
    }
    if(currency_str == 'GTQ'){
        return 'Q';
    }
    if(currency_str == 'GGP'){
        return '£';
    }
    if(currency_str == 'GYD'){
        return '$';
    }
    if(currency_str == 'HNL'){
        return 'L';
    }
    if(currency_str == 'ISK'){
        return 'kr';
    }
    if(currency_str == 'INR'){
        return 'रु';
    }
    if(currency_str == 'IDR'){
        return 'Rp';
    }
    if(currency_str == 'IRR'){
        return '﷼';
    }

    if(currency_str == 'IMP'){
        return '£';
    }
    if(currency_str == 'JMD'){
        return 'J$';
    }
    if(currency_str == 'JEP'){
        return '£';
    }
    if(currency_str == 'KZT'){
        return 'лв';
    }
    if(currency_str == 'KPW'){
        return '₩';
    }
    if(currency_str == 'KRW'){
        return '₩';
    }
    if(currency_str == 'LAK'){
        return '₭';
    }
    if(currency_str == 'LVL'){
        return 'Ls';
    }
    if(currency_str == 'LBP'){
        return '£';
    }
    if(currency_str == 'LRD'){
        return '$';
    }
    if(currency_str == 'LTL'){
        return 'Lt';
    }
    if(currency_str == 'MKD'){
        return 'ден';
    }
    if(currency_str == 'MUR'){
        return '₨';
    }
    if(currency_str == 'MNT'){
        return '₮';
    }
    if(currency_str == 'MZN'){
        return 'MT';
    }
    if(currency_str == 'NAD'){
        return '$';
    }

    if(currency_str == 'NPR'){
        return 'ƒ';
    }if(currency_str == 'NIO'){
        return 'C$';
    }if(currency_str == 'NGN'){
        return '₦';
    }if(currency_str == 'OMR'){
        return '﷼';
    }if(currency_str == 'PKR'){
        return '₨';
    }if(currency_str == 'PAB'){
        return 'B/.';
    }if(currency_str == 'PYG'){
        return 'Gs';
    }if(currency_str == 'PEN'){
        return 'S/.';
    }if(currency_str == 'QAR'){
        return '﷼';
    }if(currency_str == 'RON'){
        return 'lei';
    }if(currency_str == 'RUB'){
        return 'руб';
    }if(currency_str == 'SHP'){
        return '£';
    }if(currency_str == 'SAR'){
        return '﷼';
    }if(currency_str == 'RSD'){
        return 'Дин.';
    }if(currency_str == 'SCR'){
        return '₨';
    }if(currency_str == 'SBD'){
        return '$';
    }if(currency_str == 'SOS'){
        return 'S';
    }if(currency_str == 'ZAR'){
        return 'R';
    }if(currency_str == 'LKR'){
        return '₨';
    }if(currency_str == 'SRD'){
        return '$';
    }if(currency_str == 'SYP'){
        return '£';
    }if(currency_str == 'TTD'){
        return 'TT$';
    }if(currency_str == 'TVD'){
        return '$';
    }if(currency_str == 'UAH'){
        return '₴';
    }if(currency_str == 'UYU'){
        return '$U';
    }if(currency_str == 'UZS'){
        return 'лв';
    }if(currency_str == 'VEF'){
        return 'Bs';
    }if(currency_str == 'VND'){
        return '₫';
    }if(currency_str == 'YER'){
        return '﷼';
    }if(currency_str == 'ZWD'){
        return 'Z$';
    }if(currency_str == 'IQD'){
        return 'د.ع';
    }if(currency_str == 'LYD') {
        return 'LYD ';
    }if(currency_str == 'FCFA') {
        return 'CFA ';
    }

}
function loadGoogleMaps(API_KEY) {
    var script_tag = document.createElement('script');
    script_tag.setAttribute("type", "text/javascript");
    script_tag.setAttribute("src", "https://maps.googleapis.com/maps/api/js?key="+API_KEY+"&libraries=places");
    (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
}
loadGoogleMaps(GM_API_KEY);

var intervalFixHeight = null;
function fixHeight(selector, by_body) {
    //console.log(selector);
    if (intervalFixHeight != null) clearInterval(intervalFixHeight);
    intervalFixHeight = setInterval(function () {
        var footer = $('.footer').last();
        var header = $('.navbar').last();
        var div = $(selector).last();
        var body = $('html').last();
        if(!div.is(":visible")) clearInterval(intervalFixHeight);
        div.css({ 'min-height': 'auto'});
        if ($(window).width() < 768) {
            div.css({ 'min-height': 'auto'});
        } else {
            if (by_body != null && by_body) {
                if ($(window).height() > footer.outerHeight()+header.outerHeight()+div.outerHeight()) {
                    div.css({ 'min-height': $(window).height()-footer.outerHeight()-header.outerHeight()});
                } else {
                    div.css({ 'min-height': body.outerHeight()-footer.outerHeight()-header.outerHeight()});
                }
            } else if ($(window).height() > footer.outerHeight()+header.outerHeight()+div.outerHeight()) {
                div.css({ 'min-height': $(window).height()-footer.outerHeight()-header.outerHeight()});
            }
        }
    }, 100);
}

function scrollToMiddle() {
    var scrollToMiddle = ($('body').height()/2)-($(window).width()/4);
    $('body').scrollTop(scrollToMiddle);
}

function disableScroll() {
    $('html').css({'overflow-y': 'hidden'});
}

function enableScroll() {
    $('html').css({'overflow-y': 'auto'});
}

function scrollToAlert() {
    setTimeout(function () {
        var ealert = $('.popup-container.popup-showing.active').last();
        var popup = ealert.find('.popup').last();
        console.log(ealert);
        console.log($('body').scrollTop(), $(window).outerHeight(), popup.outerHeight());
        var mtop = $('body').scrollTop()+(($(window).outerHeight()-popup.outerHeight())/2);
        console.log(mtop);
        ealert.css({ bottom: 'auto', top: mtop });
    }, 100);
}

function backdropAlert(show) {
    if (show) $('.backdrop').last().addClass('backdrop-alert');
    else $('.backdrop').last().removeClass('backdrop-alert');
}