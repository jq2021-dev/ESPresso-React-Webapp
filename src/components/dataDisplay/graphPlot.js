import React, { useState, useRef, useEffect } from 'react';
import { useAppSettings } from '../../contexts/LocalStorageContext/appSettingsContext';
import { useMachineState } from '../../contexts/webSocketContext/machineStateContext';
import { useWebSocketConnection } from '../../contexts/webSocketContext/webSocketConnection';

function hex2rgba(hex, alpha = 1) {
    const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    return `rgba(${r},${g},${b},${alpha})`;
}
function fillRoundedRectangle(ctx, x, y, w, h, r, color) {
    w = w*devicePixelRatio
    h = h*devicePixelRatio
    r = r*devicePixelRatio
    let path = new Path2D()
    path.moveTo(x-w/2+r,y-h/2)
    path.lineTo(x+w/2-r,y-h/2)
    path.arcTo(x+w/2,y-h/2,x+w/2,y-h/2+r,r)
    path.lineTo(x+w/2,y+h/2-r)
    path.arcTo(x+w/2,y+h/2,x+w/2-r,y+h/2,r)
    path.lineTo(x-w/2+r,y+h/2)
    path.arcTo(x-w/2,y+h/2,x-w/2,y+h/2-r,r)
    path.lineTo(x-w/2,y-h/2+r)
    path.arcTo(x-w/2,y-h/2,x-w/2+r,y-h/2,r)
    ctx.fillStyle = color
    ctx.fill(path)
}
function fillTriangle(ctx, x, y, w, h, color, upsidedown = false) {
    const flipMultiplier = upsidedown ? -1 : 1
    w = w*devicePixelRatio
    h = h*devicePixelRatio
    let path = new Path2D()
    path.moveTo(x,y)
    path.lineTo(x+w/2,y+h*flipMultiplier)
    path.lineTo(x-w/2,y+h*flipMultiplier)
    path.lineTo(x,y)
    ctx.fillStyle = color
    ctx.fill(path)
}

const axisAreaHeight = 25 * devicePixelRatio
const axisBoundOffset = 20 * devicePixelRatio
const axisTickMarkHeight = 2 * devicePixelRatio
const axisLabelOffset = 10 * devicePixelRatio
const lastShotOpacity = 0.3

export default function GraphPlot({
                            moveGraphWithTime=false,
                            graphTimeOffset=0,
                            graphState="Past",
                            pastDataTime=300,
                            highlightSinglePhase = null,
                            zoomSinglePhase = null,
                            highlightControlId = null,
                            highlightTerminationId = null,
                            gridTimeAxis=10,
                            plotSensorValues = false,
                            sensorValues,
                            plotExtractionProfile = false,
                            activeProfile,
                            plotLastShot = false,
                            lastShotData,
                            plotMouseLine = false,
                            setMouseTime,
                            setMouseValueLeft,
                            setMouseValueRight,
                            className,
                            children
                                }) {

    const canvasRef = useRef()

    const [appSettings, setAppSettings, sensorSettings] = useAppSettings()
    const [machineState,setMachineState, prevMachineState] = useMachineState()
    const [subscribeToWSevent, sendMessage, webSocketConnected] = useWebSocketConnection()

    const activeProfileRef = useRef(activeProfile)
    useEffect(() => {
        activeProfileRef.current = activeProfile
    },[activeProfile])

    const [toggleRedraw, setToggleRedraw] = useState(true)
    const now = useRef(0)
    const lastAnimationTimeStep = useRef()
    const animationTimeStamp = useRef()
    const animationStartTimeDelta = useRef()
    const calibrateTimeStamp = useRef(true)
    const bounds = useRef()
    const mouseStart = useRef({x:-1, y:-1})
    const mousePosition = useRef(-1)
    const siteWasHidden = useRef(false)

    function xplot(x) {
        return  Math.round( (x - bounds.current.boundXmin) / (bounds.current.boundXmax - bounds.current.boundXmin) * canvasRef.current.width + 0.5) - 0.5
        //return  ( (x - bounds.current.boundXmin) / (bounds.current.boundXmax - bounds.current.boundXmin) * canvasRef.current.width)
    }

    function yplot(y,ymax,ymin) {
        let height = canvasRef.current.height - axisAreaHeight
        return  height - (Math.round( (y - ymin) / (ymax - ymin) * height + 0.5) - 0.5)
    }

    function drawAxis(ctx)  {
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.strokeStyle = appSettings.theme=="dark"?"#fff":"#000"
        ctx.fillStyle = appSettings.theme=="dark"?"#fff":"#000"
        let xAxisY = Math.round((canvasRef.current.height - axisBoundOffset) + 0.5) - 0.5
        ctx.moveTo(0, xAxisY)
        ctx.lineTo(canvasRef.current.width, xAxisY)
        ctx.font = 8 * devicePixelRatio + "px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline ="middle"
        let gridLines
        switch(graphState) {
            case "Past":
                gridLines = Math.min(Math.ceil(pastDataTime / gridTimeAxis) + 10,100)
                for (let i = 0; i < gridLines; i++) {
                    let xpos = now.current - i * gridTimeAxis * 1000
                    ctx.moveTo(xplot(xpos), canvasRef.current.height - axisBoundOffset + axisTickMarkHeight)
                    ctx.lineTo(xplot(xpos), canvasRef.current.height - axisBoundOffset - axisTickMarkHeight)
                    ctx.fillText("-" + i * gridTimeAxis + " s",xplot(xpos), canvasRef.current.height - axisLabelOffset)
                }
                break;
            case "Extraction":
                gridLines = Math.min(Math.ceil((bounds.current.boundXmax-bounds.current.boundXmin) / (gridTimeAxis*1000)),100)
                for (let i = 0; i < gridLines; i++) {
                    let xpos
                    if(machineState.state === "Extraction") {
                        xpos = machineState.extractionStartTime + i * gridTimeAxis * 1000
                    } else {
                        xpos = now.current + i * gridTimeAxis * 1000
                    }
                    ctx.moveTo(xplot(xpos), canvasRef.current.height - axisBoundOffset + axisTickMarkHeight)
                    ctx.lineTo(xplot(xpos), canvasRef.current.height - axisBoundOffset - axisTickMarkHeight)
                    ctx.fillText(i * gridTimeAxis + " s",xplot(xpos), canvasRef.current.height - axisLabelOffset)
                }
                break;
        }
        ctx.stroke()
    }

    function drawSensorLines(ctx) {
        sensorValues.forEach(sensorValue => {
            ctx.beginPath()
            ctx.lineWidth = sensorSettings[sensorValue.id].lineStyle.lineWidth * devicePixelRatio
            ctx.strokeStyle = sensorSettings[sensorValue.id].lineStyle.lineColor
            ctx.lineJoin = sensorSettings[sensorValue.id].lineStyle.lineJoints
            ctx.setLineDash([])
            // let yValuePlotMax = sensorValue.yValueMax + (sensorValue.yValueMax-sensorValue.yValueMin)*0.05
            // let yValuePlotMin = sensorValue.yValueMin - (sensorValue.yValueMax-sensorValue.yValueMin)*0.1
            let first
            for (let i = 1; i < sensorValue.x.length; i++) {
                if(sensorValue.x[i] > bounds.current.boundXmin) {
                    ctx.moveTo(
                        xplot(sensorValue.x[i]),
                        yplot(sensorValue.y[i],sensorSettings[sensorValue.id].yValueMax,sensorSettings[sensorValue.id].yValueMin))
                    first = i
                    break
                }
            }
            for (let i = first+1; i < sensorValue.x.length; i++) {
                if(sensorValue.x[i] < bounds.current.boundXmax) {
                    ctx.lineTo(
                        xplot(sensorValue.x[i]),
                        yplot(sensorValue.y[i],sensorSettings[sensorValue.id].yValueMax,sensorSettings[sensorValue.id].yValueMin))
                    }
            }
            ctx.stroke()
            if(sensorSettings[sensorValue.id].lineStyle.circleRadius !== 0) {
                let i = sensorValue.x.length-1
                if(sensorValue.y[i] < sensorSettings[sensorValue.id].yValueMax) {
                    if(sensorValue.y[i] < sensorSettings[sensorValue.id].yValueMin) {
                        fillTriangle(ctx, 
                            xplot(sensorValue.x[i]), 
                            yplot(sensorSettings[sensorValue.id].yValueMin,sensorSettings[sensorValue.id].yValueMax,sensorSettings[sensorValue.id].yValueMin),
                            10, 10, sensorSettings[sensorValue.id].lineStyle.lineColor, true)
                    } else {
                        ctx.fillStyle = sensorSettings[sensorValue.id].lineStyle.lineColor
                        //for (let i = 1; i < sensorValue.data.x.length; i++) {
                        ctx.beginPath()
                        ctx.arc(
                            xplot(sensorValue.x[i]),
                            yplot(sensorValue.y[i],sensorSettings[sensorValue.id].yValueMax,sensorSettings[sensorValue.id].yValueMin),
                            sensorSettings[sensorValue.id].lineStyle.circleRadius * devicePixelRatio, 
                            0, 
                            2 * Math.PI)
                        ctx.fill()
                        //}
                    }
                } else {
                    fillTriangle(ctx, 
                        xplot(sensorValue.x[i]), 
                        0,
                        10, 10, sensorSettings[sensorValue.id].lineStyle.lineColor)
                }
            }
        })
    }

    function drawLastShot(ctx) {
        let deltax = (machineState.state === "Extraction" ? machineState.extractionStartTime : now.current) - lastShotData.date

        lastShotData.data.forEach(sensorValue => {
            ctx.beginPath()
            ctx.lineWidth = sensorSettings[sensorValue.id].lineStyle.lineWidth * devicePixelRatio
            ctx.strokeStyle = hex2rgba(sensorSettings[sensorValue.id].lineStyle.lineColor,lastShotOpacity)
            ctx.lineJoin = sensorSettings[sensorValue.id].lineStyle.lineJoints
            ctx.setLineDash([])

            ctx.moveTo(
                xplot(sensorValue.x[0]+deltax),
                yplot(sensorValue.y[0],sensorSettings[sensorValue.id].yValueMax,sensorSettings[sensorValue.id].yValueMin))
            for (let i = 1; i < sensorValue.x.length; i++) {
                if(sensorValue.x[i] < bounds.current.boundXmax) {
                    ctx.lineTo(
                        xplot(sensorValue.x[i]+deltax),
                        yplot(sensorValue.y[i],sensorSettings[sensorValue.id].yValueMax,sensorSettings[sensorValue.id].yValueMin))
                    }
            }
            ctx.stroke()
        })
    }

    function drawExtractionTime(ctx) {
        if(graphState == "Extraction" && machineState.state == "Extraction") {
            ctx.font = 10 * devicePixelRatio + "px Arial"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            fillRoundedRectangle(ctx, xplot(now.current), canvasRef.current.height - axisLabelOffset, 35, 15, 5, "#009cff")
            ctx.fillStyle = "white"
            ctx.fillText((Math.floor((now.current-machineState.extractionStartTime)/100)/10).toFixed(1) + " s",xplot(now.current), canvasRef.current.height - 10 * devicePixelRatio)
        }
    }

    function drawProfile(ctx) {
        let currentPhaseStart = machineState.state == "Extraction" ? machineState.extractionStartTime : now.current
        for (let iphase = 0; iphase < activeProfile.phases.length; iphase++) {
            const phase = activeProfile.phases[iphase]
            let opacityFactor = (highlightSinglePhase != null) ? ((iphase==highlightSinglePhase.current) ? 1 : 0.5) : (!webSocketConnected ? 0.3 : 1)

            let currentPhaseControlLength = 2000
            for (let i = 0; i < phase.termination.length; i++) {
                if(phase.termination[i].controlValueId == "time") {
                    currentPhaseControlLength = phase.termination[i].terminationValue * 1000
                    break
                }
            }
            let xend = (machineState.extractionPhaseFinishedTimes != undefined) ? machineState.extractionPhaseFinishedTimes[iphase] : currentPhaseStart + currentPhaseControlLength

            // draw Termination Areas
            ctx.font = 10 * devicePixelRatio + "px Arial"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"

            for (let itermination = 0; itermination < phase.termination.length; itermination++) {
                const termination = phase.termination[itermination];
                if(termination.controlValueId != "time") {
                    let color = hex2rgba(sensorSettings[termination.controlValueId].lineStyle.lineColor,0.2*opacityFactor)
                    let textColor = hex2rgba(sensorSettings[termination.controlValueId].lineStyle.lineColor, webSocketConnected?1:0.2)
                    let gradient
                    let ystart
                    let yend
                    switch(termination.terminationType) {
                        case "greaterThan":
                            yend = 0
                            ystart = yplot(termination.terminationValue,sensorSettings[termination.controlValueId].yValueMax,sensorSettings[termination.controlValueId].yValueMin)
                            gradient = ctx.createLinearGradient(0,ystart,0,yend)
                            gradient.addColorStop(0,color)
                            gradient.addColorStop(1,"rgba(0,0,0,0)")
                            ctx.fillStyle = gradient
                            ctx.fillRect(xplot(currentPhaseStart),yend,xplot(xend)-xplot(currentPhaseStart),ystart)
                            ctx.fillStyle = textColor
                            ctx.fillText(sensorSettings[termination.controlValueId].sensorName,xplot((currentPhaseStart+xend)/2),ystart-15*devicePixelRatio)
                            ctx.fillText("Termination",xplot((currentPhaseStart+xend)/2),ystart-5*devicePixelRatio)
                            break
                        case "lessThan":
                            ystart = yplot(termination.terminationValue,sensorSettings[termination.controlValueId].yValueMax,sensorSettings[termination.controlValueId].yValueMin)
                            yend = yplot(0,sensorSettings[termination.controlValueId].yValueMax,sensorSettings[termination.controlValueId].yValueMin)
                            gradient = ctx.createLinearGradient(0,ystart,0,yend)
                            gradient.addColorStop(0,color)
                            gradient.addColorStop(1,"rgba(0,0,0,0)")
                            ctx.fillStyle = gradient
                            ctx.fillRect(xplot(currentPhaseStart),ystart,xplot(xend)-xplot(currentPhaseStart),yend-ystart)
                            ctx.fillStyle = textColor
                            ctx.fillText(sensorSettings[termination.controlValueId].sensorName,xplot((currentPhaseStart+xend)/2),ystart+5*devicePixelRatio)
                            ctx.fillText("Termination",xplot((currentPhaseStart+xend)/2),ystart+15*devicePixelRatio)
                            break
                    }
                    if(highlightTerminationId != null && iphase==highlightSinglePhase.current && highlightTerminationId==termination.controlValueId) {
                        ctx.fillStyle = sensorSettings[termination.controlValueId].lineStyle.lineColor
                        ctx.beginPath()
                        ctx.arc(xplot(currentPhaseStart),ystart,5*devicePixelRatio,0,2*Math.PI)
                        ctx.arc(xplot(xend),ystart,5*devicePixelRatio,0,2*Math.PI)
                        ctx.fill()
                    }
                }
            }
            // draw control phases
            for (let icontrol = 0; icontrol < phase.control.length; icontrol++) {
                const control = phase.control[icontrol];
                ctx.beginPath()
                ctx.setLineDash(sensorSettings[control.controlValueId].lineStyle.lineDash)
                ctx.lineWidth = sensorSettings[control.controlValueId].lineStyle.lineWidth * devicePixelRatio
                ctx.strokeStyle = hex2rgba(sensorSettings[control.controlValueId].lineStyle.lineColor,opacityFactor)
                ctx.lineJoin = sensorSettings[control.controlValueId].lineStyle.lineJoints

                ctx.moveTo(xplot(currentPhaseStart),yplot(control.targetValueBegin,sensorSettings[control.controlValueId].yValueMax,sensorSettings[control.controlValueId].yValueMin))
                
                if(machineState.extractionPhaseFinishedTimes != undefined) {
                    if(xend < currentPhaseStart + currentPhaseControlLength) {
                        let yend = (xend-currentPhaseStart)/currentPhaseControlLength * (control.targetValueEnd-control.targetValueBegin) + control.targetValueBegin
                        ctx.lineTo(xplot(xend),yplot(yend,sensorSettings[control.controlValueId].yValueMax,sensorSettings[control.controlValueId].yValueMin))
                    } else {
                        ctx.lineTo(xplot(currentPhaseStart + currentPhaseControlLength),yplot(control.targetValueEnd,sensorSettings[control.controlValueId].yValueMax,sensorSettings[control.controlValueId].yValueMin))
                        ctx.lineTo(xplot(xend),yplot(control.targetValueEnd,sensorSettings[control.controlValueId].yValueMax,sensorSettings[control.controlValueId].yValueMin))
                    }
                } else {
                    ctx.lineTo(xplot(xend),yplot(control.targetValueEnd,sensorSettings[control.controlValueId].yValueMax,sensorSettings[control.controlValueId].yValueMin))
                }
                ctx.stroke()
                if(highlightControlId != null && iphase==highlightSinglePhase.current && highlightControlId==phase.control[icontrol].controlValueId) {
                    ctx.fillStyle = ctx.strokeStyle
                    ctx.beginPath()
                    ctx.arc(xplot(currentPhaseStart),yplot(control.targetValueBegin,sensorSettings[control.controlValueId].yValueMax,sensorSettings[control.controlValueId].yValueMin),5*devicePixelRatio,0,2*Math.PI)
                    ctx.arc(xplot(xend),yplot(control.targetValueEnd,sensorSettings[control.controlValueId].yValueMax,sensorSettings[control.controlValueId].yValueMin),5*devicePixelRatio,0,2*Math.PI)
                    ctx.fill()
                }
            }

            ctx.beginPath()
            ctx.lineWidth = 1
            ctx.strokeStyle = "#aaa"
            ctx.setLineDash([25,25])
            ctx.moveTo(xplot(xend), 0)
            ctx.lineTo(xplot(xend), canvasRef.current.height)
            ctx.stroke()

            ctx.font = 10 * devicePixelRatio + "px Arial"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillStyle = "#6f7687"
            ctx.fillText(phase.name,xplot((xend+currentPhaseStart)/2),canvasRef.current.height - 30*devicePixelRatio)

            currentPhaseStart = xend
        }
    }

    function drawMousePosLine(ctx) {
        let x = Math.round(mousePosition.current + 0.5) - 0.5
        ctx.beginPath()
        ctx.lineWidth = 1
        ctx.strokeStyle = "#aaa"
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasRef.current.height)
        ctx.stroke()
    }

    function getEstimatedPhaseLength(iPhase) {
        const phase = activeProfileRef.current.phases[iPhase]
        let phaselength = 0
        if(highlightSinglePhase == null && machineState.extractionPhaseFinishedTimes && machineState.extractionPhaseFinishedTimes[iPhase] != undefined) {
            phaselength = (iPhase == 0) ? machineState.extractionPhaseFinishedTimes[iPhase] - machineState.extractionStartTime : machineState.extractionPhaseFinishedTimes[iPhase]-machineState.extractionPhaseFinishedTimes[iPhase-1]
        } else {
            phase.termination.forEach(termination => {
                if(termination.controlValueId == "time") {
                    phaselength = termination.terminationValue*1000
                }
            })
        }
        return (phaselength > 0 ? phaselength : 2000)
    }

    function getEstimatedProfileExecutionTime() {
        if(activeProfile == undefined) return 30000
        let length = 0
        for (let iPhase = 0; iPhase < activeProfile.phases.length; iPhase++) {
            length+=getEstimatedPhaseLength(iPhase)
        }
        return length
    }

    function moveGraphBounds(fast = false) {
        let boundXmaxGoal
        let boundXminGoal
        switch(graphState) {
            case "Past":
                boundXmaxGoal = now.current + 1000
                boundXminGoal = now.current - (pastDataTime*1000) - 1000
                break;
            case "Extraction":
                let EstimatedProfileExecutionTime = getEstimatedProfileExecutionTime()
                if(machineState.state === "Extraction" && machineState.extractionStartTime != undefined) {
                    boundXmaxGoal = Math.max(now.current + 1000,machineState.extractionStartTime + EstimatedProfileExecutionTime + 1000)
                    boundXminGoal = machineState.extractionStartTime - 500
                }
                else {
                    boundXmaxGoal = now.current + EstimatedProfileExecutionTime + 1000
                    boundXminGoal = now.current - 500
                }
                if(zoomSinglePhase != null && zoomSinglePhase.current && highlightSinglePhase != null) {
                    let start = now.current
                    if(highlightSinglePhase.current != 0) {
                        for (let iPhase = 0; iPhase < highlightSinglePhase.current; iPhase++) {
                            start+=getEstimatedPhaseLength(iPhase)
                        }
                    }
                    let end = start + getEstimatedPhaseLength(highlightSinglePhase.current)
                    boundXmaxGoal = end + 1000
                    boundXminGoal = start - 1200
                }
                break;
        }

        if(mousePosition.current === -1 || (graphState == "Extraction" && machineState.state != "Extraction")) {
            if(!fast && bounds.current && lastAnimationTimeStep.current != undefined) {
                if(moveGraphWithTime) {
                    bounds.current = {
                        boundXmax: bounds.current.boundXmax+lastAnimationTimeStep.current + (boundXmaxGoal - bounds.current.boundXmax) * 0.01 * lastAnimationTimeStep.current,
                        boundXmin: bounds.current.boundXmin+lastAnimationTimeStep.current + (boundXminGoal - bounds.current.boundXmin) * 0.01 * lastAnimationTimeStep.current
                    }
                } else {
                    bounds.current = {
                        boundXmax: bounds.current.boundXmax + (boundXmaxGoal - bounds.current.boundXmax) * 0.01 * lastAnimationTimeStep.current,
                        boundXmin: bounds.current.boundXmin + (boundXminGoal - bounds.current.boundXmin) * 0.01 * lastAnimationTimeStep.current
                    }
                }
            } else {
                bounds.current = {
                    boundXmax: boundXmaxGoal,
                    boundXmin: boundXminGoal
                }
            }
        }
    }

    // Fast Graphbound move on end of extraction
    useEffect(() => {
        if(machineState.state != "Extraction" && prevMachineState.current && prevMachineState.current.state == "Extraction") {
            moveGraphBounds(true)
        }
    },[machineState])

    // Start Animation Interval
    useEffect(() => {
        let timerId
        const animate = (timestamp) => {
            lastAnimationTimeStep.current = timestamp - animationTimeStamp.current
            animationTimeStamp.current = timestamp
            if (calibrateTimeStamp.current) {
                animationStartTimeDelta.current = animationTimeStamp.current-Date.now()
                calibrateTimeStamp.current = false
            }
            if(moveGraphWithTime) {
                now.current = animationTimeStamp.current-animationStartTimeDelta.current + graphTimeOffset
            } else {
                now.current = graphTimeOffset
            }
            setToggleRedraw(c => !c)
            timerId = requestAnimationFrame(animate)
        }
        timerId = requestAnimationFrame(animate)

        // Interval calibrateAnimationTime
        const calibrateInterval = setInterval(() => {
            calibrateTimeStamp.current = true
        }, 5000);

        return () => {
            cancelAnimationFrame(timerId)
            clearInterval(calibrateInterval)
        }
    }, [])

    // Draw Graph on each frame
    useEffect(() => {
        canvasRef.current.width = canvasRef.current.clientWidth * devicePixelRatio
        canvasRef.current.height = canvasRef.current.clientHeight * devicePixelRatio
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height)

        if(animationTimeStamp.current && !document.hidden) {
            
            if(siteWasHidden.current) {
                moveGraphBounds(true)
                siteWasHidden.current = false
            } else {
                moveGraphBounds()
            }
            drawAxis(ctx)
            if(graphState == "Extraction") {
                if(plotLastShot && lastShotData && machineState.state != "Extraction")
                    drawLastShot(ctx)
                if(activeProfile != undefined && plotExtractionProfile)
                    drawProfile(ctx)
            }
            if(plotSensorValues)
                drawSensorLines(ctx)
                
            drawExtractionTime(ctx)

            if(setMouseTime) {
                if(mousePosition.current == -1) {
                    setMouseTime(-1)
                }
                else {
                    setMouseTime(mousePosition.current/canvasRef.current.width * (bounds.current.boundXmax-bounds.current.boundXmin) + bounds.current.boundXmin)
                }
            }
            
            if(plotMouseLine)
                drawMousePosLine(ctx)
        } else {
            siteWasHidden.current = true
        }
    }, [toggleRedraw])

    // Initialize Event Listeners
    useEffect(() => {

        // Mouse Mouve Events
        function handleMouseMove(x,y) {
            const rect = canvasRef.current.getBoundingClientRect()
            x = (x - rect.left)*devicePixelRatio
            y = (y - rect.top)*devicePixelRatio
            mousePosition.current = x
            // if(mouseStart.current.y != -1 && setMouseValueLeft instanceof Function && setMouseValueRight instanceof Function) {
            //     if(x/canvasRef.current.width <= 0.5)
            //         setMouseValueLeft(y/(canvasRef.current.height-axisAreaHeight))
            //     else
            //         setMouseValueRight(y/(canvasRef.current.height-axisAreaHeight))
            // }
            let xDecideLeftRight = 0
            if(highlightSinglePhase != null) {
                for (let iPhase = 0; iPhase <= highlightSinglePhase.current; iPhase++) {
                    if(iPhase == highlightSinglePhase.current) { xDecideLeftRight+=getEstimatedPhaseLength(iPhase)/2; break }
                    xDecideLeftRight+=getEstimatedPhaseLength(iPhase)
                }
                xDecideLeftRight = xplot(xDecideLeftRight)
            } else {
                xDecideLeftRight = 0.5*canvasRef.current.width
            } 
            if(mouseStart.current.y != -1 && setMouseValueLeft instanceof Function && setMouseValueRight instanceof Function) {
                if(x <= xDecideLeftRight) {
                    setMouseValueLeft((y/(canvasRef.current.height-axisAreaHeight)))
                } else {
                    setMouseValueRight(y/(canvasRef.current.height-axisAreaHeight))
                }
            }
        }
        function setMouseStart(x,y) {
            const rect = canvasRef.current.getBoundingClientRect()
            x = x - rect.left
            y = y - rect.top
            mouseStart.current.x = x/(canvasRef.current.width)
            mouseStart.current.y = y/(canvasRef.current.height-axisAreaHeight)
        }
        canvasRef.current.addEventListener('mousemove', (e) => {
            e.preventDefault()
            handleMouseMove(e.clientX,e.clientY)
        })
        canvasRef.current.addEventListener('touchmove', (e) => {
            e.preventDefault()
            handleMouseMove(e.touches[0].clientX,e.touches[0].clientY)
        })
        canvasRef.current.addEventListener('touchstart', (e) => {
            e.preventDefault()
            handleMouseMove(e.touches[0].clientX,e.touches[0].clientY)
            setMouseStart(e.touches[0].clientX,e.touches[0].clientY)
        })
        canvasRef.current.addEventListener('mousedown', (e) => {
            e.preventDefault()
            handleMouseMove(e.clientX,e.clientY)
            setMouseStart(e.clientX,e.clientY)
        })

        // Mouse Leave events
        function handleMouseLeave(e) {
            mousePosition.current = -1
            mouseStart.current.x = -1
            mouseStart.current.y = -1
            if(setMouseValueLeft instanceof Function)
                setMouseValueLeft(-1)
            if(setMouseValueRight instanceof Function)
            setMouseValueRight(-1)
        }
        canvasRef.current.addEventListener('mouseleave', handleMouseLeave)
        canvasRef.current.addEventListener('mouseup', handleMouseLeave)
        canvasRef.current.addEventListener('touchend', handleMouseLeave)

      }, [])

    const canvasStyle =  {
        width: "100%",
        height: "100%"
    }

    return (
        <div className={'GraphPlot '+className}>
            <canvas style={canvasStyle} ref={canvasRef} />
            {children}
        </div>
    )
}