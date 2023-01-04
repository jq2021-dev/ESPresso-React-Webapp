import React, { useEffect, useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useProfiles } from '../../contexts/webSocketContext/ProfilesContext';
import ContextMenu from '../contextMenu';
import GraphPlot from '../dataDisplay/graphPlot';
import { useWebSocketConnection } from '../../contexts/webSocketContext/webSocketConnection';

export default function ProfilePreviewer({ inEditProfileUuid, setInEditProfileUuid }) {

    const [activeProfile, profiles] = useProfiles()
    const [inEditProfile, setInEditProfile] = useState(profiles?profiles.find(el => el.uuid == inEditProfileUuid):undefined)
    const [subscribeToWSevent, sendMessage, webSocketConnected] = useWebSocketConnection();

    useEffect(() => {
        setInEditProfile(profiles?profiles.find(el => el.uuid == inEditProfileUuid):undefined)
    }, [inEditProfileUuid, profiles])

    const [popupVisible, setPopupVisible] = useState(false)

    function deleteProfile() {
        if (inEditProfileUuid == activeProfile.uuid) {
            alert("Can't delete active Profile!")
            return
        }

        sendMessage("send", "deleteProfileUuid", inEditProfileUuid, () => { }, true)
        setInEditProfileUuid(activeProfile.uuid)
    }

    function setProfileAsActive() {
        sendMessage("send", "activeProfileUuid", inEditProfileUuid, () => { })
    }

    return (
        <>
            <div className={'profilingPageElement ProfilePreviewer '+(!webSocketConnected?"noConnection":"")}>
                {inEditProfile!=undefined?(<><h1 className='Heading'>{inEditProfile.name}</h1>
                <GraphPlot
                    graphState='Extraction'
                    plotExtractionProfile
                    activeProfile={inEditProfile}
                />
                <div className='Description'>
                    <label>{inEditProfile.description != "" ? "Description:" : ""}</label>
                    <span>{inEditProfile.description}</span>
                </div>
                <NavLink className='button EditButton active' to={inEditProfileUuid}>Edit <i className="fa-solid fa-pen"></i></NavLink>
                <div 
                    className={"button ActiveButton" + ((activeProfile && inEditProfileUuid == activeProfile.uuid) ? " active" : "")} 
                    onClick={setProfileAsActive}>{((activeProfile && inEditProfileUuid == activeProfile.uuid) ? " Activated " : "Activate ")}
                        <i className="fa-solid fa-check"></i>
                </div>
                <div className='button DeleteButton' onClick={() => { setPopupVisible(true) }}>
                    Delete <i className="fa-solid fa-trash"></i>
                    <ContextMenu
                        open={popupVisible}
                        onClose={() => { setPopupVisible(false) }}
                        openDirectionOrigin="bottom right"
                        offsetY="5pt"
                    >
                        <div className='popupButton red' 
                            onClick={(e) => { e.stopPropagation(); deleteProfile(); setPopupVisible(false) }}>
                                <i className="fa-solid fa-trash"></i> Delete this profile irrevocably
                        </div>
                    </ContextMenu>
                </div></>):"No Connection"}
            </div>
        </>
    )
}