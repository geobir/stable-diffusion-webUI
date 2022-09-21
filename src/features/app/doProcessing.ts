import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {isX2Img} from "@features/app/genSettings";
import {BackendFunction, ProcessingRequest, randomSeed} from "@features/processing";
import {samplers} from "@features/settingsEditor/SamplerEditor";
import {automatic1111Config, sendToAutomatic1111} from "@features/processing/backend_automatic1111";
// import {sendToSdWebui} from "@features/processing/backend_sd-webui";
import {HistoryItem} from "@features/app/appState";
import {setupStoredProcessing} from "@features/images";

const getCurrentConfig = (backend: string) => () => useTheStore.getState().backendConfigs[backend] || {}

const backends: any = {}


export const toRequest: Record<string, (item: HistoryItem) => Promise<ProcessingRequest>> = {}

function setupBackend(key: string, backend: BackendFunction) {
    backends[key] = setupStoredProcessing(backend, getCurrentConfig(key), async () => {
        let { history, historyItems, images } = useTheStore.getState()
        let found = history.find(h => {
            const item = historyItems[h]
            let prevReady = true
            if(isX2Img(item) && item.image){
                prevReady = images[item.image].status === 'complete';
            }
            return prevReady && !images[h];
        });
        if(found){
            const foundItem = historyItems[found]
            const request = await toRequest[foundItem.type](foundItem)
            return {id: found, request}
        }
        return undefined
    })
}

 setupBackend('automatic1111', sendToAutomatic1111)
 // setupBackend('sd-webui', sendToSdWebui)

export const doProcessing = function () {
    const { backend, backendConfigs } = useTheStore.getState()
    const current = backends[backend || '']
    if (current) {
        current()
    }
}

export function stopProgress() {
    updateTheStore(s => {
        s.history = s.history.filter(h => {
            let status = s.images[h]?.status;
            return status==='complete' ||status === 'failed'
        })
    })
}

export function clearFailed() {
    updateTheStore(s => {
        s.history = s.history.filter(h => {
            let status = s.images[h]?.status;
            return status !== 'failed'
        })
    })
}

export const enqueueRandom = async () => {
    const rng = {
        cfg: true,
        sampler: true,
        steps: false,
    }
    const adjustment: any = {}
    if (rng.cfg) {
        adjustment.cfg = Math.round((Math.random() * 14 + 1) * 10) / 10
    }
    if (rng.sampler) {
        adjustment.sampler = samplers[Math.floor(Math.random() * samplers.length)]
    }
    return await enqueue(true, adjustment)
}

export const enqueue = async (newSeed?: boolean, adjustment?: any) => {
    updateTheStore(s => {
        for (const id of s.nextItems.ordered) {
            const newId = "" + Math.random()
            let current = s.nextItems.byId[id];

            let item: HistoryItem = { ...current, ...adjustment }

            if (isX2Img(item)) {
                if(s.useOutput && !item.isNew){
                    item.image = id
                }

                item.seed = (newSeed ? undefined : item.seed) || randomSeed()
                item.isNew = false

            }

            s.historyItems[newId] = item
            s.history.push(newId)
        }

    })
    await doProcessing()
}