import mongoose from "mongoose";
import validator from "validator";
const messageSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength: [3, "Name must contain atleast 3 characters!"],
        maxLength: [30, "Name must contain atmost 30 characters!"]
        
    },

    email:{
        type:String,
        required:true,
        validate: [validator.isEmail, "provide a valid email"]
    },

    phone:{
        type:String,
        required:true,
        minLength: [10, "Phone Must Contain 10 digits!"],
        maxLength: [10, "Enter a Valid Number!"]
    },

    message:{
        type:String,
        required:true
    },
});

export const Message = mongoose.model("Message", volunteerSchema);
