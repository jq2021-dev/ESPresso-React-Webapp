import React from 'react';
import { useAppSettings } from '../../contexts/LocalStorageContext/appSettingsContext';

export default function ProfilingControlTerminationList({
    currentProfile,
    setCurrentProfile,
    currentPhaseId,
    currentControlId,
    setCurrentControlId,
    currentTerminationId,
    setCurrentTerminationId,
    controlOrTerminationView,
    setControlOrTerminationView,
    locked = false
    })  {

    const [appSettings, setAppSettings, sensorSettings] = useAppSettings()


    function addControl(id) {
        let startValue = Math.round((sensorSettings[id].yValueMax+sensorSettings[id].yValueMin)/2*Math.pow(10,sensorSettings[id].commaPrecision))/Math.pow(10,sensorSettings[id].commaPrecision)
        let newControl = { controlValueId: id, targetValueBegin: startValue, targetValueEnd: startValue }
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: prevProfile.phases.map(
                    (phase,phaseindex) => ((phaseindex==currentPhaseId) ?
                        {
                        ...phase,
                        control: [...phase.control, newControl],
                        termination: phase.termination
                    }: phase)
                )
            }
        ))
        setCurrentControlId(id)
    }

    function removeControl(id) {
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: prevProfile.phases.map(
                    (phase,phaseindex) => ((phaseindex==currentPhaseId) ?
                        {
                        ...phase,
                        control: phase.control.filter(el=>el.controlValueId!=id),
                        termination: phase.termination
                    }: phase)
                )
            }
        ))
    }


    function ControlList() {
        return (
            <>
            {Object.entries(sensorSettings).filter(([id,el])=>id!="time").map(([sensorid,sensor]) => (
                (currentProfile.phases[currentPhaseId].control.find(el => el.controlValueId == sensorid ? true : false)) 
                    ? <li key={sensorid} className={"enabled " + (sensorid==currentControlId ? "active" : "")}  onClick={() => {setCurrentControlId(sensorid)}}><span className='name'>{sensor.sensorName}</span><span className='modButton' onClick={()=>{removeControl(sensorid)}}><i className="fa-solid fa-toggle-on"></i></span></li> 
                    : <li key={sensorid} className={"disabled " + (sensorid==currentControlId ? "active" : "")}><span className='name'>{sensor.sensorName}</span><span className='modButton' onClick={()=>{addControl(sensorid)}}><i className="fa-solid fa-toggle-off"></i></span></li> 
            ))}
            </>
        )
    }

    function addTermination(id) {       
        let startValue = Math.round((sensorSettings[id].yValueMax+sensorSettings[id].yValueMin)/2*Math.pow(10,sensorSettings[id].commaPrecision))/Math.pow(10,sensorSettings[id].commaPrecision)
        let newTermination = {controlValueId: id, terminationType: "greaterThan", terminationValue: startValue }
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: prevProfile.phases.map(
                    (phase,phaseindex) => ((phaseindex==currentPhaseId) ?
                        {
                        ...phase,
                        control: phase.control,
                        termination: [...phase.termination, newTermination]
                    }: phase)
                )
            }
        ))
        setCurrentTerminationId(id)
    }

    function removeTermination(id) {
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: prevProfile.phases.map(
                    (phase,phaseindex) => ((phaseindex==currentPhaseId) ?
                        {
                        ...phase,
                        control: phase.control,
                        termination: phase.termination.filter(el=>el.controlValueId!=id)
                    }: phase)
                )
            }
        ))
    }


    function TerminationList() {
        return (
            <>
            {Object.entries(sensorSettings).map(([sensorid,sensor]) => (
                (currentProfile.phases[currentPhaseId].termination.find(el => el.controlValueId == sensorid ? true : false)) 
                    ? <li key={sensorid} className={"enabled " + (sensorid==currentTerminationId ? "active" : "")}  onClick={() => {setCurrentTerminationId(sensorid)}}><span className='name'>{sensor.sensorName}</span>{(sensorid!="time")?<span className='modButton' onClick={()=>{removeTermination(sensorid)}}><i className="fa-solid fa-toggle-on"></i></span>:""}</li> 
                    : <li key={sensorid} className={"disabled " + (sensorid==currentTerminationId ? "active" : "")}><span className='name'>{sensor.sensorName}</span><span className='modButton' onClick={()=>{addTermination(sensorid)}}><i className="fa-solid fa-toggle-off"></i></span></li> 
            ))}
            </>
        )
    }

    return (
        <>
        <div className={'profilingPageElement ProfilingControlTerminationList '+(locked?"noConnection":"")}>
            <div className='tabs'>
                <div className={'tab'+(controlOrTerminationView == "Control" ? " active" : "")} onClick={()=>{ setControlOrTerminationView("Control") }}>Controls</div>
                <div className={'tab'+(controlOrTerminationView == "Termination" ? " active" : "")} onClick={()=>{ setControlOrTerminationView("Termination") }}>Terminations</div>
            </div>
            <ul className='list'>
                {controlOrTerminationView == "Control" ? <ControlList /> : <TerminationList />}
            </ul>
        </div>
        </>
    )
}