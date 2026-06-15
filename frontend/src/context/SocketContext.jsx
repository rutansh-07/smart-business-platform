import { createContext, useContext, useEffect, useState } from "react";
const io = window.io;

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    // Determine the backend URL: Use VITE_API_URL for Vercel production, default to localhost for dev
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    
    // Connect to Socket.IO server
    const newSocket = io(backendUrl);
    setSocket(newSocket);
    
    // Auto-join workspace room if user is logged in
    const savedUser = localStorage.getItem("smartbiz_user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.workspaceId) {
          newSocket.emit("join_workspace", user.workspaceId);
        }
      } catch (err) {
        console.error("Failed to parse user for socket", err);
      }
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Helper method to dynamically join a workspace room (e.g. after login/registration)
  const joinWorkspace = (workspaceId) => {
    if (socket && workspaceId) {
      socket.emit("join_workspace", workspaceId);
    }
  };

  const leaveWorkspace = (workspaceId) => {
    if (socket && workspaceId) {
      socket.emit("leave_workspace", workspaceId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinWorkspace, leaveWorkspace }}>
      {children}
    </SocketContext.Provider>
  );
};
