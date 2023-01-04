import React, {useContext, useEffect, useRef, useState} from "react";
import { v4 as uuidV4} from 'uuid'
import ReactDOM from 'react-dom';

const WebSocketConnectionContext = React.createContext()

// const gateway = `ws://${window.location.hostname}/ws`;
const gateway = `ws://10.0.19.23/ws`;

export function useWebSocketConnection() {
    return useContext(WebSocketConnectionContext)
}

export function WebSocketConnectionProvider({children}) {

    const [webSocketConnected, setWebSocketConnected] = useState(false)

    const subscriberList = useRef({})
    const [responseList, setResponseList] = useState({})
    const [notificationList, setNotificationList] = useState([])

    const responseListRef = useRef(responseList)
    useEffect(() => {
        responseListRef.current = responseList
    },[responseList])

    const systemTimeDelta = useRef(0)
    const websocket = useRef()
    const pingTimeout = useRef()
    const pongTimeout = useRef()

    const sendMessage = (eventType, eventSpecifier, value, callbackFunction, showSuccessNotification = false, retryIfFailed = false) => {
        const messageUuid = uuidV4()
        const message = {
            "EventType": eventType,
            "EventSpecifier": eventSpecifier,
            "value": value,
            "messageUuid": messageUuid
        }
        websocket.current.send(JSON.stringify(message))
        // console.log("Sendet websocket message:")
        // console.log(JSON.stringify(message))
        const timeoutTimer = setTimeout(()=>{messageTimeoutCallback(messageUuid)},10000)
        setResponseList(prev=>({...prev, [messageUuid]: {
            "notify": showSuccessNotification, 
            "func": callbackFunction,
            "retry": retryIfFailed,
            "message": message,
            "timer": timeoutTimer
        } }))
    }

    function messageTimeoutCallback(messageUuid) {
        if(responseListRef.current[messageUuid]) {
            const message = responseListRef.current[messageUuid].message
            notify("Received no answer from machine for event " + message.EventType + "/" + message.EventSpecifier, true)
            if(responseListRef.current[messageUuid].retry) {
                setTimeout(()=>{
                    console.log("Retrying " + message.EventType + "/" + message.EventSpecifier);
                    websocket.current.send(JSON.stringify(message))
                    const timeoutTimer = setTimeout(()=>{messageTimeoutCallback(messageUuid)},10000)
                    setResponseList(prev=>(
                        {...prev, 
                            [messageUuid]: {...prev[messageUuid], "timer": timeoutTimer}
                        }
                    ))
                },1000) // wait 1 second before retrying
            } else {
                setResponseList(prev=>{
                    const { [messageUuid]: unused, ...rest} = prev;
                    return rest;
                })
            }
        }
    }

    function connectWebSocket() {
        if(websocket.current) websocket.current.close()
        console.log('Open a WebSocket connection...');
        websocket.current = new WebSocket(gateway)
        websocket.current.onopen    = onOpen
        websocket.current.onclose   = onClose
        websocket.current.onmessage = onMessage
        websocket.current.onerror = onError
    }

    function ping() {
        if(websocket.current && websocket.current.readyState == 1) {
            websocket.current.send('__ping__')
            //console.log("sent ping")
            pongTimeout.current = setTimeout(function () {
                console.log("No pong received after Timeout!")
                setWebSocketConnected(false)
                connectWebSocket()
            }, 1500)
        } else {
            connectWebSocket()
        }
    }
    function pong() {
        clearTimeout(pongTimeout.current);
    }

    function onOpen(event) {
        console.log('Connection opened');
        console.log(event.message)
        setWebSocketConnected(true)
        if(subscriberList.current["OnConnect"] != undefined) {
            subscriberList.current["OnConnect"].forEach(callbackFunction=>{
                console.log("Callback OnConnect triggerd.")
                callbackFunction()
            })
        }
      }
    
    function onClose() {
        console.log('Connection closed')
        setResponseList({}); // clear response list
        if(subscriberList.current["OnDisconnect"] != undefined) {
            subscriberList.current["OnDisconnect"].forEach(callbackFunction=>{
                console.log("Callback OnDisconnect triggerd.")
                callbackFunction()
            })
        }
    }

    function onError(event) {
        console.log('Connection Error');
        //console.log(event)
        websocket.current.close()
    }

    function onMessage(event) {
        // console.log("Message received:")
        // console.log(event.data)
        if(event.data == '__pong__') {
            pong()
        } else {
            let ReceivedDatas = JSON.parse(event.data)
            if(ReceivedDatas) {
                ReceivedDatas.forEach(ReceivedData => {
                    if(ReceivedData.time != undefined) ReceivedData.time = ReceivedData.time + systemTimeDelta.current

                    if(ReceivedData.EventType == "SystemTime") {
                        systemTimeDelta.current = Date.now() - ReceivedData.value
                        console.log("set Machine System Time")
                    } else if(ReceivedData.EventType == "Notification") {
                        notify(ReceivedData.value)
                    } else if(ReceivedData.EventType == "Response") {
                        if(responseListRef.current[ReceivedData.messageUuid]) {
                            responseListRef.current[ReceivedData.messageUuid].func(ReceivedData) //call back
                            if(ReceivedData.error) notify(ReceivedData.error, true)
                            if(responseListRef.current[ReceivedData.messageUuid].notify && ReceivedData.value) notify(ReceivedData.value)
                            if(ReceivedData.error && responseListRef.current[ReceivedData.messageUuid].retry) {
                                setTimeout(()=>{
                                    const message = responseListRef.current[ReceivedData.messageUuid].message
                                    console.log("Retrying " + message.EventType + "/" + message.EventSpecifier);
                                    websocket.current.send(JSON.stringify(message))
                                    clearTimeout(responseListRef.current[ReceivedData.messageUuid].timer)
                                    const timeoutTimer = setTimeout(()=>{messageTimeoutCallback(ReceivedData.messageUuid)},10000)
                                    setResponseList(prev=>(
                                        {...prev, 
                                            [ReceivedData.messageUuid]: {...prev[ReceivedData.messageUuid], "timer": timeoutTimer}
                                        }
                                    ))
                                },1000)  // wait 1 second before retrying
                            } else {
                                setResponseList(prev=>{
                                    const { [ReceivedData.messageUuid]: unused, ...rest} = prev;
                                    return rest;
                                })
                            }
                        }
                        else console.log("Received Response for unknown message UUID!")
                    } else {
                        if(subscriberList.current[ReceivedData.EventType] != undefined) {
                            // console.log("Websocket: Received Eventype "+ReceivedData.EventType+", calling back subscribers...")
                            subscriberList.current[ReceivedData.EventType].forEach(callbackFunction=>{
                                callbackFunction(ReceivedData)
                                // console.log("Callback triggerd.")
                            })
                        } else {
                            console.log("Websocket: Received Eventype with no subscriber:")
                            console.log(event.data)
                        }
                    }
                })
            }
        }
    }

    function notify(message, error = false) {
        const notifyUuid = uuidV4()
        setNotificationList(prev=>[...prev,{"uuid": notifyUuid, "message": message, "error": error}])
        setTimeout(()=>{
            setNotificationList(prev=>prev.filter(el=>el.uuid!=notifyUuid))
        },2500)
    }

    function subscribeToWSevent(eventType, callbackFunction) {
        if (subscriberList.current[eventType] != undefined) {
            subscriberList.current[eventType].push(callbackFunction)
        } else {
            subscriberList.current[eventType] = [callbackFunction]
        }
        // console.log("New Subscriber to Event: "+eventType)
        // console.log("Subscriber List now is:")
        // console.log(subscriberList.current)
    }

    function unSubscribeFromWSevent(eventType, callbackFunction) {
        // find entry and delete
    }

    // Initialize
    useEffect(() => {
        if(!window.TEST_WITHOUT_ESP) {
            pingTimeout.current = setInterval(ping, 2000);
        }
        if(window.TEST_WITHOUT_ESP) {
            setInterval(()=>{
                notify("Test",false)
            },8000)
        }
    },[])

    return (
        <>
        {ReactDOM.createPortal((Object.keys(responseList).length>0 || !webSocketConnected)?<div className="loadingBar" />:"",document.getElementById("portal"))}
        {ReactDOM.createPortal(<div className="Notification">
            {notificationList.map(el=>(
                <div className={"message "+((el.error)?"error":"")} key={el.uuid}>{el.message}</div>
            ))}
        </div>,document.getElementById("portal"))}
        <WebSocketConnectionContext.Provider value={[subscribeToWSevent, sendMessage, webSocketConnected]}>
            {children}
        </WebSocketConnectionContext.Provider>
        </>
    )
}