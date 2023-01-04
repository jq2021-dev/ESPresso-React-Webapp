import React from 'react';
import TimeAgo from 'timeago-react';
import { useProfiles } from '../../contexts/webSocketContext/ProfilesContext';
import { useWebSocketConnection } from '../../contexts/webSocketContext/webSocketConnection';

export default function ProfilingList({OpenCreateNew,inEditProfileUuid,setInEditProfileUuid})  {

    const [activeProfile, profiles] = useProfiles()
    const [subscribeToWSevent, sendMessage, webSocketConnected] = useWebSocketConnection()

    return (
        <div className={'profilingPageElement ProfilingList '+(!webSocketConnected?"noConnection":"")}>
            <div className='header'>
                <button className='textLink Left' onClick={OpenCreateNew}><i className="fa-solid fa-plus"></i></button>
                <button className='textLink Right'><i className="fa-solid fa-filter"></i></button>
            </div>
            <ul className='list'>
                {(profiles && profiles.length>0)?profiles.sort((a,b) => b.dateLastModified - a.dateLastModified).map(profile => (
                    <li key={profile.uuid} className={""+((activeProfile && profile.uuid==activeProfile.uuid)?" chosenProfile":"")+((profile.uuid==inEditProfileUuid)?" active":"")} onClick={() => {setInEditProfileUuid(profile.uuid)}}>
                        <h2>{profile.name}</h2>
                        <p>
                        <label>Created:</label><span>{profile.creator}, <TimeAgo  datetime={profile.dateCreation} /></span>
                        <label>Last modified:</label><span>{profile.lastModifiedBy}, <TimeAgo  datetime={profile.dateLastModified} /></span>
                        </p>
                    </li>
                )):<li>No connection</li>}
            </ul>
        </div>
    )
}