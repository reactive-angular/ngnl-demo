
//Configure our broker client with the demo URL and demo domain
app.config(function ($wampProvider) {
    $wampProvider.init({
        url: 'ws://ngnl.pulsive.nl:3000/',
        realm: 'ngnl'
    });
});

app.controller("TaskApiCtrl", function($scope, $wamp) {
    $scope.connected = false;
    $scope.topicField = "";


    $scope.sendRestock = function(){
        //Send restock message
        $wamp.publish('com.'+$scope.topic+'.products', ['restockShipmentArrived']);
    };

    $scope.sendOrder = function(){
        //Send restock message
        var order = {products: {}};
        if ($scope.gumballs > 0) order.products.Gumball = {qty: $scope.gumballs};
        if ($scope.candybars > 0) order.products.Candybar = {qty: $scope.candybars};
        if ($scope.lollys > 0) order.products.Lolly = {qty: $scope.lollys};
        $wamp.publish('com.'+$scope.topic+'.orders', ['orderRequested',order]);
    };


    $scope.connect = function() {
        //Subscribe to the broker topic
        $scope.topic = $scope.topicField;

        $wamp.open();
    };

    $scope.$on("$wamp.open", function (event, session) {
        $scope.connected = true;
    });

    $scope.$on("$wamp.close", function (event, data) {
        $scope.connected = false;
    });
});
