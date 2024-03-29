import express from 'express';
import bcrypt from 'bcrypt';
import { User, generateJwtToken } from '../Models/User.js';
import jwt from 'jsonwebtoken'
import { MailSender } from '../mailer.js';


let router = express.Router();

//Get Current Date
function getCurrentDate(){
    // Get current date
    let currentDate = new Date();
    // Get day, month, and year from the current date
    let day = currentDate.getDate();
    let month = currentDate.getMonth() + 1; // Note: January is 0!
    let year = currentDate.getFullYear();
    // Pad day and month with leading zeros if needed
    day = day < 10 ? "0" + day : day;
    month = month < 10 ? "0" + month : month;
    // Format the date as dd/mm/yyyy
    let date = day + "/" + month + "/" + year;
    return date;
}

//Decode Jwt Token
const decodeJwtToken = (token)=>{
    try {
        let decoded = jwt.verify(token, process.env.SECRET_KEY);
        return decoded.id
    } catch (error) {
        console.error("Error in Jwt Decodeing",error)
        return null;
    }
}

//SignUp(node)
router.post('/signup', async(req,res)=>{
    try {

        //Find User is already registered
        let user = await User.findOne({email: req.body.email});
        if(user) return res.status(400).json({message:"Email already registered"});

        //generate hashed password
        let salt = await bcrypt.genSalt(9)
        let hashedPassword = await bcrypt.hash(req.body.password,salt);

        //Add new user to DB
        let newUser = await new User({
            name: req.body.name,
            email: req.body.email,
            phone:req.body.phone,
            password: hashedPassword,
            gender: req.body.gender,
            dob:req.body.dob,
            age:req.body.age,
            City:req.body.City
        }).save();

        //generate jwtToken
        let token=generateJwtToken(newUser._id)
        res.status(200).json({message:"SignUp Successfully", token})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Login
router.post('/login', async(req,res)=>{
    try {
        //Find User is available
        let user = await User.findOne({email: req.body.email});
        if(!user) return res.status(400).json({message:"Invalid Credentials"});
        
        //Validate password
        let validatePassword = await bcrypt.compare(
            req.body.password,
            user.password
        )
        if(!validatePassword) return res.status(400).json({message:"Invalid Credentials"});

        //generate jwtToken
        let token=generateJwtToken(user._id)
        res.status(200).json({message:"Login Successfully", token})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Reset password
router.put('/reset-password', async(req,res)=>{
    try {
        //Find User is available
        let email=req.body.email
        let user = await User.findOne({email: email});
        if(!user) return res.status(400).json({message:"Invalid Credentials"});
        //generate hashed password
        let salt = await bcrypt.genSalt(9)
        let hashedPassword = await bcrypt.hash(req.body.password,salt);
        
        let updatePassword=await User.findOneAndUpdate(
            {email:email},
            {$set:{password:hashedPassword}},
            {new:true}
        )

        //generate jwtToken
        let token=generateJwtToken(user._id)
        res.status(200).json({message:"Password Reseted Successfully", token})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Set OTP password
router.put('/set-otp', async(req,res)=>{
    try {
        //Find User is available
        let email=req.body.email
        let user = await User.findOne({email: email});
        if(!user) return res.status(400).json({message:"Invalid Credentials"});
        let msg = String(Math.floor(Math.random() * (9999 - 1000)));
        let date=getCurrentDate();
        let otp = {
            value:msg,
            date:date
        }

        let updateOtp=await User.findOneAndUpdate(
            {email:email},
            {$set:{otp:otp}},
            
        )
        //console.log(updateOtp)
        let mailData={
            email:email,
            subject:"New message from Thirumana maalai Matrimony",
            message:`User one Time Password is  ${msg}, It is valid for 24 hour only`
        } 
       //Sending mail
       let mail=await MailSender({data:mailData});
        //console.log(mail)
        res.status(200).json({message:"OTP Send Successfully", otp})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Get User Data by Token
router.get('/get-user-data', async(req,res)=>{
    try {
        let token=req.headers["x-auth"]
        let userId=decodeJwtToken(token)
        let user = await User.findById({_id:userId});

        res.status(200).json({message:"User Data Got Successfully",user})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Get User Data by Email
router.get('/get-user-data-by-email', async(req,res)=>{
    try {
        let email=req.headers["email"]
        let user = await User.findOne({email:email});
        res.status(200).json({message:"User Data Got Successfully",user})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Update User Data 
router.put('/update-user-data', async(req,res)=>{
    try {
        let token=req.headers["x-auth"]
        let userId=decodeJwtToken(token)

        //Updating User Data
        let updatedUser = await User.findOneAndUpdate(
            {_id:userId},
            {$set:{
                name: req.body.name,
                phone:req.body.phone,
                City:req.body.city,
                image:req.body.image,
                education:req.body.education,
                job:req.body.job,
                motherName:req.body.motherName,
                fatherName:req.body.fatherName,
            }}
        )
        res.status(200).json({message:"User Data Updated Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Delete User 
router.delete('/delete-user', async(req,res)=>{
    try {
        let token=req.headers["x-auth"]
        let userId=decodeJwtToken(token)
        let user = await User.findByIdAndDelete({_id:userId});

        res.status(200).json({message:"User Deleted Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})


export let authRouter=router;