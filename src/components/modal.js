import ReactDOM from 'react-dom';

export default function Modal({open = true, children, onClose, className})  {

        const displayStyle = !open ? "closed" : "opened"

        return ReactDOM.createPortal(
            <>
                <div className={['modalOverlay',displayStyle].join(" ")} />
                <div className={[className,'modal',displayStyle].join(" ")}>
                    <i className="button closeButton fa-solid fa-xmark" onClick={() => {onClose()}}></i>
                    {children}
                </div>
            </>,
            document.getElementById("portal")
        )
    }