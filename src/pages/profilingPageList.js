import Navbar from '../components/navbar/navbar';
import React, { useEffect, useRef, useState } from 'react';
import ProfileList from '../components/profiling/profileList';
import ProfilePreviewer from '../components/profiling/profilePreviewer';
import Modal from '../components/modal';
import { useNavigate } from 'react-router-dom';
import { useProfiles } from '../contexts/webSocketContext/ProfilesContext';


export default function ProfilingPageList() {

    const [activeProfile, profiles] = useProfiles()
    const [modalCreateNewVisible, setModalCreateNewVisible] = useState(false)
    const [inEditProfileUuid, setInEditProfileUuid] = useState(activeProfile ? activeProfile.uuid : (profiles?profiles[0].uuid:undefined))

    const createNewNameInputRef = useRef()
    const createNewSubmitRef = useRef()
    function OpenCreateNew() {
        setModalCreateNewVisible(true)
    }
    function AbortCreateNew() {
        setModalCreateNewVisible(false)
    }

    useEffect(() => {
        if(modalCreateNewVisible) {
            createNewNameInputRef.current.value = ""
            checkCreateNewInput()
            createNewNameInputRef.current.focus()            
        }
    },[modalCreateNewVisible])

    function checkCreateNewInput() {
        if(createNewNameInputRef.current.value != "") {
            createNewSubmitRef.current.style.color = "#009cff"
            return true
        }
        createNewSubmitRef.current.style.color = ""
        return false
    }

    const navigate = useNavigate()

    function createNewProfile() {
        if(checkCreateNewInput()) {
            navigate(createNewNameInputRef.current.value)
        }
    }

    return (
    <>
        <Navbar />
        <div className='content contentProfilingPage'>
            <ProfileList OpenCreateNew={OpenCreateNew} inEditProfileUuid={inEditProfileUuid} setInEditProfileUuid={setInEditProfileUuid} />
            <ProfilePreviewer inEditProfileUuid={inEditProfileUuid} setInEditProfileUuid={setInEditProfileUuid} />
            <Modal className='modalCreateNewProfile' open={modalCreateNewVisible} onClose={AbortCreateNew}>
                <h1>Enter a Name for your new Profile</h1>
                <form onSubmit={(e) => {e.preventDefault()}}>
                    <input type="text" ref={createNewNameInputRef} onChange={checkCreateNewInput} />
                    <i ref={createNewSubmitRef} className="button submitButton fa-solid fa-circle-arrow-right" onClick={createNewProfile}></i>
                </form>
            </Modal>
        </div>
    </>
    )
}