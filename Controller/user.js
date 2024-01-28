import express from 'express';
import { User } from '../Models/User.js';
import jwt from 'jsonwebtoken'
import { MailSender } from '../mailer.js';

let router = express.Router();

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

//Favourites
router.put('/favourites', async(req,res)=>{
    try {
        let token=req.headers["x-auth"]
        let data= req.body.id;
        let userId=decodeJwtToken(token)

        let user = await User.findById({_id:userId});
        //adding new favourites to existing fvaourites list
        let favourites=[data,...user.favourites];
        let addFavourites=await User.findOneAndUpdate(
            {_id:userId},
            {$set:{favourites:favourites}}
        )

        if(!addFavourites) return res.status(400).json({message:"Error Occured"});
        
        res.status(200).json({message:"Favourites added Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Get User Favourites
router.get('/get-favourites', async(req,res)=>{
    try {
        let token=req.headers["x-auth"]
        let userId=decodeJwtToken(token)

        let otherUsers=await User.find();
        let user = await User.findById({_id:userId});
        //filter Favourites Profiles
        let favourites=otherUsers.filter((val)=>{
            if(user.favourites.includes(val._id)){
                return val
            }
        })
        
        res.status(200).json({message:"Favourite Profiles Got Successfully",favourites})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Update Expectations
router.put('/update-expectations', async(req,res)=>{
    try {
        let token=req.headers["x-auth"]
        let data= req.body.data;
        let userId=decodeJwtToken(token)

        let UpdateExpectations=await User.findOneAndUpdate(
            {_id:userId},
            {$set:{expextations:data}}
        )

        if(!UpdateExpectations) return res.status(400).json({message:"Error Occured"});
        
        res.status(200).json({message:"Expectations Updated Successfully"})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Add Message
router.put('/message', async(req,res)=>{
    try {
        let token=req.headers["x-auth"]
        let id= req.body.id;
        let userId=decodeJwtToken(token)
        let data=req.body.data;
        let user = await User.findById({_id:userId});

        if(!user.interested.includes(id)) return res.status(400).json({message:"Reciver Unmatched"})
        //Update message function
        async function updateMessage({sender,reciver}){

            let user = await User.findById({_id:sender});
            let messageData=user.message//{id564654:[]}
            //Check if reciver is already exist
            if(messageData[reciver]){
                
                //if yes add to existing array
                let message=[...messageData[reciver],data];
                messageData[reciver]=message;
            }
            else{
                //else create one for the reciver and add data
                let message=[data]
                messageData[reciver]=message;
            }
            //Updating message Data
            let addMessage=await User.findOneAndUpdate(
                {_id:sender},
                {$set:{message:messageData}}
            )
        }
        //Update message for Sender Side
        updateMessage({sender:userId,reciver:id});
         //Update message for Reciver Side
        updateMessage({sender:id,reciver:userId})

        //Send Mail for message Reciver
        let mailReciever=await User.findOne({_id:id});
        //Creating mail details
        let mailData={
            email:mailReciever.email,
            subject:"New message from Thirumana maalai Matrimony",
            message:`Recieved a new message from ${user.name}, Please checkout in your inbox`
        } 
        //Sending mail
        let mail=await MailSender({data:mailData});
        
        res.status(200).json({message:"Message Sent Successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"});
    }
})

//Get Data Based on User Expectations;
router.get('/get-profiles', async(req,res)=>{
    try {
        let token=req.headers["x-auth"]
        let userId=decodeJwtToken(token)
        let user = await User.findById({_id:userId});
        let expextations= user.expextations;
        
        //Getting data based on User Expectations
        let profiles;
        try {
            profiles=await User.aggregate([
                {
                    $match:{
                        $and:[
                            {age:{$gte:expextations.age[0],$lte:expextations.age[1]}},
                            {City:expextations.City},
                            {gender: {$ne: user.gender}}
                        ]
                    }
                }
            ])
        } catch (error) {
            console.log(error);
            profiles=[];
        }
        //Getting All Users Data
        let otherUsers=await User.find();
        //filtering other profiles from expectations profiles
       let allProfiles = otherUsers.filter(val => {
        // Filter out profiles with the same gender as the user
        if (val.gender === user.gender) {
          return false;
        }
        else{
            return val
        }
        })
        //declaring expectation profiles as first and other profiles comes before that
        let profileData={
            profiles,
            allProfiles
        };

        res.status(200).json({message:"Profiles Got Successfully",profileData})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})

//Get Particular Profile Data 
router.get('/get-particular-profile-data', async(req,res)=>{
    try {
        let id=req.headers["id"]
        let profile = await User.findById({_id:id});

        res.status(200).json({message:"User Data Got Successfully",profile})
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal Server Error"})
    }
})


export let userRouter=router;