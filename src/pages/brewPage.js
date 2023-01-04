import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/navbar/navbar';
import MachineStateDisplay from '../components/machineStateDisplay/machineStateDisplay';
import ExtractionProfileSelector from '../components/machineStateDisplay/extractionProfileSelector';
import ExtractionStateDisplay from '../components/machineStateDisplay/extractionStateDisplay';
import DataIndicator from '../components/dataDisplay/dataIndicator';
import GrindAmountIndicator from '../components/dataDisplay/grindAmountIndicator';
import GraphPlot from '../components/dataDisplay/graphPlot';
import GraphStateToggle from '../components/dataDisplay/graphStateToggle';
import { useMachineState } from '../contexts/webSocketContext/machineStateContext';
import { useAppSettings } from '../contexts/LocalStorageContext/appSettingsContext';
import { useShotHistory } from '../contexts/LocalStorageContext/ShotHistoryContext';
import { useSensorValue } from '../contexts/webSocketContext/sensorValuesContext';
import { useProfiles } from '../contexts/webSocketContext/ProfilesContext';
import { useNavigate, useParams } from 'react-router-dom';


export default function BrewPage() {

    const navigate = useNavigate()
    const [machineState,setMachineState,prevMachineState] = useMachineState()
    const [mouseTime, setMouseTime] = useState(-1) //timestamp value
    const {graphState} = useParams()
    const [appSettings, setAppSettings] = useAppSettings()
    const [sensorValues,setSensorValues,addSensorValue] = useSensorValue()
    const [activeProfile, profiles] = useProfiles()
    const [shotHistory, addToHistory] = useShotHistory()
    const [lastShotData, setlastShotData] = useState()
    const askForSavePopupRef = useRef()

    useEffect(() => {
        if(machineState.state == "Extraction" && prevMachineState.current.state != "Extraction") {
            navigate("/brew/Extraction")
            askForSavePopupRef.current.style.transform = "translateX(100%)"
        } else {
            if(prevMachineState.current && prevMachineState.current.state == "Extraction") {
                saveLastShot()
            }
        }
    },[machineState.state])

    const saveLastShot = () => {
        let newHistory = { date: machineState.extractionStartTime, profileId: activeProfile.id, data: {}, Comment: " ", username: appSettings.username }
        newHistory.data = JSON.parse(JSON.stringify(sensorValues))
        for (let iSensor = 0; iSensor < newHistory.data.length; iSensor++) {
            const Sensor = newHistory.data[iSensor]
            let iStart
            for (let iDatapoint = 0; iDatapoint < Sensor.x.length; iDatapoint++) {
                if(Sensor.x[iDatapoint] > machineState.extractionStartTime) {
                    iStart = iDatapoint
                    break
                }
            }
            newHistory.data[iSensor].x = Sensor.x.slice(iStart,Sensor.x.length)
            newHistory.data[iSensor].y = Sensor.y.slice(iStart,Sensor.y.length)
        }
        setlastShotData(newHistory)
        askForSavePopupRef.current.style.transform = "none"
    }
    const saveLastShotInHistory = () => {
        setMachineState(prevState => ({...prevState, currentExtractionPhase: -1}))
        askForSavePopupRef.current.style.transform = "translateX(100%)"
        addToHistory(lastShotData)
    }
    const dontSaveLastShotInHistory = () => {
        setMachineState(prevState => ({...prevState, currentExtractionPhase: -1}))
        askForSavePopupRef.current.style.transform = "translateX(100%)"
    }


    function StartExtraction() {
        setMachineState(prevState => ({...prevState, state: "Extraction", extractionStartTime: Date.now()}))
    }
    function StopExtraction() {
        setMachineState(prevState => ({...prevState, state: "Ready"}))
    }


    return (
        <>
        <Navbar />
        <div className='content contentBrewPage'>
            <MachineStateDisplay />
            <ExtractionProfileSelector />
            <ExtractionStateDisplay />
            <DataIndicator 
                sensorValues={sensorValues}
                mouseTime={mouseTime}
            />
            {window.TEST_WITHOUT_ESP?<div style={{position: "absolute", left: "40%", top: "20%"}}><button className='button' onClick={StartExtraction}>Start Extraction Test</button><button className='button' onClick={StopExtraction}>Stop Extraction Test</button></div>:""}
            <GraphPlot
                moveGraphWithTime
                plotSensorValues
                plotExtractionProfile
                plotLastShot
                plotMouseLine
                setMouseTime={setMouseTime}
                graphState={graphState}
                pastDataTime={appSettings.showPastTime}
                GridTimeAxis="10"
                lastShotData={lastShotData}
                sensorValues={sensorValues}
                activeProfile={activeProfile}
            >
                <GrindAmountIndicator
                    currentProfile={activeProfile}
                />
            </GraphPlot>
            <GraphStateToggle 
                graphState={graphState} 
            />
            <div ref={askForSavePopupRef} className='askForSavePopup'>
                <h1>Save last Shot?</h1>
                <button className='button' onClick={saveLastShotInHistory}><i className="fa-solid fa-check"></i></button><button className='button' onClick={dontSaveLastShotInHistory}><i className="fa-solid fa-xmark"></i></button>
            </div>
        </div>
        </>
    )
}