import { Server } from "socket.io";  

let connections = {};  //in-Memory db
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

        // 1. new user joins session 
        socket.on("join-call", (path) => {        
            if (connections[path] === undefined) { // create new session if not exists
                connections[path] = [];
            }
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();  

            connections[path].forEach(ele => {    // broadcast user join to everyone in room 
                io.to(ele).emit("User-Joined", socket.id, connections[path]);
            });

            if (messages[path] !== undefined) {  // send prev chats to new user added 
                messages[path].forEach(ele => {  
                    io.to(socket.id).emit("chat-message",ele['data'],ele['sender'],ele['socket-id-sender']
                    );
                });
            }
        });
         // 2. webrtc signalling
        socket.on("signal", (toID, message) => {  
            io.to(toID).emit("signal", socket.id, message);  
        });

        //3. in call-chat
        socket.on("chat-message", (data, sender) => { 

            const [matchingRoom, found] = Object.entries(connections) // finding room socket belong to 
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

                messages[matchingRoom].push({  // Save and broadcast the message
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
        
        //.4 user closes the tab or loses connection.
        socket.on("disconnect", () => {  
            var diffTime = Math.abs(timeOnline[socket.id] - new Date());  
            var key;
           // create deep copy of connections
            for (const [room, person] of JSON.parse(JSON.stringify(Object.entries(connections)))) 
                {
                person.forEach(ele => {
                    if (ele === socket.id) {  // found the disconnected user's room
                        key = room;

                        for (let a = 0; a < connections[key].length; a++) { // notify everyone in the room
                            io.to(connections[key][a]).emit('user-left', socket.id);
                        }

                        var index = connections[key].indexOf(socket.id); // remove this socket from the room
                        connections[key].splice(index, 1);

                        if (connections[key].length === 0) {// if room is now empty, delete it
                            delete connections[key];
                        }
                    }
                });
            }
        });
    });

    return io;
};