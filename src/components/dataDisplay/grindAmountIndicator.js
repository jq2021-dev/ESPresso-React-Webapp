import React, { useState, useRef } from 'react';
import { useMachineState } from '../../contexts/webSocketContext/machineStateContext';

export default function GrindAmountIndicator({currentProfile, editMode = false, setCurrentProfile, locked = false}) {

    const [machineState,setMachineState] = useMachineState()
    const InputRef = useRef()

    function changeGrindWeight(e) {
        setCurrentProfile(prevProfile => (
            {
                ...prevProfile,
                recommendedGrindWeight: parseFloat(e.target.value)?parseFloat(e.target.value):-1
            }
        ))
    }

    return (
        <div className={'brewPageElement GrindAmountIndicator '+(locked?"noConnection":"")}>
            {currentProfile!=undefined?(
                editMode ? (
                    <button className='button editMode' onClick={()=>{
                        InputRef.current.focus()
                    }}>
                        <div className='inputHint'>Enter recommended grind weight:</div>
                        <i className="fa-solid fa-whiskey-glass"></i>
                        <input ref={InputRef} type="number" min="0" max="100" step="0.1" spellCheck={false} autoComplete="off" onChange={changeGrindWeight} value={(currentProfile.recommendedGrindWeight!=-1)?(currentProfile.recommendedGrindWeight):"--"}></input>
                        gm
                    </button>
                ) 
                : (
                    <button className='button'>
                        <i className="fa-solid fa-whiskey-glass"></i>
                        {(machineState.savedGrindWeight!=-1?machineState.savedGrindWeight:"--")+((currentProfile.recommendedGrindWeight!=-1)?(" / "+currentProfile.recommendedGrindWeight.toFixed(1)):"")}
                        gm
                    </button>
                )
            ):""}
        </div>
    );
}