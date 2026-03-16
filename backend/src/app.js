import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import {createServer} from "http";
import {connectToServer} from "./controllers/socketManager.js";
import cors from "cors";
import "dotenv/config";
import userRoutes from "./routes/user.routes.js"

const app = express();
const server = createServer(app);
const io = connectToServer(server);

app.set("port" , (process.env.PORT || 8000));
app.use(cors());
app.use(express.json({limit : "40kb"})); //payload maintain
app.use(express.urlencoded({limit : "40kb" , extended : "true"}));


app.use("/api/v1/user",userRoutes);

const start = async () => { 

    const connectionDb = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MONGO CONNECTED DB HOST ${connectionDb.connection.host}`);
    server.listen(app.get("port"),()=>{
       console.log(`Listening at port ${app.get("port")}`);
     });
};

start();