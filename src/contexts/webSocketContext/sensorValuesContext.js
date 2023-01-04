import React, {useContext, useEffect, useState} from "react";
import { useMachineState } from "./machineStateContext";
import { useWebSocketConnection } from "./webSocketConnection";

const SensorValueContext = React.createContext()
const MaxDataRowLength = 3000

export function useSensorValue() {
    return useContext(SensorValueContext)
}

export function SensorValueProvider({children}) {

    const [subscribeToWSevent, sendMessage] = useWebSocketConnection()

    const [sensorValues, setSensorValues] = useState(
        [
            { id: "temperature", x: [], y: []},
            { id: "pressure", x: [], y: []},
            { id: "soak", x: [], y: []},
            { id: "flow", x: [], y: []},
            { id: "weight", x: [], y: []},
            { id: "extractionrate", x: [], y: []}
        ]
    )

    useEffect(()=>{
        subscribeToWSevent("SensorValue", addSensorValue)
    },[])

    function addSensorValue(dataFromWebsocket) {
        const sensorid = dataFromWebsocket.SensorId
        const time = dataFromWebsocket.time
        const value = dataFromWebsocket.value
        setSensorValues(prevSensorValues => (
            prevSensorValues.map(
                sensor => sensor.id == sensorid ?
                {
                    ...sensor,
                    x: [...sensor.x.slice(Math.max(sensor.x.length-MaxDataRowLength,0),sensor.x.length), time],
                    y: [...sensor.y.slice(Math.max(sensor.y.length-MaxDataRowLength,0),sensor.y.length), value]
                } : {...sensor}
            )
        ))
    }

    return (
        <SensorValueContext.Provider value={[sensorValues,setSensorValues,addSensorValue]}>
            {children}
        </SensorValueContext.Provider>
    )
}