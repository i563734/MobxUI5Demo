import MobxModel from "mobxui5demo/mobxModel/mobxModel";
import createOrderModel, { OrderModel } from "mobxui5demo/model/orderModel";
import Controller from "sap/ui/core/mvc/Controller";

/**
 * @namespace mobxui5demo.controller
 */
export default class Demo extends Controller {

    private model: MobxModel<OrderModel>;

    public onInit(): void {
        var model = new MobxModel(createOrderModel());
        this.model = model;
        this.getView()?.setModel(model);
    }

    onOrderAdd() {
        this.model.getObservable().addOrder();
    }

    onOrderRemove() {
        this.model.getObservable().removeLastOrder();
    }
}