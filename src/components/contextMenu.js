import { useEffect } from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';

export default function ContextMenu({open = true, children, onClose, className, openDirectionOrigin, offsetX="0pt", offsetY="0pt", positionGlobal=false, blurBackground=false})  {

    //openDirectionOrigin top left, top right, bottom left, bottom right

    const [displayStyle, setDisplayStyle] = useState()
    useEffect(() => {
        setDisplayStyle(!open ? "closed" : "opened")
    },[open])

    const [positionStyle, setPositionStyle] = useState()
    useEffect(() => {
        switch (openDirectionOrigin) {
            case "top left": 
            setPositionStyle({    
                    top: !positionGlobal ? "100%" : 0, 
                    left: 0,
                    transformOrigin: openDirectionOrigin,
                    marginLeft: offsetX,
                    marginTop: offsetY
                })
                break
            case "top right":
                setPositionStyle({     
                    top: !positionGlobal ? "100%" : 0, 
                    right: 0,
                    transformOrigin: openDirectionOrigin,
                    marginRight: offsetX,
                    marginTop: offsetY
                })
                break
            case "bottom left":
                setPositionStyle({   
                    bottom: !positionGlobal ? "100%" : 0, 
                    left: 0,
                    transformOrigin: openDirectionOrigin,
                    marginLeft: offsetX,
                    marginBottom: offsetY
                })
                break
            case "bottom right":
                setPositionStyle({   
                    bottom: !positionGlobal ? "100%" : 0, 
                    right: 0,
                    transformOrigin: openDirectionOrigin,
                    marginRight: offsetX,
                    marginBottom: offsetY
                })
                break
        }
    },[openDirectionOrigin])

    const contextMenu = (
        <div className={[className,'contextMenu',displayStyle].join(" ")} style={positionStyle}>
            {children}
        </div>
    )
    
    return (
        <>
            {ReactDOM.createPortal(<div className={['contextOverlay',displayStyle,blurBackground?"blurBackground":""].join(" ")}  onClick={(e) => {e.stopPropagation();onClose()}} />,document.getElementById("portal"))}
            {positionGlobal ? ReactDOM.createPortal(contextMenu,document.getElementById("portal")) : contextMenu}
        </>
    )
}