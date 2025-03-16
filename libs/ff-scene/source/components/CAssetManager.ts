/**
 * FF Typescript Foundation Library
 * Copyright 2019 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import resolvePathname from "resolve-pathname";

import Component, { Node, ITypedEvent } from "@ff/graph/Component";
import WebDAVProvider, { IFileInfo } from "../assets/WebDAVProvider";
import { Dictionary } from "@ff/core/types";

////////////////////////////////////////////////////////////////////////////////

export { IFileInfo };

export interface IAssetEntry
{
    info: IFileInfo;
    expanded: boolean;
    children: IAssetEntry[];
}

export interface IAssetTreeChangeEvent extends ITypedEvent<"tree-change">
{
    root: IAssetEntry;
}

export interface IAssetOpenEvent extends ITypedEvent<"asset-open">
{
    asset: IAssetEntry;
}

export default class CAssetManager extends Component
{
    static readonly typeName: string = "CAssetManager";
    static readonly isGraphSingleton = true;

    private _provider: WebDAVProvider = null;
    private _assetsByPath: Dictionary<IAssetEntry> = {};
    private _rootAsset: IAssetEntry = null;
    private _selection = new Set<IAssetEntry>();

    constructor(node: Node, id: string)
    {
        super(node, id);
        this._provider = new WebDAVProvider();
    }

    get root() {
        return this._rootAsset;
    }
    set root(asset: IAssetEntry) {
        this._rootAsset = asset;
    }
    get rootPath() {
        return this._provider.rootPath;
    }
    get rootUrl() {
        return this._provider.rootUrl;
    }
    set rootUrl(url: string) {
        this._provider.rootUrl = url;
        this.refresh().then(() => this.rootUrlChanged());
    }

    get selectedAssets() {
        return Array.from(this._selection.values());
    }

    uploadFiles(files: FileList, folder: IAssetEntry): Promise<any>
    {
        const fileArray = Array.from(files);
        const uploads = fileArray.map(file => {
            const url = resolvePathname(folder.info.path + file.name, this.rootUrl);
            const params: RequestInit = { method: "PUT", credentials: "include", body: file };
            return fetch(url, params);
        });

        return Promise.all(uploads).then(() => this.refresh());
    }

    createFolder(parentFolder: IAssetEntry, folderName: string)
    {
        return this._provider.create(parentFolder.info, folderName).then(() => this.refresh());
    }

    rename(asset: IAssetEntry, name: string): Promise<void>
    {
        return this._provider.rename(asset.info, name).then(() => this.refresh());
    }

    exists(asset: IAssetEntry | string): Promise<boolean>
    {
        return this._provider.exists(typeof asset === "object" ? asset.info : asset);
    }

    open(asset: IAssetEntry)
    {
        this.emit<IAssetOpenEvent>({ type: "asset-open", asset });
    }

    delete(asset: IAssetEntry)
    {
        return this._provider.delete(asset.info).then(() => this.refresh());
    }

    deleteSelected()
    {
        const selected = Array.from(this._selection.values());
        const operations = selected.map(asset => this._provider.delete(asset.info));

        return Promise.all(operations).then(() => this.refresh());
    }

    moveSelected(destinationFolder: IAssetEntry)
    {
        const selected = Array.from(this._selection.values());
        const operations = selected.map(asset =>
            this._provider.move(asset.info, destinationFolder.info.path + asset.info.name));

        return Promise.all(operations).then(() => this.refresh());
    }

    select(asset: IAssetEntry, toggle: boolean)
    {
        const selection = this._selection;

        if (toggle && selection.has(asset)) {
            selection.delete(asset);
        }
        else {
            if (!toggle) {
                selection.clear();
            }
            if (asset) {
                selection.add(asset);
            }
        }

        this.emit<IAssetTreeChangeEvent>({ type: "tree-change", root: this._rootAsset });
    }

    isSelected(asset: IAssetEntry)
    {
        return this._selection.has(asset);
    }

    getAssetURL(uri: string)
    {
        return resolvePathname(uri, this.rootUrl);
    }

    getAssetByPath(path: string)
    {   
        //console.log("assetManager._assetsByPath", this._assetsByPath);
        return this._assetsByPath[path];
    }

    refresh(): Promise<void>
    {
        return this._provider.get(".", true)
            .then(infos => {
                console.log('assetManager.refresh: INFOS', infos);
                this._rootAsset = this.createAssetTree(infos);
                console.log('assetManager.refresh: ROOT ASSET', this._rootAsset);
                this.emit<IAssetTreeChangeEvent>({ type: "tree-change", root: this._rootAsset });
            });
    }

    protected rootUrlChanged(): Promise<any>
    {
        return Promise.resolve();
    }

    protected createAssetTree(infos: IFileInfo[]): IAssetEntry
    {
        infos.sort((a, b) => a.url < b.url ? -1 : (a.url > b.url ? 1 : 0));

        const root: IAssetEntry = {
            info: infos[0],
            expanded: true,
            children: []
        };

        for (let i = 1, ni = infos.length; i < ni; ++i) {
            const info = infos[i];
            //console.log('assetManager.createAssetTree: INFO', info);
            const parts = info.path.split("/").filter(part => !!part);
            //console.log('assetManager.createAssetTree: PARTS', parts);
            let entry = root;
            //console.log('assetManager.createAssetTree: ENTRY', entry);
            for (let j = 0, nj = parts.length; j < nj; ++j) {
                const part = parts[j];
                //console.log('assetManager.createAssetTree: PART', part);
                if (j < nj - 1) {
                  //console.log('assetManager.createAssetTree: ENTRY', entry);
                    entry = entry.children.find(child => { 
                      //console.log('assetManager.createAssetTree: CHILD', child, part);
                      return child.info.name === part
                    });
                    //console.log('assetManager.createAssetTree: ENTRY CORRECTED', entry);
                    if (!entry) {
                        break;
                    }
                }
                else {
                    const asset: IAssetEntry = {
                        info,
                        expanded: true,
                        children: []
                    };

                    this._assetsByPath[decodeURI(info.path)] = asset;
                    entry.children.push(asset);
                }
            }
        }

        return root;
    }
}