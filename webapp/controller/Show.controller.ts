import MobxModel from "mobxui5demo/mobxModel/mobxModel";
import createShowModel, { ShowModel } from "mobxui5demo/model/showModel";
import Controller from "sap/ui/core/mvc/Controller";

/**
 * @namespace mobxui5demo.controller
 */
export default class Show extends Controller {

    private model: MobxModel<ShowModel>;

    public onInit(): void | undefined {
        var model = new MobxModel(createShowModel());
        this.model = model;
        this.getView()?.setModel(model);
    }

    onSearchShows(){
        this.model.getObservable().search();
    }
}