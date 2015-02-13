
app.controller("OrderCtrl", function($scope, $wamp, $timeout, OrderService) {
    $scope.connected = false;
    $scope.topicField = "";

    //Log all events
    $scope.eventLog = [];

    //Receive handler order topic
    function eventHandlerOrder(args) {
        //Fetch arguments
        var event = args[0];
        var order = args[1];

        console.log('Received event order topic: ' + event);

        $scope.eventLog.unshift('Received event:' + event);

        switch(event){
            case "orderRequested": return createOrder(order);
            case "orderShipped": return setShipped(order.id);
            default: break;
        }
    }

    //Receive handler product topic
    function eventHandlerProduct(args) {
        //Fetch arguments
        var event = args[0];

        console.log('Received event product topic: ' + event);

        $scope.eventLog.unshift('Received event:' + event);

        switch(event){
            case "productReserved": return setReserved(args[1],args[2]);
            case "restockedProducts": return setRestocked();
            default: break;
        }
    }

    function setRestocked(){
        //TODO: Implement a function to retry product reservation for unfinished orders
        allOrders = OrderService.getAll();

    }

    //Set product status to reserved
    function setReserved(orderId,productName){
        var order = OrderService.getOrder(orderId);
        if (order) {

            //Reserve the product
            if (order.products[productName]) {
                order.products[productName].reserved = true;
            }

            //Check if all products are reserved, and change status to ready if so!
            if (OrderService.getOrderReady(order)){
                //Ready for shipping, change status!
                order.status = 'ready for shipment';
                //Publish the status change
                $scope.eventLog.unshift('Set order status to ready for shipment (Order #' + order.id + ')');
                $wamp.publish('com.'+$scope.topic+'.orders', ['orderStatusChanged', order]);
            }

            OrderService.updateOrder(order);
        }
    }

    //Set order status to shipped
    function setShipped(orderId){
        //Change status
        var order = OrderService.getOrder(orderId);
        order.status = 'shipped';
        OrderService.updateOrder(order);

        //Publish the status change
        $scope.eventLog.unshift('Set order status to shipped (Order #' + order.id + ')');
        $wamp.publish('com.'+$scope.topic+'.orders', ['orderStatusChanged', order]);
    }

    function createOrder(order){
        var addedOrder = OrderService.addOrder(order);
        addedOrder.status = 'processing';

        //Fake a random 0 - 3 second delay before sending an event back.
        $timeout(function(){
            addedOrder = addedOrder;
            $wamp.publish('com.'+$scope.topic+'.orders', ['orderCreated', addedOrder]);

            $scope.eventLog.unshift('Published: orderCreated (order #' + order.id + ")");
        },Math.random()*3000);
    }

    $scope.$watch(OrderService.getAll(),function(){
        $scope.orders = OrderService.getAll();
    });

    $scope.connect = function() {
        //Subscribe to the broker topic
        $scope.topic = $scope.topicField;
        $wamp.subscribe('com.'+$scope.topic+'.orders', eventHandlerOrder);
        $wamp.subscribe('com.'+$scope.topic+'.products', eventHandlerProduct);
        $wamp.open();
    };

    $scope.$on("$wamp.open", function (event, session) {
        $scope.connected = true;
    });

    $scope.$on("$wamp.close", function (event, data) {
        $scope.connected = false;
    });
});
