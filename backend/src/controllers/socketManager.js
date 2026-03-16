import { Server } from "socket.io";  

let connections = {};
let timeOnline = {};
let messages = {};

export const connectToServer = (server) => {
    const io = new Server(server, {
        cors: {                          
            origin: "*",
            methods: ["GET", "POST"],    
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {  

        socket.on("join-call", (path) => {
            if (connections[path] === undefined) {
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();  

            connections[path].forEach(ele => {   
                io.to(ele).emit("User-Joined", socket.id, connections[path]);
            });

            if (messages[path] !== undefined) {  
                messages[path].forEach(ele => {  
                    io.to(socket.id).emit(       
                        "chat-message",
                        ele['data'],
                        ele['sender'],
                        ele['socket-id-sender']
                    );
                });
            }
        });

        socket.on("signal", (toID, message) => {
            io.to(toID).emit("signal", socket.id, message);  
        });

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {  
                        return [roomKey, true];
                    }
                    return [room, isFound];                         
                }, [' ', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = [];
                }
                messages[matchingRoom].push({
                    'sender': sender,
                    'data': data,
                    'socket-id-sender': socket.id
                });
                console.log('message', matchingRoom, ":", sender, data);  

                connections[matchingRoom].forEach(ele => {               
                    io.to(ele).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date());  
            var key;

            for (const [room, person] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                person.forEach(ele => {                                 
                    if (ele === socket.id) {
                        key = room;

                        for (let a = 0; a < connections[key].length; a++) {
                            io.to(connections[key][a]).emit('user-left', socket.id);
                        }

                        var index = connections[key].indexOf(socket.id);
                        connections[key].splice(index, 1);

                        if (connections[key].length === 0) {
                            delete connections[key];
                        }
                    }
                });
            }
        });
    });

    return io;
};