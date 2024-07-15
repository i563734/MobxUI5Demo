import ListBinding from "sap/ui/model/ListBinding";
import Context from "sap/ui/model/Context";
import Sorter from "sap/ui/model/Sorter";
import Filter from "sap/ui/model/Filter";
import { IReactionDisposer,  reaction } from "mobx";
import ChangeReason from "sap/ui/model/ChangeReason";
import MobxModel from "./mobxModel";

/**
 * @namespace mobxui5demo.mobxModel
 */

function isNil(value:unknown): boolean {
    return value === null || value === undefined;
}

export default class MobxListBinding<T> extends ListBinding {
    protected _model: MobxModel<T>;
    protected _path: string;
    protected _context: Context;
    protected _mobxDisposer: IReactionDisposer;
    protected _sorters: Sorter | Sorter[] | undefined;
    protected _filters: Filter | Filter[] | undefined;
    protected _params: object | undefined;

    constructor(oModel: MobxModel<T>, sPath: string, oContext: Context, aSorters?: Sorter[] | Sorter, aFilters?: Filter[] | Filter, mParams?: object) {
        super(oModel, sPath, oContext, aSorters, aFilters, mParams);

        this._model = oModel;
        this._path = sPath;
        this._context = oContext;
        this._sorters = aSorters;
        this._filters = aFilters;
        this._params = mParams;

        this._mobxDisposer = reaction(function () {
            var observableArr = <[]>oModel.getProperty(sPath, oContext);
            if (observableArr && typeof observableArr.slice === "function") {
                return observableArr.slice();
            }
            return [];
        },
            this._fireChange.bind(this, { reason: ChangeReason.Change })
        );

    }

    _fireChange(oParameters: object) {
        this.fireEvent("change", oParameters);
    }

    destroy(): void {
        this._mobxDisposer();
        return super.destroy();
    }

    protected _getObservableArray() {
        return <[]>this._model.getProperty(this._path, this._context) || [];
    }

    getLength() {
        return this._getObservableArray().length;
    }

    getContexts(iStartIndex?: number, iLength?: number): Context[] {
        var startIndex = (isNil(iStartIndex) ? 0 : iStartIndex);
        var arrLength = this._getObservableArray().length;
        var sizeLimit = !iLength ? 100 : iLength;

        var validContextCount = Math.min(arrLength - startIndex!,sizeLimit); 
        if(validContextCount < 1){
            return [];
        }
        var exclusiveEndIndex = startIndex! + validContextCount;
        var effectiveArrPath = this._model.resolve(this._path, this._context);
        if(!(effectiveArrPath.endsWith("/"))){
            effectiveArrPath = effectiveArrPath + "/";
        }
        var contexts = [];
        for(var i = startIndex!; i < exclusiveEndIndex; i++){
            contexts.push(this._model.getContext(effectiveArrPath + i));
        }
        return contexts;
    }
}