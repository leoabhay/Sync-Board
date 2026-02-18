import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useStore } from "../store/useStore";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const {
    roomId,
    userName,
    setIsJoined,
    setUsers,
    addUser,
    removeUser,
    updateUserCursor,
  } = useStore();

  useEffect(() => {
    if (!roomId || !userName) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsJoined(false);
      }
      return;
    }

    const newSocket = io(SERVER_URL);
    setSocket(newSocket);

    newSocket.emit("join-room", { roomId, userName });
    setIsJoined(true);

    newSocket.on("room-users", (users) => {
      setUsers(users);
    });

    newSocket.on("user-joined", (user) => {
      addUser(user);
    });

    newSocket.on("user-left", (userId) => {
      removeUser(userId);
    });

    newSocket.on("cursor-move", ({ userId, cursor }) => {
      updateUserCursor(userId, cursor);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsJoined(false);
    };
  }, [roomId, userName]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};