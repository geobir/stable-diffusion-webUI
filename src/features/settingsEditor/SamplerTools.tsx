import {Button} from "@chakra-ui/react";
import {ValueEditorProps} from "@features/settingsEditor/MultiEditor";
import {samplers} from "@features/settingsEditor/SamplerEditor";
import {enqueue} from "@features/app/doProcessing";

const options = ['All', 'Pick']
export function SamplerTools({ value, set_value}: ValueEditorProps<string>) {
    function all(){
        for (const samplingMethod of samplers) {
            enqueue(false, {sampler: samplingMethod})
        }
    }
    return <><Button ml={2} onClick={all} >All</Button></>
}