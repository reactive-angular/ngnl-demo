
//Orderservice mocks a database containing orders.

app.factory('OrderService', [function() {
    var orderService = {};
    var orders = [];

    orderService.getAll = function(){
       return orders;
    };

    //Check if order is ready for shipping, all products must have been reserved!
    orderService.getOrderReady = function (order){
        var ready = true;
        for (var productId in order.products) {
            if (order.products[productId].reserved != true) ready = false;
        }
        return ready;
    };

    //Add new order, returning the newly assigned ID
    orderService.addOrder = function(order){
        var i = 0;
        while (true){
            //Go on until we find a free spot to add a new order.
            if (orders[i] == undefined){
                order.id = i;
                orders[i] = order;
                return order;
            }
            i++;
        }
    };

    //Find order by id
    orderService.getOrder = function(id){
        for (var i = 0; i < orders.length; i ++){
            if (orders[i].id == id){
                return orders[i];
            }
        }
    };

    //Update order by id
    orderService.updateOrder = function(order){
        for (var i = 0; i < orders.length; i ++){
            if (orders[i].id == order.id){
                orders[i] = order;
            }
        }
    };

    //Delete order by id
    orderService.deleteOrder = function(id){
        for (var i = 0; i < orders.length; i ++){
            if (orders[i].id == id){
                orders[i] = undefined;
            }
        }
    };

    return orderService;
}]);
