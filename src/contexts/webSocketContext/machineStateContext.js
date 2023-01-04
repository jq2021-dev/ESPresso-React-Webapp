import React, {useContext, useEffect, useRef, useState} from "react";
import { useWebSocketConnection } from "./webSocketConnection";

const MachineStateContext = React.createContext()

export function useMachineState() {
    return useContext(MachineStateContext)
}

export function MachineStateProvider({children}) {
    const [machineState, setMachineState] = useState(
        {
            state: "NoConnection", //Heating, Ready, Extraction, Standby, NoConnection, TooHot
            extractionStartTime: undefined,
            currentExtractionPhase: -1,
            extractionPhaseFinishedTimes: undefined,
            savedGrindWeight: 14.2 // tbd
        }
    )
    const prevMachineState = useRef(machineState)
    useEffect(() => {
        prevMachineState.current = machineState
    },[machineState])

    const [subscribeToWSevent, sendMessage] = useWebSocketConnection()

    useEffect(()=>{
        subscribeToWSevent("MachineState", setMachineStateFromWebsocket)
        subscribeToWSevent("ExtractionStartTime", setExtractionStartTimeFromWebsocket)
        subscribeToWSevent("ExtractionPhase", setExtractionPhase)
        subscribeToWSevent("OnConnect", OnConnect)
        subscribeToWSevent("OnDisconnect", onDisconnect)
    },[])

    function setExtractionPhase(dataFromWebsocket) {
        setMachineState(prevState => ({...prevState, currentExtractionPhase: dataFromWebsocket.value}))
    }


    function OnConnect() {
        sendMessage("get", "machineState", "", setMachineStateFromWebsocket, false, true)
        sendMessage("get", "lastExtractionStartTime", "", setExtractionStartTimeFromWebsocket, false, true)
    }

    function onDisconnect() {
        setMachineState(prevState => ({...prevState, state: "NoConnection"}))
    }

    function setMachineStateFromWebsocket(dataFromWebsocket) {
        switch(dataFromWebsocket.value) {
            case "BOOT":
                setMachineState(prevState => ({...prevState, state: "Boot"}))
                break;
            case "READY":
                setMachineState(prevState => ({...prevState, state: "Ready"}))
                break;
            case "HEATING":
                setMachineState(prevState => ({...prevState, state: "Heating"}))
                break;
            case "TOOHOT":
                setMachineState(prevState => ({...prevState, state: "TooHot"}))
                break;
            case "EXTRACTION":
                setMachineState(prevState => ({...prevState, state: "Extraction"}))
                break;
            case "STANDBY":
                setMachineState(prevState => ({...prevState, state: "Standby"}))
                break;
        }
    }

    function setExtractionStartTimeFromWebsocket(dataFromWebsocket) {
        setMachineState(prevState => ({...prevState, extractionStartTime: dataFromWebsocket.time}))
    }

    return (
        <MachineStateContext.Provider value={[machineState,setMachineState, prevMachineState]}>
            {children}
        </MachineStateContext.Provider>
    )
}