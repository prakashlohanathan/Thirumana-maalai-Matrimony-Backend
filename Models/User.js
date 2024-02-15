import mongoose from 'mongoose';
import jwt from "jsonwebtoken";

let userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true,
        },
        phone:{
            type:Number,
            required:true,
        },
        favourites:{
            type:Array,
            default:[]
        },
        gender:{
            type:String,
            required:true,
        },
        dob:{
            type:String,
            required:true,
        },
        age:{
            type:Number,
            required:true,
        },
        education:{
            type:String,
            default:""
        },
        job:{
            type:String,
            default:""
        },
        fatherName:{
            type:String,
            default:""
        },
        motherName:{
            type:String,
            default:""
        },
        City:{
            type:String,
        },
        expextations:{
            type:Object,
            default:{}
        },
        interested:{
            type:Array,
            default:[]
        },
        invitationSent:{
            type:Array,
            default:[]
        },
        invitationGot:{
            type:Array,
            default:[]
        },
        message:{
            type:Object,
            default:{}
        },
        image:{
            type:String,
            default:""
        },
        otp:{
            type:Object,
            default:{}
        },
    }
)

// Generate Jwt Tokwen
let generateJwtToken = (id)=>{
    return jwt.sign({id},process.env.SECRET_KEY)
}

let User = mongoose.model("User", userSchema);
export {User,generateJwtToken}