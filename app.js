var app = angular.module("App", ["vxWamp"]);


//Configure our broker client with the demo URL and demo domain
app.config(function ($wampProvider) {
    $wampProvider.init({
        url: 'ws://ngnl.pulsive.nl:3000/',
        realm: 'ngnl'
    });
});
