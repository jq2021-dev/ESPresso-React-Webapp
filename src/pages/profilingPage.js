import React from 'react';
import { Routes, Route } from "react-router-dom";
import ProfilingPageEdit from './profilingPageEdit';
import ProfilingPageList from './profilingPageList';

export default function ProfilingPage() {

    return (
        
        <Routes>
            <Route path=":Profileid" element={<ProfilingPageEdit /> } />
            <Route path="*" element={<ProfilingPageList /> } />
        </Routes>
    )
}