import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {useSocket} from "../context/SocketProvider"

const LobbyScreen = () => {

    const [email, setEmail] = useState("");
    const [room, setRoom] = useState("");

    const socket = useSocket()
    const navigate = useNavigate();

    const handleSubmitForm = useCallback((e)=>{
        e.preventDefault();
        socket.emit("room:join", {email, room})
    }, [email, room, socket])

    const handleJoinRoom = useCallback((data) => {
        const {email, room} = data
        navigate(`/room/${room}`)
        console.log({email, room})
    }, [navigate])

    useEffect(()=>{
        socket.on("room:join", handleJoinRoom);
        return(()=>{
            socket.off("room:join", handleJoinRoom)
        })
    }, [socket])

    return (
        <div>
            <h1>Lobby</h1>
            <form onSubmit={handleSubmitForm}>
                <label htmlFor="email">
                    Email Id
                </label>
                <input type="email" name="" id="email" value={email} onChange={(e) => {
                    setEmail(e.target.value)
                }} style={{display: "block", padding: 3}}/>
                <br />
                <label htmlFor="room">
                    Room Number
                </label>
                <input type="text" name="" id="room" value={room} onChange={(e)=>{
                    setRoom(e.target.value)
                }} style={{display: "block", padding: 3}}/>
                <br />
                <button>Join</button>
            </form>
        </div>
    )
}

export default LobbyScreen