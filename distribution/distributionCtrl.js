
//Configure our broker client with the demo URL and demo domain
app.config(function ($wampProvider) {
    $wampProvider.init({
        url: 'ws://ngnl.pulsive.nl:3000/',
        realm: 'ngnl'
    });
});

app.controller("DistributionCtrl", function($scope, $wamp, $timeout) {
    $scope.connected = false;
    $scope.ordersForShipping = [];
    $scope.topicField = "";

    //Receive handler
    function eventHandler(args) {
        //Receive arguments
        var event = args[0];
        var order = args[1];

        console.log('Received event: ' + event);

        switch(event){
            case "orderStatusChanged": return checkShouldShip(order);
            default: break;
        }
    }

    function checkShouldShip(order){
        if (order.status == 'ready for shipment')
            return $scope.ordersForShipping.push(order)
    }

    function shipNextOrder(){
        //Fake a random 5 - 10 second delay before sending an event back.
        $timeout(function(){

            //If there are any orders left for shipping, ship one!
            if ($scope.ordersForShipping.length) {

                //Get next order
                var order = $scope.ordersForShipping.shift();

                $wamp.publish('com.' + $scope.topic + '.orders', ['orderShipped', order]);
                console.log('Order #' + order.id + ' shipped..');
            }

            //Ship next order in 5~10 secs
            shipNextOrder();
        },(Math.random()*5000) + 5000);
    }

    $scope.connect = function() {
        //Subscribe to the broker topic
        $scope.topic = $scope.topicField;
        $wamp.subscribe('com.'+$scope.topic+'.orders', eventHandler);

        // Start shipping orders at random times
        shipNextOrder();

        $wamp.open();
    };

    $scope.$on("$wamp.open", function (event, session) {
        $scope.connected = true;
    });

    $scope.$on("$wamp.close", function (event, data) {
        $scope.connected = false;
    });
});
