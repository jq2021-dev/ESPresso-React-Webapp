import React, {useContext, useState} from "react";
import { useEffect } from "react";
import { useWebSocketConnection } from "./webSocketConnection";

const ProfilesContext = React.createContext()

export function useProfiles() {
    return useContext(ProfilesContext)
}

export function ProfilesProvider({children}) {
    const [profiles, setProfiles] = useState();
    const [activeProfileUuid, setActiveProfileUuid] = useState();
    const [activeProfile, setActiveProfile] = useState()

    const [subscribeToWSevent, sendMessage] = useWebSocketConnection();

    useEffect(() => {
        setActiveProfile(profiles?profiles.find(el=>el.uuid==activeProfileUuid):undefined)
    },[profiles, activeProfileUuid])

    useEffect(()=>{
        subscribeToWSevent("profileUpdated", updateProfile)
        subscribeToWSevent("profileNew", newProfile)
        subscribeToWSevent("profileDeletedUuid", deleteProfile)
        subscribeToWSevent("newActiveProfileUuid", (message) => {
            setActiveProfileUuid(message.value)
            console.log("Active Profile set to:")
            console.log(message.value)
        })
        subscribeToWSevent("OnConnect", OnConnect)
    },[])

    function OnConnect() {
        sendMessage("get", "allProfiles", "", (message) => {
            setProfiles(message.value)
            console.log("Profiles set to:")
            console.log(message.value)
        }, false, true)
        console.log("get allProfiles message send")

        sendMessage("get", "activeProfileUuid", "", (message) => {
            setActiveProfileUuid(message.value)
            console.log("Active Profile set to:")
            console.log(message.value)
        }, false, true)
        console.log("get activeProfileUuid message send")
    }

    function updateProfile(message) {
        setProfiles(prevProfiles => prevProfiles.map(
            el => el.uuid==message.value.uuid ? message.value : el
        ))
    }

    function newProfile(message) {
        setProfiles(prevProfiles => [...prevProfiles, message.value])
    }

    function deleteProfile(message) {
        setProfiles(prevProfiles => prevProfiles.filter(el=>el.uuid!=message.value))
    }


    return (
        <ProfilesContext.Provider value={[activeProfile, profiles]}>
            {children}
        </ProfilesContext.Provider>
    )
}