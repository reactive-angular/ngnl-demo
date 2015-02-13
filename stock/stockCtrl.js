
app.controller("StockCtrl", function($scope, $wamp) {
    $scope.connected = false;

    $scope.stock = {
        Lolly: 0,
        Candybar: 0,
        Gumball: 0
    };

    $scope.eventLog = [];

    //Add a restock
    function restock(){
        $scope.stock = {
            Lolly: $scope.stock.Lolly + 10,
            Candybar: $scope.stock.Candybar + 10,
            Gumball: $scope.stock.Gumball + 5
        };
        $wamp.publish('com.'+$scope.topic+'.products', ['restockedProducts']);
    }


    $scope.topicField = "";

    //Receive handler
    function eventHandlerOrders(args) {
        //Fetch arguments
        var event = args[0];
        var order = args[1];

        console.log('Received order topic event: ' + event);

        switch(event){
            case "orderCreated": return reserveProducts(order);
            default: break;
        }
    }

    function eventHandlerProducts(args) {
        //Fetch arguments
        var event = args[0];

        console.log('Received product topic event: ' + event);

        switch(event){
            case "restockShipmentArrived": return restock();
            default: break;
        }
    }

    function reserveProducts(order){
        for (var productId in order.products) {
            //Is the product still in stock?
            var qty = order.products[productId].qty;
            if ($scope.stock[productId]) {
                if ($scope.stock[productId] - qty >= 0) {

                    //We have enough, reduce stock, and announce that we reserved their order
                    $scope.stock[productId] -= qty;

                    $scope.eventLog.unshift('order #:' + order.id + ' Reserved ' + qty + 'x ' + productId);

                    //Emit that we reserved this product for this order
                    $wamp.publish('com.'+$scope.topic+'.products', ['productReserved',order.id,productId]);
                }else{
                    $scope.eventLog.unshift('order #:' + order.id + ' tried to reserve ' + qty + 'x ' + productId + ' but we are out of stock..');
                }
            }else{
                $scope.eventLog.unshift('order #:' + order.id + ' tried to reserve ' + qty + 'x ' + productId + ' but we are out of stock..');
            }
        }
    }

    $scope.connect = function() {

        //Subscribe to the broker topics we are interested in
        $scope.topic = $scope.topicField;
        $wamp.subscribe('com.'+$scope.topic+'.orders', eventHandlerOrders);
        $wamp.subscribe('com.'+$scope.topic+'.products', eventHandlerProducts);

        $wamp.open();
    };

    $scope.$on("$wamp.open", function (event, session) {
        $scope.connected = true;
    });

    $scope.$on("$wamp.close", function (event, data) {
        $scope.connected = false;
    });
});
