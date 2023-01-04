import React, {useContext} from "react";
import useLocalStorage from "../../tools/useLocalStorage";

const ShotHistoryContext = React.createContext()

export function useShotHistory() {
    return useContext(ShotHistoryContext)
}

export function ShotHistoryProvider({children}) {
    const [shotHhistory, setShotHistory] = useLocalStorage("History",[])

    const addToShotHistory = (historyJSONobject) => {
        setShotHistory((prevHistory) => ([...prevHistory, historyJSONobject]))
    }

    return (
        <ShotHistoryContext.Provider value={[shotHhistory, addToShotHistory]}>
            {children}
        </ShotHistoryContext.Provider>
    )
}