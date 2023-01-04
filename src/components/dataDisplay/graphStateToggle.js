import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function GraphStateToggle({
    graphState="Past" // Past or Extraction
    }) {

    const navigate = useNavigate()
    
    function buttonLeftClass() {
        switch(graphState) {
            case "Past": return "button buttonLeft active"
            case "Extraction": return "button buttonLeft"
        }
    }
    function buttonRightClass() {
        switch(graphState) {
            case "Past": return "button buttonRight"
            case "Extraction": return "button buttonRight active"
        }
    }

    return (
        <div className='brewPageElement GraphStateToggle'>
            <div className='GraphStateToggleButton'>
                <button className={buttonLeftClass()} onClick={() => {navigate("/brew/Past")}}>Past view</button>
                <button className={buttonRightClass()} onClick={() => {navigate("/brew/Extraction")}}>Extraction view</button>
            </div>
        </div>
    );
}