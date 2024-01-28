import express from "express";
import { User } from "../Models/User.js";
import jwt from "jsonwebtoken";
import { MailSender } from "../mailer.js";

let router = express.Router();

//Decode Jwt Token
const decodeJwtToken = (token) => {
  try {
    let decoded = jwt.verify(token, process.env.SECRET_KEY);
    return decoded.id;
  } catch (error) {
    console.error("Error in Jwt Decodeing", error);
    return null;
  }
};

// Add Interested
router.put("/add-interest", async (req, res) => {
  try {
    let token = req.headers["x-auth"];
    let data = req.body.id;
    let userId = decodeJwtToken(token);

    //Function for adding interest
    async function addInterest({ sender, reciver }) {
      let user = await User.findById({ _id: sender });
      //Check if reciver is alredy exist in interested data
      if (user.invitationSent.includes(reciver)) {
        let invitationSent = user.invitationSent.filter(
          (val) => val !== reciver
        );
        await User.findOneAndUpdate(
          { _id: sender },
          { $set: { invitationSent: invitationSent } }
        );
      } else {
        let invitationGot = user.invitationGot.filter((val) => val !== reciver);
        await User.findOneAndUpdate(
          { _id: sender },
          { $set: { invitationGot: invitationGot } }
        );
      }
      let interested = [reciver, ...user.interested];
      let addInterested = await User.findOneAndUpdate(
        { _id: sender },
        { $set: { interested: interested } }
      );

      if (!addInterested)
        return res.status(400).json({ message: "Error Occured" });
    }
    //Update for sender side
    addInterest({ sender: userId, reciver: data });
    addInterest({ sender: data, reciver: userId });

    //Send Mail for message Reciver
    let mailReciever = await User.findOne({ _id: data });
    let mailsender= await User.findOne({ _id: userId });
    //Creating mail details
    let mailData = {
      email: mailReciever.email,
      subject: "Invitation Accepted from Mangalyam Matrimony",
      message: `Your Invitation had been Accepted by ${mailsender.name},Start your conversation
                with them.`,
    };
    //Sending mail
    let mail = await MailSender({ data: mailData });

    res.status(200).json({ message: "Interested added Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Remove Interested
router.put("/remove-interest", async (req, res) => {
  try {
    let token = req.headers["x-auth"];
    let data = req.body.id;
    let userId = decodeJwtToken(token);

    //Remove
    async function removeInterest({ sender, reciver }) {
      let user = await User.findById({ _id: sender });

      let interested = user.interested.filter((val) => val !== reciver);
      let addInterested = await User.findOneAndUpdate(
        { _id: sender },
        { $set: { interested: interested } }
      );

      if (!addInterested)
        return res.status(400).json({ message: "Error Occured" });
    }
    //Remove interest for sender side
    removeInterest({ sender: userId, reciver: data });
    //Remove interest for recipient side
    removeInterest({ sender: data, reciver: userId });

    res.status(200).json({ message: "Interested removed Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Get User Interested
router.get("/get-interest", async (req, res) => {
  try {
    let token = req.headers["x-auth"];
    let userId = decodeJwtToken(token);

    let otherUsers = await User.find();
    let user = await User.findById({ _id: userId });
    //filter Favourites Profiles
    let interested = otherUsers.filter((val) => {
      if (user.interested.includes(val._id)) {
        return val;
      }
    });

    res
      .status(200)
      .json({ message: "Interested Profiles Got Successfully", interested });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export let interestRouter = router;