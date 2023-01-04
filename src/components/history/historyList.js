import React from 'react';
import { useShotHistory } from '../../contexts/LocalStorageContext/ShotHistoryContext';
import TimeAgo from 'timeago-react'; // var TimeAgo = require('timeago-react');
import { NavLink } from 'react-router-dom';

export default function HistoryList()  {

    const [shotHistory, addToShotHistory] = useShotHistory()

    return (
        <div className='historyPageElement HistoryList'>
            <div className='header'>
                <button className='textLink Right'><i className="fa-solid fa-filter"></i></button>
            </div>
            <ul className='list'>
                {(shotHistory.length>0)?shotHistory.sort((a,b) => b.date - a.date).map(entry => (
                    <li key={entry.date}>
                        <NavLink to={""+entry.date}>
                        <h2><TimeAgo datetime={entry.date} /></h2>
                        <h2>Doppelter Espresso, normal</h2>
                        <p>
                            <label>User:</label><span>{entry.username}</span>
                            <label>Comment</label><span>{entry.comment}</span>
                            <label>Time:</label><span>{new Date(entry.date).toLocaleString()}</span>
                        </p>
                        </NavLink>
                    </li>
                )):<li><h2>No entries.</h2><p>You can save your shot after an extraction.</p></li>}
            </ul>
        </div>
    )
}