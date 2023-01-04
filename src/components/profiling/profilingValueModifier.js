import React, { useRef, useEffect, useState } from 'react';
import { useAppSettings } from '../../contexts/LocalStorageContext/appSettingsContext';

export default function ProfilingValueModifier({
                currentProfile,
                setCurrentProfile,
                currentPhaseId,
                currentControlId,
                currentTerminationId,
                controlOrTerminationView,
                mouseValueLeft,
                mouseValueRight,
                locked = false
    })  {

    const [appSettings, setAppSettings, sensorSettings] = useAppSettings()

    const prevMouseValueLeft = useRef(-1)
    const prevMouseValueRight = useRef(-1)

    const [currentControl, setCurrentControl] = useState()
    const [currentTermination, setCurrentTermination] = useState()

    useEffect(() => {
        setCurrentControl(currentProfile.phases[currentPhaseId].control.find(el => el.controlValueId == currentControlId ? true : false))
    },[currentControlId, currentPhaseId, currentProfile])

    useEffect(() => {
        setCurrentTermination(currentProfile.phases[currentPhaseId].termination.find(el => el.controlValueId == currentTerminationId ? true : false))
    },[currentTerminationId, currentPhaseId, currentProfile])

    useEffect(() => {
        if(prevMouseValueLeft.current != -1 && mouseValueLeft != -1) {
            if(controlOrTerminationView == "Control" && currentControl) {
                let decimalFactor = 10 ** sensorSettings[currentControlId].commaPrecision
                let addValue = (mouseValueLeft-prevMouseValueLeft.current)*(sensorSettings[currentControlId].yValueMin-sensorSettings[currentControlId].yValueMax)*decimalFactor
                addtoTargetValueBegin(addValue)
            } else if(currentTermination) {
                if(currentTermination.controlValueId != "time") {
                    let decimalFactor = 10 ** sensorSettings[currentTermination.controlValueId].commaPrecision
                    let addValue = (mouseValueLeft-prevMouseValueLeft.current)*(sensorSettings[currentTermination.controlValueId].yValueMin-sensorSettings[currentTermination.controlValueId].yValueMax)*decimalFactor
                    addToTerminationValue(addValue)
                }
            }
        }
        prevMouseValueLeft.current = mouseValueLeft
    },[mouseValueLeft])

    useEffect(() => {
        if(prevMouseValueRight.current != -1 && mouseValueRight != -1) {
            if(controlOrTerminationView == "Control" && currentControl) {
                let decimalFactor = 10 ** sensorSettings[currentControlId].commaPrecision
                let addValue = (mouseValueRight-prevMouseValueRight.current)*(sensorSettings[currentControlId].yValueMin-sensorSettings[currentControlId].yValueMax)*decimalFactor
                addtoTargetValueEnd(addValue)
            } else if(currentTermination) {
                if(currentTermination.controlValueId != "time") {
                    let decimalFactor = 10 ** sensorSettings[currentTermination.controlValueId].commaPrecision
                    let addValue = (mouseValueRight-prevMouseValueRight.current)*(sensorSettings[currentTermination.controlValueId].yValueMin-sensorSettings[currentTermination.controlValueId].yValueMax)*decimalFactor
                    addToTerminationValue(addValue)
                }
            }
        }
        prevMouseValueRight.current = mouseValueRight
    },[mouseValueRight])

    

    function addtoTargetValueBegin(value) {
        let decimalFactor = 10 ** sensorSettings[currentControlId].commaPrecision

        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: prevProfile.phases.map(
                    (phase,phaseindex) => ((phaseindex==currentPhaseId) ?
                        {
                        ...phase,
                        control: phase.control.map(
                            el => (el.controlValueId===currentControlId) ? { ...el, targetValueBegin: (el.targetValueBegin*decimalFactor+value)/decimalFactor } : el
                        ),
                        termination: phase.termination.map(
                            el => el
                        )
                    }: phase)
                )
            }
        ))
    }

    function addtoTargetValueEnd(value) {
        let decimalFactor = 10 ** sensorSettings[currentControlId].commaPrecision

        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: prevProfile.phases.map(
                    (phase,phaseindex) => ((phaseindex==currentPhaseId) ?
                        {
                        ...phase,
                        control: phase.control.map(
                            el => (el.controlValueId===currentControlId) ? { ...el, targetValueEnd: (el.targetValueEnd*decimalFactor+value)/decimalFactor } : el
                        ),
                        termination: phase.termination.map(
                            el => el
                        )
                    }: phase)
                )
            }
        ))
    }

    function ControlModifier() {
        return(
            <>
            <div className='NumberModifier'>
                <label>Start</label>
                <button className='button buttonMinus' onClick={()=>{addtoTargetValueBegin(-1)}}>-</button>
                <span className='value'>{currentControl.targetValueBegin.toFixed(sensorSettings[currentControlId].commaPrecision)}</span>
                <button className='button buttonPlus' onClick={()=>{addtoTargetValueBegin(1)}}>+</button>
                <span className='unit'>{sensorSettings[currentControlId].unit}</span>
            </div>
            <div className='NumberModifier'>
                <label>End</label>
                <button className='button buttonMinus' onClick={()=>{addtoTargetValueEnd(-1)}}>-</button>
                <span className='value'>{currentControl.targetValueEnd.toFixed(sensorSettings[currentControlId].commaPrecision)}</span>
                <button className='button buttonPlus' onClick={()=>{addtoTargetValueEnd(1)}}>+</button>
                <span className='unit'>{sensorSettings[currentControlId].unit}</span>
            </div>
            </>
        )
    }

    function flipTerminationType() {
        if(currentTermination.controlValueId == "time") return
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: prevProfile.phases.map(
                    (phase,phaseindex) => ((phaseindex==currentPhaseId) ?
                        {
                        ...phase,
                        control: phase.control.map(
                            el => el
                        ),
                        termination: phase.termination.map(
                            el => (el.controlValueId===currentTerminationId) ? { ...el, terminationType: el.terminationType=="greaterThan" ? "lessThan" : "greaterThan" } : el
                        )
                    }: phase)
                )
            }
        ))
    }

    function addToTerminationValue(value) {
        let decimalFactor = 10 ** sensorSettings[currentTermination.controlValueId].commaPrecision

        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                phases: prevProfile.phases.map(
                    (phase,phaseindex) => ((phaseindex==currentPhaseId) ?
                        {
                        ...phase,
                        control: phase.control.map(
                            el => el
                        ),
                        termination: phase.termination.map(
                            el => (el.controlValueId===currentTerminationId) ? { ...el, terminationValue: (el.terminationValue*decimalFactor+value)/decimalFactor } : el
                        )
                    }: phase)
                )
            }
        ))
    }

    function TerminationModifier() {
        return (
            <>
            <label className='TerminationLabel'>{sensorSettings[currentTerminationId].sensorName}</label>
            <div className='TerminationType' onClick={flipTerminationType}>
                {currentTermination.terminationType=="greaterThan" ? <i className="fa-solid fa-greater-than-equal"></i> : <i className="fa-solid fa-less-than-equal"></i>}
            </div>
                <div className='NumberModifier'>
                <label>Termination value</label>
                <button className='button buttonPlus' onClick={() => {addToTerminationValue(1)}}>+</button>
                <span className='value'>{currentTermination.terminationValue.toFixed(sensorSettings[currentTerminationId].commaPrecision)}</span>
                <button className='button buttonMinus' onClick={() => {addToTerminationValue(-1)}}>-</button>
                <span className='unit'>{sensorSettings[currentTerminationId].unit}</span>
            </div>
            </>
        )
    }

    return (
        <>
        <div className={'profilingPageElement ProfilingValueModifier '+(locked?"noConnection":"")}>
        {controlOrTerminationView == "Control" 
        ? currentControl ? <ControlModifier /> : <div className='ControlModifier'>Choose or enable a control value on the left.</div>
        : currentTermination ? <TerminationModifier /> : <div className='TerminationModifier'>Choose or enable a termination value on the left.</div>
        }
        </div>
        </>
    )
}