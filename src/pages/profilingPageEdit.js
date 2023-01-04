import React, { useEffect, useState } from 'react';
import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GraphPlot from '../components/dataDisplay/graphPlot';
import ProfilingControlTerminationList from '../components/profiling/profilingControlTerminationList';
import ProfilingPhaseManager from '../components/profiling/profilingPhaseManager';
import ProfilingValueModifier from '../components/profiling/profilingValueModifier';
import { useAppSettings } from '../contexts/LocalStorageContext/appSettingsContext';
import { v4 as uuidV4} from 'uuid'
import { useProfiles } from '../contexts/webSocketContext/ProfilesContext';
import { useWebSocketConnection } from '../contexts/webSocketContext/webSocketConnection';
import GrindAmountIndicator from '../components/dataDisplay/grindAmountIndicator';

const emptyProfileTemplate = {
    uuid: undefined,
    name: undefined,
    description: "",
    creator: undefined,
    dateCreation: undefined,
    lastModifiedBy: undefined,
    dateLastModified: undefined,
    recommendedGrindWeight: -1,
    phases: []
}

export default function ProfilingPageEdit({route}) {

    const navigate = useNavigate()

    const [appSettings, setAppSettings, sensorSettings] = useAppSettings()
    const [subscribeToWSevent, sendMessage, webSocketConnected] = useWebSocketConnection()

    const [locked, setLocked] = useState(true)

    useEffect(()=>{
        if(webSocketConnected) setLocked(false)
        else setLocked(true)
    },[webSocketConnected])
    
    const {Profileid} = useParams()
    const [mode, setMode] = useState()
    const [activeProfile, profiles] = useProfiles()

    const [currentProfile, setCurrentProfile] = useState(profiles?profiles[0]:emptyProfileTemplate)
    const [savedProfile, setSavedProfile] = useState(profiles?profiles[0]:emptyProfileTemplate)
    const [profileHasChanged, setProfileHasChanged] = useState(false)

    const [currentPhaseId, setCurrentPhaseId] = useState(0)
    const [currentControlId, setCurrentControlId] = useState("temperature")
    const [currentTerminationId, setCurrentTerminationId] = useState("time")
    const [controlOrTerminationView, setControlOrTerminationView] = useState("Control")
    const [editGrindWeight, setEditGrindWeight] = useState(false)

    const highlightSinglePhase = useRef(0)
    
    const [zoomSinglePhaseState, __setZoomSinglePhaseState] = useState(false)
    const zoomSinglePhase = useRef(zoomSinglePhaseState)
    const toggleZoomSinglePhase = () => {
        zoomSinglePhase.current = !zoomSinglePhase.current
        __setZoomSinglePhaseState(zoomSinglePhase.current)
    }

    useEffect(() => {
        highlightSinglePhase.current = currentPhaseId
    },[currentPhaseId])

    useEffect(()=>{
        setEditGrindWeight(false)
    },[currentPhaseId,currentControlId,currentTerminationId,controlOrTerminationView])

    
    useEffect(() => {
        if(profiles.find(el=>el.uuid==Profileid)) {
            setCurrentProfile(JSON.parse(JSON.stringify(profiles.find(el=>el.uuid==Profileid))))
            setSavedProfile(profiles.find(el=>el.uuid==Profileid))
            setMode("edit")
        } else {
            let startValue = Math.round((sensorSettings.temperature.yValueMax+sensorSettings.temperature.yValueMin)/2*Math.pow(10,sensorSettings.temperature.commaPrecision))/Math.pow(10,sensorSettings.temperature.commaPrecision)
            let newControl = { controlValueId: "temperature", targetValueBegin: startValue, targetValueEnd: startValue }
            let newTermination = {controlValueId: "time", terminationType: "greaterThan", terminationValue: 10 }
            let newPhase = { name: "New Phase", control: [newControl], termination: [newTermination] }
            setCurrentProfile({...emptyProfileTemplate, uuid: uuidV4(), name: Profileid, creator: appSettings.username, dateCreation: Date.now(), phases: [newPhase,newPhase,newPhase]})
            setProfileHasChanged(true)
            setMode("new")
        }
    },[])

    useEffect(() => {
        if(mode=="edit") {
            if(JSON.stringify(currentProfile)!=JSON.stringify(savedProfile)) {
                setProfileHasChanged(true)
            } else {
                setProfileHasChanged(false)
            }
        }
    },[currentProfile])
    
    function OnAbort() {
        navigate(-1)
    }
    
    const [mouseValueLeft, setMouseValueLeft] = useState(-1)
    const [mouseValueRight, setMouseValueRight] = useState(-1)
    
    const profileNameInputRef = useRef()
    const changeProfileName = (e) => {
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                name: e.target.value
            }
        ))
    }
    const profileDescriptionInputRef = useRef()
    const changeProfileDescription = (e) => {
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                description: e.target.value
            }
        ))
    }

    function saveProfileAndExit() {
        if(profileHasChanged) {
            setLocked(true)
            currentProfile.lastModifiedBy = appSettings.username
            currentProfile.dateLastModified = Date.now()
            currentProfile.phases.forEach(phase => {
                phase.control.forEach(control => {
                    control.targetValueBegin = parseFloat(control.targetValueBegin.toFixed(sensorSettings[control.controlValueId].commaPrecision))
                    control.targetValueEnd = parseFloat(control.targetValueEnd.toFixed(sensorSettings[control.controlValueId].commaPrecision))
                })
                phase.termination.forEach(termination => {
                    termination.terminationValue = parseFloat(termination.terminationValue.toFixed(sensorSettings[termination.controlValueId].commaPrecision))
                })
            })
            currentProfile.recommendedGrindWeight = Math.round(currentProfile.recommendedGrindWeight*10)/10
            if(mode=="edit") {
                sendMessage("send", "updateProfile", currentProfile, (message) => { if(message.value) navigate(-1); else setLocked(!webSocketConnected) }, true)
            } else {
                sendMessage("send", "newProfile", currentProfile, (message) => { if(message.value) navigate(-1); else setLocked(!webSocketConnected) }, true)
            }
        }
    }

    return (
    <>
        <div className='content contentProfilingPageEdit '>
            <div className='ProfilingHeader header accentColor'>
                <div className='Left'><button className="textLink active" onClick={OnAbort}>Cancel</button></div>
                <span className={'Middle input '+(!webSocketConnected?"noConnection":"")}>
                    <i className="fa-solid fa-pen" onClick={()=>{profileNameInputRef.current.focus()}}></i>
                    <input ref={profileNameInputRef} spellCheck={false} onChange={changeProfileName} value={currentProfile.name}></input>
                    <div className='descriptionInput'>
                        Description: 
                        <input ref={profileDescriptionInputRef} spellCheck={false} onChange={changeProfileDescription} value={currentProfile.description} placeholder="Enter a short description for your profile ..."></input>
                    </div>
                    </span>
                <div className={'Right '+(!webSocketConnected?"noConnection":"")}><button className={"textLink "+(profileHasChanged?"active":"inactive")} onClick={saveProfileAndExit}>Done</button></div>
            </div>
            <ProfilingPhaseManager 
                currentProfile={currentProfile}
                setCurrentProfile={setCurrentProfile}
                currentPhaseId={currentPhaseId}
                setCurrentPhaseId={setCurrentPhaseId}
                locked={locked}
            />
            <ProfilingControlTerminationList 
                currentProfile={currentProfile} 
                setCurrentProfile={setCurrentProfile}
                currentPhaseId={currentPhaseId}
                currentControlId={currentControlId}
                setCurrentControlId={setCurrentControlId}
                currentTerminationId={currentTerminationId}
                setCurrentTerminationId={setCurrentTerminationId}
                controlOrTerminationView={controlOrTerminationView}
                setControlOrTerminationView={setControlOrTerminationView}
                locked={locked}
            />
            <GraphPlot
                    className={(locked?"noConnection":"")}
                    graphState='Extraction'
                    plotExtractionProfile
                    activeProfile={currentProfile}
                    highlightSinglePhase={highlightSinglePhase}
                    zoomSinglePhase={zoomSinglePhase}
                    highlightControlId={(controlOrTerminationView=="Control")?currentControlId:null}
                    highlightTerminationId={(controlOrTerminationView=="Termination")?currentTerminationId:null}
                    setMouseValueLeft={setMouseValueLeft}
                    setMouseValueRight={setMouseValueRight}
                    locked={locked}
            >
                <GrindAmountIndicator 
                    currentProfile={currentProfile}
                    setCurrentProfile={setCurrentProfile}
                    editMode
                    locked={locked}
                />
            </GraphPlot>
            <button 
                className={'textLink zoombutton '+(!webSocketConnected?"noConnection":"")}
                onClick={toggleZoomSinglePhase}>
                    {zoomSinglePhaseState ? <i className="fa-solid fa-down-left-and-up-right-to-center"></i> : <i className="fa-solid fa-up-right-and-down-left-from-center"></i>}
            </button>
            <ProfilingValueModifier 
                currentProfile={currentProfile}
                setCurrentProfile={setCurrentProfile}
                currentPhaseId={currentPhaseId}
                currentControlId={currentControlId}
                currentTerminationId={currentTerminationId}
                controlOrTerminationView={controlOrTerminationView}
                mouseValueLeft={mouseValueLeft}
                mouseValueRight={mouseValueRight}
                editGrindWeight={editGrindWeight}
                locked={locked}
            />
            
        </div>
    </>
    )
}