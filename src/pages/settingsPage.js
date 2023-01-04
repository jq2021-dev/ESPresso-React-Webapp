import Navbar from '../components/navbar/navbar';

import React, { useState } from 'react';
import { useAppSettings } from '../contexts/LocalStorageContext/appSettingsContext';
import ContextMenu from '../components/contextMenu';

export default function SettingsPage()  {

    const [appSettings, setAppSettings, sensorSettings] = useAppSettings()

    function changeAppSettings(e) {
        setAppSettings(prev=>({
            ...prev,
            [e.target.id]: e.target.value
        }))
    }

    const [chooseThemeVisible, setChooseThemeVisible] = useState(false)

    return (
        <>
        <Navbar />
        <div className='content contentSettingsPage'>
            <h1>App Settings</h1>
            <ul className='list settingslist'>
                <li><label>Username</label><input id='username' onChange={changeAppSettings} value={appSettings.username}/></li>
                <li onClick={() => { setChooseThemeVisible(true) }}><label>Theme</label>
                    <span style={{position: "relative"}}> {appSettings.theme}
                    <ContextMenu
                        open={chooseThemeVisible}
                        onClose={() => { setChooseThemeVisible(false) }}
                        openDirectionOrigin="top left"
                        offsetY="5%"
                        offsetX='5%'
                        blurBackground={true}
                        positionGlobal={true}
                    >
                        <div className='popupButton borderBottom heading'>Choose Theme</div>
                        <div className='popupButton' 
                            onClick={(e) => { e.stopPropagation(); setAppSettings(prev=>({...prev,["theme"]: "bright"})); setChooseThemeVisible(false) }}>
                                <i className="fa-solid fa-sun"></i> Bright
                        </div>
                        <div className='popupButton' 
                            onClick={(e) => { e.stopPropagation(); setAppSettings(prev=>({...prev,["theme"]: "dark"})); setChooseThemeVisible(false) }}>
                                <i className="fa-solid fa-moon"></i> Dark
                        </div>
                    </ContextMenu>
                    </span>
                </li>
                <li><label>Time to show past data</label><input style={{marginRight:"5pt"}} type="range" min="5" max="120" step="1" id='showPastTime' onChange={changeAppSettings} value={appSettings.showPastTime}/>{appSettings.showPastTime} s</li>
            </ul>
            <h1>Machine Settings</h1>
            <ul className='list'>
                <li><label>Standby Time</label></li>
                <li><label>Live Data Time Threshold</label></li>
                <li><label>Temperature Ready State Threshold</label></li>
                <li><label>Boiler to Brew Temperature Delta</label></li>
                <li><label>Auto Stop at end of Extraction profile</label></li>
            </ul>
            <br></br>
            <code style={{display: "block", textAlign: "center", marginTop: "12pt"}}>ESPresso React App, v 0.1</code>
        </div>
        </>
    )
}