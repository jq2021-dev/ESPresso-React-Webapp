import React from 'react';
import {NavLink} from "react-router-dom"

export default function Navbar() {
        return (
            <div className="navbar">
            <ul>
                <li><NavLink to="/brew"><span><i className={"icon fa-solid fa-mug-hot"} style={{marginLeft: "5pt"}} />Brew</span></NavLink></li>
                <li><NavLink to="/profiling"><span><i className="icon fa-solid fa-chart-line" />Profiling</span></NavLink></li>
                <li><NavLink to="/history"><span><i className="icon fa-solid fa-book" />History</span></NavLink></li>
                <li><NavLink to="/settings"><span><i className="icon fa-solid fa-gears" />Settings</span></NavLink></li>
            </ul>
            </div>
        );
}