import React, { createContext, useContext, useEffect, useState } from "react";


export const SocketContext = createContext();

const SocketContextProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState({
        username: "",
        group: ""
    })

    // useEffect(() => {
    //     if (authUser) {
    //         const socket = io("http://localhost:8000/", {
    //             query: {
    //                 userId: authUser.username
    //             }
    //         })
    //         setSocket(socket);
    //         return () => socket.close()
    //     } else {
    //         socket?.close();
    //         setSocket(null)
    //     }
    // }, [authUser])

    return (
        <SocketContext.Provider value={{ authUser, setAuthUser }}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContextProvider;

export const useSocketContext = () => {
    return useContext(SocketContext)
}