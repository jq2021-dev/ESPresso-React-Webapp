import React, { useState, useRef } from 'react';
import { useAppSettings } from '../../contexts/LocalStorageContext/appSettingsContext';
import ContextMenu from '../contextMenu';

export default function ProfilingPhaseManager({
    currentProfile,
    setCurrentProfile,
    currentPhaseId,
    setCurrentPhaseId,
    locked = false
    })  {

    const [appSettings, setAppSettings, sensorSettings] = useAppSettings()

    const phaseNameInputRef = useRef()

    function changePhaseLeft() {
        if(currentPhaseId>0) setCurrentPhaseId(prev=>prev-1)
    }
    function changePhaseRight() {
        if(currentPhaseId<currentProfile.phases.length-1) setCurrentPhaseId(prev=>prev+1)
    }

    function changePhaseName(e) {
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: prevProfile.phases.map(
                    (phase,phaseindex) => ((phaseindex==currentPhaseId) ?
                        {
                        ...phase,
                        name: e.target.value,
                        control: phase.control.map(
                            el => el
                        ),
                        termination: phase.termination.map(
                            el => el
                        )
                    }: phase)
                )
            }
        ))
    }

    const [popupVisible, setPopupVisible] = useState(false)

    function deletePhase() {
        if(currentPhaseId != 0) {
            setCurrentPhaseId(prev=>prev-1)
        }
        if(currentProfile.phases.length>1) {
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: prevProfile.phases.filter((phase,phaseindex) => (phaseindex!=currentPhaseId))
            }
        ))
        } else {
            alert("Cant delete last phase")
        }
    }
    function addPhase(index) {
        let startValue = Math.round((sensorSettings.temperature.yValueMax+sensorSettings.temperature.yValueMin)/2*Math.pow(10,sensorSettings.temperature.commaPrecision))/Math.pow(10,sensorSettings.temperature.commaPrecision)
        let newControl = { controlValueId: "temperature", targetValueBegin: startValue, targetValueEnd: startValue }
        let newTermination = {controlValueId: "time", terminationType: "greaterThan", terminationValue: 10 }
        let newPhase = { name: "New Phase", control: [newControl], termination: [newTermination] }
        let newPhases = JSON.parse(JSON.stringify(currentProfile.phases))
        newPhases.splice(index,0,newPhase)
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: newPhases
            }
        ))
        setCurrentPhaseId(index)
    }

    return (
        <>
        <div className={'profilingPageElement ProfilingPhaseManager header '+(locked?"noConnection":"")}>
            <div className="textLink Left" onClick={()=>{setPopupVisible(prev=>!prev)}}>
                <i className="fa-solid fa-bars"></i>
                <ContextMenu
                    open={popupVisible}
                    onClose={()=>{setPopupVisible(false)}}
                    openDirectionOrigin="top left"
                    offsetX="10pt"
                >
                    <div className='popupButton accent borderBottom' onClick={(e)=>{e.stopPropagation();phaseNameInputRef.current.focus();setPopupVisible(false)}}><i className="fa-solid fa-pen"></i> Rename phase</div>
                    <div className='popupButton accent' onClick={(e)=>{e.stopPropagation();addPhase(currentPhaseId);setPopupVisible(false)}}><i className="fa-solid fa-plus"></i> Add phase before</div>
                    <div className='popupButton accent borderBottom' onClick={(e)=>{e.stopPropagation();addPhase(currentPhaseId+1);setPopupVisible(false)}}><i className="fa-solid fa-plus"></i> Add phase after</div>
                    <div className='popupButton red' onClick={(e)=>{e.stopPropagation();deletePhase();setPopupVisible(false)}}><i className="fa-solid fa-trash"></i> Delete current phase</div>
                </ContextMenu>
            </div>
            <button className={"textLink MiddleLeft "+((currentPhaseId>0)?"active":"inactive")} onClick={changePhaseLeft}><i className="fa-solid fa-circle-chevron-left"></i></button>
            <span className='Middle'><span className='input'><input ref={phaseNameInputRef} spellCheck={false} onChange={changePhaseName} value={currentProfile.phases[currentPhaseId].name}></input></span></span>
            <button className={"textLink MiddleRight "+((currentPhaseId<currentProfile.phases.length-1)?"active":"inactive")} onClick={changePhaseRight}><i className="fa-solid fa-circle-chevron-right"></i></button>
        </div>
        </>
    )
}