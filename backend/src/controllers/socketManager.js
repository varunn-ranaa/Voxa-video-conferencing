import { Server } from "socket.io";

export const connectToServer =  (server)=>{
    const io = new Server(server)
    return io;
};
