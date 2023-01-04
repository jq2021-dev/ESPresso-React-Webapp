import React from 'react';
import { useMachineState } from '../../contexts/webSocketContext/machineStateContext';

export default function MachineStateDisplay() {

    const [machineState,setMachineState] = useMachineState()

    function renderState() {
        switch(machineState.state) {
            case 'Heating': return <p><i style={{color:"#d44545"}} className="icon fa-solid fa-temperature-arrow-up fa-beat"></i> <span>Heating</span></p>
            case 'TooHot': return <p><i style={{color:"#d44545"}} className="icon fa-solid fa-fire fa-beat"></i> <span>Too hot</span></p>
            case 'Ready': return <p><i style={{color:"#7da61b"}} className="icon fa-solid fa-circle-check"></i> <span>Ready</span></p>
            case 'Extraction': return <p><i style={{color:"#009cff"}} className="icon fa-solid fa-mug-hot fa-beat"></i> <span>Extraction</span></p>
            case 'Standby': return <p><i className="icon fa-solid fa-moon"></i> <span>Standby</span></p>
            case 'NoConnection': return <p><i className="icon fa-solid fa-link-slash"></i> <span>No Connection</span></p>
            default: return <p><span>Unknown state</span></p>
        }
    }

    return (
        <div className='brewPageElement MachineStateDisplay'>
            { renderState() }
        </div>
    );
}