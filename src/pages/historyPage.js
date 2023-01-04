import Navbar from '../components/navbar/navbar';

import React from 'react';
import { Routes, Route } from "react-router-dom";
import HistoryList from '../components/history/historyList';
import HistoryPageView from './historyPageView';

export default function HistoryPage()  {

    return (
    <>
    <Navbar />
    <div className='content contentHistoryPage'>
        <Routes>
            <Route path=":HistoryDate" element={<HistoryPageView />} />
            <Route path="*" element={<HistoryList /> } />
        </Routes>
    </div>
    </>
    )
}