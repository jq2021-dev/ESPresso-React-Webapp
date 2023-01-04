import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '../contexts/LocalStorageContext/appSettingsContext';
import Splash from '../images/splash.jpg'

export default function StartPage()  {
        
    const navigate = useNavigate()
    const [appSettings, setAppSettings, sensorSettings, machineSettings, setMachineSettings] = useAppSettings()

    useEffect(()=>{
        setTimeout(()=>{
            if(appSettings.username == "Max Mustermann") navigate("/settings")
            else navigate("/brew")
        },2000)
    },[])

    const Styles = {
        backgroundImage: "url("+Splash+")",
        backgroundSize: "cover",
        backgroundPosition: "center center"
    }
            
    return (
        <>
        <div className='content' style={Styles}>
        </div>
        </>
    )
}