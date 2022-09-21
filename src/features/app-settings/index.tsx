import {
    Button,
    Divider,
    Input,
    Link,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Tab,
    Text,
    Heading,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper, NumberDecrementStepper, NumberInput, Switch, Box
} from "@chakra-ui/react";

import {automatic1111Config} from '@features/processing/backend_automatic1111'
// import {sd_webui_config} from '@features/processing/backend_sd-webui'
import {useState} from "react";
import {updateTheStore, useTheStore} from "@features/app/mainStore";
import {samplers} from "@features/settingsEditor/SamplerEditor";
import {TbFileTypography} from "react-icons/all";

interface BackendConfigItem {
    type: string
    key: string
    label: string
    fallback: string
}

interface BackendInfo {
    name: string
    key: string
    link: string
    revision: string
    config: BackendConfigItem[]
    negativePrompt?: boolean,
    tiling?: boolean,
    weightedPrompts?: boolean
}

const availableBackends: BackendInfo[] = [
    {
        name: "AUTOMATIC1111",
        key: 'automatic1111',
        link: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
        revision: '2022-09-21, revision: 5a1951f',
        config: automatic1111Config,
        negativePrompt: true,
        tiling: true
    },
    // {
    //     name: "sd-webui",
    //     key: 'sd-webui',
    //     link: 'https://github.com/sd-webui/stable-diffusion-webui',
    //     config: sd_webui_config,
    //     weightedPrompts: true
    // }
]

export function AppSettingsModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const currentBackend = useTheStore(s => s.backend)
    const historyItemSize = useTheStore(s => s.historyItemSize)
    const historyItem_alwaysShowInfo = useTheStore(s => s.historyItem_alwaysShowInfo)
    const currentSettings = useTheStore(s => s.backendConfigs[s.backend || ''] || {})
    const currentBackendInfo = availableBackends.find(be => be.key === currentBackend)
    return <Modal isOpen={isOpen} onClose={onClose} size={'3xl'}>
        <ModalOverlay/>
        <ModalContent>
            <ModalHeader>Settings</ModalHeader>
            <ModalCloseButton/>
            <ModalBody>
                {/*backend: {currentBackend}*/}
                <Tabs>
                    <TabList>
                        <Tab>Backend</Tab>
                        <Tab>Random</Tab>
                        <Tab>Settings</Tab>
                        <Tab>History</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <Select
                                value={currentBackend}
                                onChange={(e) => updateTheStore(s => {
                                    s.backend = e.target.value
                                })}
                            >
                                {!currentBackendInfo && <option value={undefined}>-- Pick a backend --</option>}
                                {availableBackends.map((be) => (
                                    <option key={be.key} value={be.key}>
                                        {be.name}
                                    </option>
                                ))}
                            </Select>
                            <Divider my={3}/>
                            {currentBackendInfo && <>
                                <Heading size={"sm"}>Info</Heading> <Link color={"#9292fc"}
                                                                          href={currentBackendInfo.link}
                                                                          target={"_blank"}>{currentBackendInfo.link}</Link>
                              <Box><i>Tested against: {currentBackendInfo.revision}</i></Box>
                                <Heading size={"sm"} mt={4}>Settings</Heading>
                                {currentBackendInfo.config.map(c => <div key={c.key}>
                                    {c.label}
                                    {c.type === 'string' && <Input
                                        placeholder={c.fallback}
                                        value={currentSettings[c.key] || ''}
                                        onChange={(e) => updateTheStore(s => {
                                            s.backendConfigs[s.backend!!] = {
                                                ...currentSettings,
                                                [c.key]: e.target.value
                                            }
                                        })}
                                    />}
                                </div>)}
                            </>}


                        </TabPanel>
                        <TabPanel>
                            <p>Tbd: configure the range of what random values are selected</p>
                        </TabPanel>
                        <TabPanel>
                            <p>Tbd: configure what buttons are available for each setting</p>
                        </TabPanel>
                        <TabPanel>
                            Item Size

                            <NumberInput
                                value={historyItemSize}
                                onChange={(e) => {
                                    updateTheStore(s => {
                                        s.historyItemSize = Number(e)
                                    })                                }}
                                min={16}
                                step={16}
                                allowMouseWheel
                            >
                                <NumberInputField/>
                                <NumberInputStepper>
                                    <NumberIncrementStepper/>
                                    <NumberDecrementStepper/>
                                </NumberInputStepper>
                            </NumberInput>
                            {/*<Box>Always Show Info</Box>*/}
                            {/*<Switch isChecked={historyItem_alwaysShowInfo}*/}
                            {/*         onChange={()=>updateTheStore(s=>{s.historyItem_alwaysShowInfo=!s.historyItem_alwaysShowInfo})}/>*/}

                            <Box>
                            <Button mt={4} onClick={() => updateTheStore(s => {
                                s.history = [];
                               s.historyItems = {}
                            })}>Clear</Button>
                            </Box>
                        </TabPanel>
                    </TabPanels>
                </Tabs>

            </ModalBody>
        </ModalContent>
    </Modal>
}