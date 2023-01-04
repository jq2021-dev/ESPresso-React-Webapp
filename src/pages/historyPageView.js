import React, { useState } from 'react';
import GraphPlot from '../components/dataDisplay/graphPlot';
import { useShotHistory } from '../contexts/LocalStorageContext/ShotHistoryContext';
import { NavLink, useParams } from 'react-router-dom';
import TimeAgo from 'timeago-react'; // var TimeAgo = require('timeago-react');
import DataIndicator from '../components/dataDisplay/dataIndicator';
import { useProfiles } from '../contexts/webSocketContext/ProfilesContext';

export default function HistoryPageView()  {

    const {HistoryDate} = useParams()
    const [shotHistory, addToHistory] = useShotHistory()
    const [activeProfile, profiles] = useProfiles()
    const [mouseTime, setMouseTime] = useState(-1) //timestamp value

    let currentHistory
    if(HistoryDate) {
        shotHistory.forEach(element => {
            if(element.date == HistoryDate) {
                currentHistory = element
            }
        })
    }

    return (
    <>
        <div className='header accentColor'>
            <NavLink className="textLink active Left" to={"/history"}><span><i className="fa-solid fa-chevron-left"></i> Back</span></NavLink>
            <h2 className='Middle'><span>Doppelter Espresso, normal, <TimeAgo datetime={currentHistory.date} /></span></h2>
        </div>
        <div className='showHistoryData'>
        <DataIndicator 
            sensorValues = {currentHistory.data}
            mouseTime = {mouseTime}
        />
        <GraphPlot 
            graphTimeOffset={currentHistory.date}
            graphState="Extraction"
            pastDataTime="100"
            gridTimeAxis="10"
            plotSensorValues = {true}
            sensorValues = {currentHistory.data}
            plotExtractionProfile = {true}
            activeProfile = {profiles.find(el=>el.id == currentHistory.profileId)}
            plotMouseLine = {true}
            setMouseTime = {setMouseTime}
        />
        </div>
    </>
    )
}