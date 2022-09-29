import {extendTheme, ThemeConfig} from "@chakra-ui/react";

const config :ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,

}

const theme = extendTheme({
    config,
    colors: {
        pagebg : "#2a2b3c",
        itembg : "rgb(255,255,255,0.05)",
        headerBGColor : "#5e8392",
        contentBGColor : "#32384b",
        selectionborder : "rgba(255,225,255,1)"
    }
})
export default theme
