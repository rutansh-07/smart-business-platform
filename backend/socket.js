import { Server } from "socket.io";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // Or specify your frontend URL, e.g., "http://localhost:5173"
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Clients emit this to join their specific workspace room
    socket.on("join_workspace", (workspaceId) => {
      if (workspaceId) {
        socket.join(`workspace_${workspaceId}`);
        console.log(`Socket ${socket.id} joined room workspace_${workspaceId}`);
      }
    });

    socket.on("leave_workspace", (workspaceId) => {
      if (workspaceId) {
        socket.leave(`workspace_${workspaceId}`);
        console.log(`Socket ${socket.id} left room workspace_${workspaceId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized!");
  }
  return io;
};
