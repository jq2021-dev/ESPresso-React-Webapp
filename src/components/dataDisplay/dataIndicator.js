import React, { useEffect, useState } from 'react';
import { useAppSettings } from '../../contexts/LocalStorageContext/appSettingsContext';

export default function DataIndicator({mouseTime=-1, sensorValues}) {

    const [appSettings, setAppSettings, sensorSettings, machineSettings, setMachineSettings] = useAppSettings()

    function getCurrentSensorValues() {
        let Sensor = []
        sensorValues.forEach((SensorValue) => {
            let value
            if(SensorValue.x.length > 0 && ((Date.now() - SensorValue.x[SensorValue.x.length-1]) < machineSettings.liveDataTolerance)) {
                value = SensorValue.y[SensorValue.y.length-1].toFixed(sensorSettings[SensorValue.id].commaPrecision)
            } else {
                value = "-"
            }
            Sensor.push({
                sensorName: sensorSettings[SensorValue.id].sensorName,
                sensorValue: isNaN(value) ? "-" : value,
                sensorUnit: sensorSettings[SensorValue.id].unit,
                sensorColor: sensorSettings[SensorValue.id].lineStyle.lineColor
            })
        })
        return Sensor
    }

    function getSensorValuesAtTime(mouseTime) {
        let Sensor = []
        sensorValues.forEach((SensorValue) => {
            let value = -999
            for (let i = 0; i < SensorValue.x.length; i++) {
                if((SensorValue.x[i] > mouseTime)) {
                    if(SensorValue.x[i-1]) {
                        value = (mouseTime-SensorValue.x[i-1])/(SensorValue.x[i]-SensorValue.x[i-1])*(SensorValue.y[i]-SensorValue.y[i-1]) + SensorValue.y[i-1]
                    }
                    break;
                }
            }
            Sensor.push({
                sensorName: sensorSettings[SensorValue.id].sensorName,
                sensorValue: value == -999 ? "-" : value.toFixed(sensorSettings[SensorValue.id].commaPrecision),
                sensorUnit: sensorSettings[SensorValue.id].unit,
                sensorColor: sensorSettings[SensorValue.id].lineStyle.lineColor
            })
        })
        return Sensor
    }


    const [currentValues, setCurrentValues] = useState(getCurrentSensorValues())
    const [UpdateGraphToggle, setUpdateGraphToggle] = useState(true)


    useEffect(() => {
        if(mouseTime !== -1) {
            setCurrentValues(getSensorValuesAtTime(mouseTime))
        } else {
            setCurrentValues(getCurrentSensorValues())
        }
    },[UpdateGraphToggle])

    // Start Animation
    useEffect(() => {
        let timerId
        const animate = () => {
            setUpdateGraphToggle(c => !c)
            timerId = requestAnimationFrame(animate)
        }
        timerId = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(timerId)
    }, [])

    return (
        <div className='brewPageElement DataIndicator'>
            <h1>{mouseTime == -1 ? "Live Data" : "Data"}</h1>
            <div className='dataPointWrapper'>
            {   
                currentValues.map((Sensor) => {
                    return (
                        <div key={Sensor.sensorName} className={"dataPoint "+ (mouseTime != -1 ? "mouseData" : "")}>
                            <label>{Sensor.sensorName}</label>
                            <span className='Value' style={{color:Sensor.sensorColor}}>{Sensor.sensorValue}</span>
                            <span className='Unit'>{Sensor.sensorUnit}</span>
                        </div>
                    )
                })
            }
            </div>
        </div>
    )
}