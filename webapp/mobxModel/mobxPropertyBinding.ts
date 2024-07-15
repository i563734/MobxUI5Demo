import Context from "sap/ui/model/Context";
import PropertyBinding from "sap/ui/model/PropertyBinding";
import MobxModel from "./mobxModel";
import { IReactionDisposer, reaction } from "mobx";
import ChangeReason from "sap/ui/model/ChangeReason";

export default class MobxPropertyBinding<T> extends PropertyBinding {
    protected _model: MobxModel<T>;
    protected _path: string;
    protected _context: Context | undefined;
    protected _params: object | undefined;
    protected _mobxDisposer: IReactionDisposer;

    constructor(oMobxModel: MobxModel<T>, sPath: string, oContext: Context | undefined, mParams: object | undefined) {
        super(oMobxModel, sPath, <Context> oContext, mParams);

        this._model = oMobxModel;
        this._path = sPath;
        this._context = oContext;
        this._params = mParams;

        this._mobxDisposer = reaction(
            this._model.getProperty.bind(this._model, sPath, oContext),
            this._fireChange.bind(this,{reason:ChangeReason.Change})
        );
    }

    _fireChange(oParameters:object) {
        this.fireEvent("change",oParameters);
    }

    destroy(): void {
        this._mobxDisposer();
        super.destroy();
    }


    getValue(): unknown {
        return this._model.getProperty(this._path, this._context);
    }

    setValue(vValue: unknown): void {
        this._model.setProperty(this._path, vValue, this._context);
    }    
}