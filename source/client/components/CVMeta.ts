/**
 * 3D Foundation Project
 * Copyright 2019 Smithsonian Institution
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import OrderedCollection, { ICollectionUpdateEvent } from "@ff/core/OrderedCollection";
import UnorderedCollection from "@ff/core/UnorderedCollection";
import Component from "@ff/graph/Component";

import { IDocument, INode, IScene } from "common/types/document";
import { IMeta, IImage, INote } from "common/types/meta";

import Article from "../models/Article";

////////////////////////////////////////////////////////////////////////////////

export type IArticlesUpdateEvent = ICollectionUpdateEvent<Article>;

export default class CVMeta extends Component
{
    static readonly typeName: string = "CVMeta";

    collection = new UnorderedCollection<any>();
    process = new UnorderedCollection<any>();
    images = new UnorderedCollection<IImage>();
    articles = new OrderedCollection<Article>();
    leadArticle: Article = null;
    notes: INote[] = [];

    fromDocument(document: IDocument, node: INode | IScene): number
    {
        if (!isFinite(node.meta)) {
            throw new Error("info property missing in node");
        }

        const data = document.metas[node.meta];

        if (data.collection) {
            this.collection.dictionary = data.collection;
        }
        if (data.process) {
            this.process.dictionary = data.process;
        }
        if (data.images) {
            const imageDict = {};
            data.images.forEach(image => imageDict[image.quality] = image);
            this.images.dictionary = imageDict;
        }
        if (data.articles) {
            this.articles.items = data.articles.map(article => Article.fromJSON(article));
            if (data.leadArticle !== undefined) {
                this.leadArticle = this.articles.getAt(data.leadArticle);
            }
        }

        return node.meta;
    }

    toDocument(document: IDocument, node: INode | IScene): number
    {
        let data: IMeta = null;

        if (this.collection.length > 0) {
            data = {
                collection: this.collection.dictionary,
            };
        }
        if (this.process.length > 0) {
            data = data || {};
            data.process = this.process.dictionary;
        }
        if (this.images.length > 0) {
            data = data || {};
            data.images = this.images.items;
        }
        if (this.articles.length > 0) {
            data = data || {};
            const articles = this.articles.items;
            data.articles = articles.map(article => article.toJSON());
            if (this.leadArticle) {
                data.leadArticle = articles.indexOf(this.leadArticle);
            }
        }

        if (data) {
            document.metas = document.metas || [];
            const metaIndex = document.metas.length;
            document.metas.push(data);
            return metaIndex;
        }
    }
}