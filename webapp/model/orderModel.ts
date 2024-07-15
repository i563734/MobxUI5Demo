import { observable } from "mobx";

interface OrderContent {
    productName: string,
    quantity: number

}

interface Order extends OrderContent {
    id: number
}

export interface OrderModel {
    newOrder: OrderContent,
    orders: Order[],
    get summary():OrderContent[],
    get total(): number,
    get headerText(): string,
    addOrder(): void,
    removeLastOrder(): void   
}

export default function createOrderModel() {
    var orderId = 0;
    var orders: Order[] = [];
    var state: OrderModel = {
        newOrder: {
            productName: "My Product",
            quantity: 1
        },
        orders,
        get summary() {
            var summaryMap:{[key:string]:number} = {};
            this.orders.forEach(function(order){
                var productName = order.productName;
                if (typeof summaryMap[productName] === "number") {
                  summaryMap[productName] += order.quantity;
                } else {
                  summaryMap[productName] = order.quantity;
                }
              });
              var summaryList = Object.keys(summaryMap).map(function(productName) {
                return {productName: productName, quantity: summaryMap[productName]};
              });
              return summaryList;
        },
        get total() {
            return this.orders.reduce((accumulator:number, order: OrderContent)=>{ 
                return accumulator + order.quantity; }, 
            0);
        },
        get headerText() {
            var orderCount = this.orders.length;
            if (orderCount === 0) {
                return "There are no orders";
            } else if (orderCount === 1) {
                return "There is 1 order";
            } else {
                return "There are " + orderCount + " orders";
            }
        },
        addOrder: function () {
            this.orders.push({ id: ++orderId, productName: this.newOrder.productName, quantity: this.newOrder.quantity });
        },
        removeLastOrder: function () {
            this.orders.pop();
        }
    };
    var observableState = observable(state);

    return observableState;
}