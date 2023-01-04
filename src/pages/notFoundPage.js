import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage()  {

    const navigate = useNavigate()

    setTimeout(()=>{
        navigate("/")
    },1000)

    return (
        <>
            <h1>Not Found</h1>
        </>
    )
}
 