import React, {createContext} from "react";
import { io } from "socket.io-client"; 
import { useMemo, useContext } from "react";

const SocketContext = createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}

export const SocketProvider = (props) => {

    const socket = useMemo(() => io('https://webrtc-server1.onrender.com'), [])
    //https://webrtc-server1.onrender.com
    //localhost:8080

    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}