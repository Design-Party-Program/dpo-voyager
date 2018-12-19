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

import LogController from "../controllers/LogController";
import CustomElement, { customElement, property } from "@ff/ui/CustomElement";

////////////////////////////////////////////////////////////////////////////////

@customElement("sv-log-panel")
export default class LogPanel extends CustomElement
{
    @property({ attribute: false })
    controller: LogController;

    constructor(controller?: LogController)
    {
        super();
        this.controller = controller;
    }

    protected firstConnected()
    {
        this.classList.add("sv-scrollable", "sv-panel", "sv-log-panel");
    }
}