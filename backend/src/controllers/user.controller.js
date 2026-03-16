import {User} from '../models/user.model.js';
import httpStatus from 'http-status';
import bcrypt, {hash} from 'bcrypt';
import crypto from "crypto";


const login = async(req,res)=>{

  const {username , password } = req.body;

  if(!username ||! password){
    return res.status(400).json({message : 'Provide user cerdentials'});
  }

  const user = await User.findOne({username});

  if(!user){
    res.status(httpStatus.NOT_FOUND).json({message : 'User not Found !'});
  }

  if(bcrypt.compare(password, user.password)){
    let token = crypto.randomBytes(20).toString("hex");

    user.token = token;
    await user.save()
    return res.status(httpStatus.OK).json({token : token});
  }

}

const register = async(req,res)=>{
   const {name , username , password } = req.body;

   const existingUser = User.findOne({username});
   if(existingUser){
       return res.status(httpStatus.FOUND).json({message : 'User Already Exists !'});
   }

   const updatedPass =  await bcrypt.hash(password,10);

   const newUser = new User({
     name : name,
     username : username,
     password : updatedPass
   });

   await newUser.save();

   res.status(httpStatus.CREATED).json({message : 'User Registered !'})

}

export {login , register};