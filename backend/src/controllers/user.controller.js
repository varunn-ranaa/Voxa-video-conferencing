import {User} from '../models/user.model.js';
import httpStatus from 'http-status';
import bcrypt, {hash} from 'bcrypt';
import crypto from "crypto";


const login = async(req,res)=>{

  const {username , password } = req.body;

  if(!username ||! password){
    return res.status(400).json({message : 'Provide user cerdentials'});
  }

   try{
    const user = await User.findOne({username});

  if(!user){
    return res.status(httpStatus.NOT_FOUND).json({message : 'User not Found !'});
  }

  if(await bcrypt.compare(password, user.password)){
    let token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();
    return res.status(httpStatus.OK).json({token : token});
  }
  else{
     return res.status(httpStatus.UNAUTHORIZED).json({message : "Invalid username or password"});
  }
  }
  catch(e){
      return res.status(500).json({message : 'Something went wrong !'});
  }

}

const register = async(req,res)=>{
   const {name , username , password } = req.body;

  try{
   const existingUser = await User.findOne({username});
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

    return res.status(httpStatus.CREATED).json({message : 'User Registered !'})
  }
  catch(e){
    return res.status(500).json({message : 'Something went wrong !'});
  }
}

export {login , register};