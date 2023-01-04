import { useState, useEffect } from "react"

const AppKeyPrefix = "Er32-"

function getSavedValue(key, initialValue) {
    const savedValue = JSON.parse(localStorage.getItem(key))
    if(savedValue) return savedValue

    if(initialValue instanceof Function) return initialValue()
    return initialValue
}

export default function useLocalStorage(key, initialValue) {
    const[value, setValue] = useState(() => {
        return getSavedValue(AppKeyPrefix+key, initialValue)
    })

    useEffect(() => {
        localStorage.setItem(AppKeyPrefix+key, JSON.stringify(value))
    }, [value])

    return [value, setValue]
}