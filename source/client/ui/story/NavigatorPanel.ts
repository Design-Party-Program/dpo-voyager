/**
 * 3D Foundation Project
 * Copyright 2018 Smithsonian Institution
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

import CRenderer, { IActiveSceneEvent } from "@ff/scene/components/CRenderer";
import SystemView, { customElement, html } from "@ff/scene/ui/SystemView";

import "./DocumentList";
import "./NodeTreeView";

import CVStoryController, { EStoryMode } from "../../components/CVStoryController";

////////////////////////////////////////////////////////////////////////////////

@customElement("sv-navigator-panel")
export default class NavigatorPanel extends SystemView
{
    protected get story() {
        return this.system.getMainComponent(CVStoryController);
    }
    protected get renderer() {
        return this.system.getMainComponent(CRenderer);
    }

    protected firstConnected()
    {
        this.classList.add("sv-panel", "sv-navigator-panel");
    }

    protected connected()
    {
        this.story.ins.mode.on("value", this.performUpdate, this);
        this.renderer.on<IActiveSceneEvent>("active-scene", this.performUpdate, this);
    }

    protected disconnected()
    {
        this.story.ins.mode.off("value", this.performUpdate, this);
        this.renderer.off<IActiveSceneEvent>("active-scene", this.performUpdate, this);
    }

    protected render()
    {
        const system = this.system;
        const authMode = true; // this.story.ins.mode.value === EStoryMode.Authoring;

        const documentList = authMode ? html`<div class="ff-splitter-section ff-flex-column" style="flex-basis: 30%">
            <div class="sv-panel-header">Documents</div>
                <div class="ff-flex-item-stretch"><div class="ff-scroll-y">
                    <sv-document-list .system=${system}></sv-document-list>
                </div></div>
            </div>
            <ff-splitter direction="vertical"></ff-splitter>` : null;

        return html`${documentList}
            <div class="ff-splitter-section ff-flex-column" style="flex-basis: 70%">
                <div class="sv-panel-header">Nodes</div>
                <div class="ff-flex-item-stretch"><div class="ff-scroll-y">
                    <sv-node-tree-view .system=${system}></sv-node-tree-view>
                </div></div>
            </div>`;
    }
}