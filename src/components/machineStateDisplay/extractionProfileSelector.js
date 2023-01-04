import React from 'react';
import { NavLink } from 'react-router-dom';
import { useProfiles } from '../../contexts/webSocketContext/ProfilesContext';
import { useWebSocketConnection } from '../../contexts/webSocketContext/webSocketConnection';

export default function ExtractionProfileSelector() {

    const [activeProfile, profiles] = useProfiles()
    const [subscribeToWSevent, sendMessage, webSocketConnected] = useWebSocketConnection()

    return (
        <div className='brewPageElement ExtractionProfileSelector'>
            {activeProfile!=undefined?(<NavLink className={'button active '+(!webSocketConnected?"noConnection":"")} to={"/profiling/"+activeProfile.uuid}>{activeProfile.name} <i className="fa-solid fa-pen"></i></NavLink>):""}
        </div>
    );
}