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

import CObject3D, { types } from "@ff/scene/components/CObject3D";

import { IViewer, EShaderMode, TShaderMode } from "common/types/scene";

import CVModel2 from "./CVModel2";

////////////////////////////////////////////////////////////////////////////////

export default class CVViewer extends CObject3D
{
    static readonly typeName: string = "CVViewer";

    protected static readonly ins = {
        shader: types.Enum("Renderer.Shader", EShaderMode),
        exposure: types.Number("Renderer.Exposure", 1),
        gamma: types.Number("Renderer.Gamma", 1),
    };

    ins = this.addInputs<CObject3D, typeof CVViewer.ins>(CVViewer.ins);


    update(context)
    {
        super.update(context);

        const ins = this.ins;

        if (ins.shader.changed) {
            const shader = ins.shader.getValidatedValue();
            this.getGraphComponents(CVModel2).forEach(model => model.ins.shader.setValue(shader));
        }

        return true;
    }

    preRender(context)
    {
        if (this.updated) {
            context.renderer.toneMappingExposure = this.ins.exposure.value;
        }
    }

    fromData(data: IViewer)
    {
        this.ins.copyValues({
            shader: EShaderMode[data.shader] || EShaderMode.Default,
            exposure: data.exposure !== undefined ? data.exposure : 1,
            gamma: data.gamma !== undefined ? data.gamma : 1,
        });
    }

    toData(): IViewer
    {
        const ins = this.ins;

        return {
            shader: EShaderMode[ins.shader.value] as TShaderMode,
            exposure: ins.exposure.value,
            gamma: ins.gamma.value
        };
    }
}