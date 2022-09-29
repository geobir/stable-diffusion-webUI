import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {isX2Img, X2ImgSettings} from "@features/app/genSettings";
import {BackendFunction, ProcessingRequest, randomSeed} from "@features/processing";
import {samplers} from "@features/settingsEditor/SamplerEditor";
import {automatic1111Config, sendToAutomatic1111} from "@features/processing/backend_automatic1111";
// import {sendToSdWebui} from "@features/processing/backend_sd-webui";
import {HistoryItem} from "@features/app/appState";
import {setupStoredProcessing} from "@features/images";
import {Randomness} from "@features/app-settings/state";

const getCurrentConfig = (backend: string) => () => useTheStore.getState().backendConfigs[backend] || {}

const backends: any = {}


export const toRequest: Record<string, (item: HistoryItem) => Promise<ProcessingRequest>> = {}

function setupBackend(key: string, backend: BackendFunction) {
    backends[key] = setupStoredProcessing(backend, getCurrentConfig(key), async () => {
        const { history, historyItems, images } = useTheStore.getState()
        const found = history.find(h => {
            const item = historyItems[h]
            let prevReady = true
            if(isX2Img(item) && item.image){
                prevReady = images[item.image].status === 'complete';
            }
            return prevReady && !images[h];
        });
        if (found){
            const foundItem = historyItems[found];
            const request = await toRequest[foundItem.type](foundItem);
            return {id: found, request};
        }
        return undefined
    })
}

 setupBackend('automatic1111', sendToAutomatic1111)
 // setupBackend('sd-webui', sendToSdWebui)

export const doProcessing = () => {
    const { backend, backendConfigs } = useTheStore.getState();
    const current = backends[backend || ''];
    if (current) {
        current();
    }
};

export const stopProgress = () => {
    updateTheStore(s => {
        s.history = s.history.filter(h => {
            const status = s.images[h]?.status;
            return status==='complete' ||status === 'failed';
        });
    });
}

export const clearFailed = () => {
    updateTheStore(s => {
        s.history = s.history.filter(h => {
            const status = s.images[h]?.status;
            return status !== 'failed';
        });
    });
}

const evalRandomness = (random: Randomness) => {
    const steps = (random.to - random.from) / random.jump
    return random.from + Math.round(Math.random() *steps) *random.jump
}

export const enqueueRandom = async () => {
    const random = useTheStore.getState().genSettings.random;

    const adjustment: any = {};
    if (random.cfg.enabled) {
        adjustment.cfg = Number(evalRandomness(random.cfg).toFixed(2));
    }
    if (random.steps.enabled) {
        adjustment.steps = Math.round(evalRandomness(random.steps));
    }
    if (random.denoise.enabled) {
        adjustment.denoise = Number(evalRandomness(random.denoise).toFixed(2));
    }
    if (random.samplers.enabled) {
        const options = random.samplers.options;
        adjustment.sampler = options[Math.floor(Math.random() * options.length)];
    }
    return await enqueue(true, adjustment);
}

export const enqueue = async (newSeed?: boolean, adjustment?: any) => {
    updateTheStore(s => {
        for (const id of s.nextItems.ordered) {
            const newId = "" + Math.random();
            const current = s.nextItems.byId[id];

            const item: HistoryItem = { ...current, ...adjustment };

            if (isX2Img(item)) {
                if (s.useOutput && !item.isNew) {
                    item.image = id;
                }

                item.seed = (newSeed ? undefined : item.seed) || randomSeed();
                item.isNew = false;
                if (!item.image) {
                    item.denoise = (current as X2ImgSettings).denoise;
                }
            }

            s.historyItems[newId] = item;
            s.history.push(newId);
        }

    });
    await doProcessing();
};