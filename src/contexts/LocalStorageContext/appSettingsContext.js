import React, {useContext, useEffect, useState} from "react";
import useLocalStorage from "../../tools/useLocalStorage";

const AppSettingsContext = React.createContext()

export function useAppSettings() {
    return useContext(AppSettingsContext)
}

export function AppSettingsProvider({children}) {
    const [appSettings, setAppSettings] = useLocalStorage("AppSettings",
        {
            username: "Max Mustermann",
            theme: "bright",
            showPastTime: 40
        }
    )

    const [machineSettings, setMachineSettings] = useLocalStorage("MachineSettings",
    {
        liveDataTolerance: 2000
    })

    const [sensorSettings, setSensorSettings] = useState (
        {
            time: {sensorName: "Time", unit: "s", commaPrecision: 0 },
            temperature: {sensorName: "Temperature", unit: "°C", commaPrecision: 0, yValueMax: 110, yValueMin:40, lineStyle: {
                lineColor: '#d44545', lineWidth: 2, lineDash: [5,5], lineJoints: 'round', circleRadius: 4
            }},
            pressure: {sensorName: "Pressure", unit: "bar", commaPrecision: 1, yValueMax: 15, yValueMin:0, lineStyle: {
                lineColor: '#7da61b', lineWidth: 2, lineDash: [5,5], lineJoints: 'round', circleRadius: 4
            }},
            soak: {sensorName: "Soak", unit: "gm/s", commaPrecision: 2, yValueMax: 3, yValueMin:0, lineStyle: {
                lineColor: '#009cff', lineWidth: 2, lineDash: [5,5], lineJoints: 'round', circleRadius: 4
            }},
            flow: {sensorName: "Flow", unit: "gm/s", commaPrecision: 2, yValueMax: 3, yValueMin:0, lineStyle: {
                lineColor: '#e29000', lineWidth: 2, lineDash: [5,5], lineJoints: 'round', circleRadius: 4
            }},
            weight: {sensorName: "Weight", unit: "gm", commaPrecision: 1, yValueMax: 70, yValueMin:0, lineStyle: {
                lineColor: '#6f7687', lineWidth: 2, lineDash: [5,5], lineJoints: 'round', circleRadius: 4
            }},
            extractionrate: {sensorName: "Extraction Rate", unit: "gm/gm", commaPrecision: 1, yValueMax: 5, yValueMin:0, lineStyle: {
                lineColor: '#6f7687', lineWidth: 0, lineDash: [5,5], lineJoints: 'round', circleRadius: 0
            }}
        }
    )

    useEffect(()=>{
        if(appSettings.theme == "dark")
            document.body.classList.add("dark")
        else
        document.body.classList.remove("dark")
    },[appSettings])

    return (
        <AppSettingsContext.Provider value={[appSettings, setAppSettings, sensorSettings, machineSettings, setMachineSettings]}>
            {children}
        </AppSettingsContext.Provider>
    )
}