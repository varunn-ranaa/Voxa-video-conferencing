import express from "express";
import mongoose from "mongoose";
import { Server } from "socket.io";
import {createServer} from "http";
import cors from "cors";

const app = express();

app.get("/home",(req,res)=>{
    res.json({"Hello" : "World"});
});

app.listen(3000,()=>{
    console.log("Listening at Port 3000....");
})