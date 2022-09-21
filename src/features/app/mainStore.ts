import create from "zustand";
import {AppState, createAppState} from "@features/app/appState";
import {devtools, persist} from "zustand/middleware";
import {produce} from "immer";
import {createImagesState, ImagesState} from "@features/images/state";
import {AppSettingsState, createAppSettings} from "@features/app-settings/state";
import {doProcessing} from "@features/app/doProcessing";

export type FullState = AppState & ImagesState & AppSettingsState

export const useTheStore = create<FullState>()(
    devtools(
        persist(() => ({
                ...createAppState(),
                ...createImagesState(),
                ...createAppSettings(),
            }), {
                name: 'stored',
                partialize: state => (state),
                merge: (s, current)=>{
                    // debugger
                    if(s){
                        const s2 = s as FullState
                        for (const id of s2.history) {
                            let status = s2.images[id]?.status;
                            if(status !='complete' &&  status !='failed'){
                                delete s2.images[id]
                            }
                        }
                        setTimeout(doProcessing,1)
                        // debugger
                        return s2
                    }
                    return current

                },
            }
        )
    )
)

export function updateTheStore(setter: (s: FullState) => void) {
    useTheStore.setState(realState => produce(realState, (immerState)=>{setter(immerState)}))
}
