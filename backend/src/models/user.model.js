import mongoose, {Schema} from 'mongoose';
const userschema = new Schema({
    name  : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true,
        unique  : true
    },
    password : {
        type : String,
        required : true
    },
    token : {
        type : String
    }
});

const User = mongoose.model("User",userschema);

export {User};
