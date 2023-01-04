import React from 'react';
import { useMachineState } from '../../contexts/webSocketContext/machineStateContext';
import { useProfiles } from '../../contexts/webSocketContext/ProfilesContext';
import { useWebSocketConnection } from '../../contexts/webSocketContext/webSocketConnection';

export default function ExtractionStateDisplay() {

    const [activeProfile, profiles] = useProfiles()
    const [machineState,setMachineState] = useMachineState()
    const [subscribeToWSevent, sendMessage, webSocketConnected] = useWebSocketConnection()

    return (
        <div className='brewPageElement ExtractionStateDisplay'>
            {activeProfile!=undefined?(
                <div className={'statusBar '+(!webSocketConnected?"noConnection":"")}>
                    {
                        activeProfile.phases.map((phase,index) => {
                            if(index == 0) {
                                let finished = (machineState.currentExtractionPhase != -1) ? "finished" : ""
                                let current = (machineState.currentExtractionPhase == index && machineState.state == "Extraction") ? " current" : ""
                                return (
                                    <span key={index} className={"statusBarElement "+finished + current}><label>{phase.name}</label></span>
                                )
                            } else {
                                let finished = (machineState.currentExtractionPhase >= index) ? "finished" : ""
                                let current = (machineState.currentExtractionPhase == index && machineState.state == "Extraction") ? " current" : ""
                                return (
                                    <React.Fragment key={index}>
                                    <span className={"statusBarBar "+finished}></span>
                                    <span className={"statusBarElement "+finished + current}><label>{phase.name}</label></span>
                                    </React.Fragment>
                                )
                            }
                        })
                    }
                    <span className={(machineState.currentExtractionPhase >= activeProfile.phases.length) ? "statusBarBar finished" : "statusBarBar"}></span>
                    <span className={(machineState.currentExtractionPhase >= activeProfile.phases.length) ? "statusBarElement finished" : "statusBarElement"}><label>Finished</label></span>
                </div>
            ):""}
        </div>
    );
}