import React, {useContext, useState} from "react";

const WeightContext = React.createContext()

export function useSensorValue() {
    return useContext(WeightContext)
}

export function WeightProvider({children}) {
    const [weight, setWeight] = useState(
        {
            currentWeight: 22.3,
            lastGrindWeight: 14.5
        }
    )

    return (
        <WeightContext.Provider value={[weight,setWeight]}>
            {children}
        </WeightContext.Provider>
    )
}