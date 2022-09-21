export interface AppSettingsState{
    backend?: string
    backendConfigs: any
    historyItemSize: number
    historyItem_alwaysShowInfo: boolean
}

export function createAppSettings(): AppSettingsState{
    return  {
        backend: 'automatic1111',
        backendConfigs: {automatic1111:{}},
        historyItemSize: 128,
        historyItem_alwaysShowInfo:true,
    }
}