import { isObservable } from "mobx";
import Context from "sap/ui/model/Context";
import PropertyBinding from "sap/ui/model/PropertyBinding";
import MobxPropertyBinding from "./mobxPropertyBinding";
import Filter from "sap/ui/model/Filter";
import ListBinding from "sap/ui/model/ListBinding";
import Sorter from "sap/ui/model/Sorter";
import MobxListBinding from "./mobxListBinding";
import Model from "sap/ui/model/Model";
import MobxContext from "./mobxContext";

function isNil(value: unknown): boolean {
    return value === null;
}

export default class MobxModel<T> extends Model {
    protected _observable: T;
    private mContexts: Map<string,Context>;

    constructor(observable: T) {
        if (!isObservable(observable)) {
            throw new TypeError("The given constructor argument is not a mobx observable.");
        }
        super();
        this._observable = observable;
        this.mContexts = new Map();
    }

    destroy(): void {
        super.destroy();
        this.mContexts = new Map();
    }

    getObservable(): T {
        return this._observable;
    }

    setObservable(observable: T) {
        this._observable = observable;
    }

    getData(): T {
        return this.getObservable();
    }

    setData(observable: T) {
        this.setObservable(observable);
    }

    bindProperty(sPath: string, oContext?: Context | undefined, mParameters?: object | undefined): PropertyBinding {
        return new MobxPropertyBinding(this, sPath, oContext, mParameters);
    }

    bindList(sPath: string, oContext?: Context | undefined, aSorters?: Sorter | Sorter[] | undefined, aFilters?: Filter | Filter[] | undefined, mParameters?: object | undefined): ListBinding {
        return new MobxListBinding(this, sPath, <Context>oContext, aSorters, aFilters, mParameters);
    }

    resolve(sPath: string, oContext?: Context | undefined) {
        var bIsRelative = !sPath.startsWith("/"), sResolvedPath = sPath, sContextPath;
        if (bIsRelative) {
            if (oContext) {
                sContextPath = oContext.getPath();
                sResolvedPath = sContextPath + (sContextPath.endsWith("/") ? "" : "/") + sPath;
            } else {
                sResolvedPath = "";
                /** @deprecated As of version 1.88.0 */
                if (this.isLegacySyntax()) {
                    sResolvedPath = "/" + sPath;
                }
            }
        }
        if (!sPath && oContext) {
            sResolvedPath = oContext.getPath();
        }
        // invariant: path never ends with a slash ... if root is requested we return /
        if (sResolvedPath && sResolvedPath !== "/" && sResolvedPath.endsWith("/")) {
            sResolvedPath = sResolvedPath.substring(0, sResolvedPath.length - 1);
        }
    
        return sResolvedPath;
    }

    getContext(sPath: string){
        if(!sPath.startsWith("/")){
            throw new Error("Path " + sPath + " must start with a / ");
        }
        var oContext = this.mContexts.get(sPath);
        if (!oContext) {
			oContext = new MobxContext(this, sPath);
			this.mContexts.set(sPath,oContext);
		}
		return oContext;
    }

    setProperty(sPath: string, vValue: unknown, oContext?: Context | undefined): boolean {
        var resolvedPath = this.resolve(sPath, oContext);

        // return if path / context is invalid
        if (!resolvedPath) {
            return false;
        }
        // If data is set on root, call setData instead
        if (resolvedPath === "/") {
            throw new Error('invariant: setting a new root object (observable) "/" after constructing the model is not yet supported in MobxModel');
            // this.setData(value);
            // return true;
        }

        var iLastSlash = resolvedPath.lastIndexOf("/");
        var property = resolvedPath.substring(iLastSlash + 1);

        var node = iLastSlash === 0 ? this._observable : this._getNode(resolvedPath.substring(0, iLastSlash), oContext);
        if (node) {
            (node as { [key: string]: unknown })[property] = vValue;
            return true;
        }
        return false;

    }

    getProperty(sPath: string, oContext?: Context) {
        return this._getNode(sPath,oContext);
    }

    protected _getNode(sPath: string, oContext?: Context | undefined){
        var resolvedPath = this.resolve(sPath, oContext);
        if (isNil(resolvedPath)) {
            return null;
        }

        var parts = resolvedPath.substring(1).split("/");

        var currentNode = this._observable;

        var partsLength = parts.length;

        for (var i = 0; i < partsLength && !isNil(currentNode); i++) {
            currentNode = (currentNode as { [key: string]: T })[parts[i]];
        }

        return currentNode;
    }

}