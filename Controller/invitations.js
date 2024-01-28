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

//Get User Invitations Data
router.get("/get-invitations", async (req, res) => {
  try {
    let token = req.headers["x-auth"];
    let userId = decodeJwtToken(token);

    let otherUsers = await User.find();
    let user = await User.findById({ _id: userId });
    //filter Invitation Sent Profiles
    let invitationSent = otherUsers.filter((val) => {
      if (user.invitationSent.includes(val._id)) {
        return val;
      }
    });
    //filter Invitation Got Profiles
    let invitationGot = otherUsers.filter((val) => {
      if (user.invitationGot.includes(val._id)) {
        return val;
      }
    });
    let invitations = {
      invitationSent,
      invitationGot,
    };

    res
      .status(200)
      .json({ message: "Interested Profiles Got Successfully", invitations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Invitation Sent
router.put("/sent", async (req, res) => {
  try {
    let token = req.headers["x-auth"];
    let data = req.body.id;
    let userId = decodeJwtToken(token);
    //Getting user data
    let user = await User.findById({ _id: userId });
    if (user.interested.includes(data)) {
      return res
        .status(400)
        .json({ message: "Profile Already in Interested List" });
    }

    let invitationSent = [data, ...user.invitationSent];
    // Update invitation sent for sender side
    let addInvitationSent = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { invitationSent: invitationSent } }
    );
    if (!addInvitationSent)
      return res.status(400).json({ message: "Error Occured" });
    //Getting reciver data
    let profile = await User.findById({ _id: data });
    let invitationGot = [userId, ...profile.invitationGot];
    //Updating invitationsGot for reciver side
    let addInvitationGot = await User.findOneAndUpdate(
      { _id: data },
      { $set: { invitationGot: invitationGot } }
    );
    if (!addInvitationGot)
      return res.status(400).json({ message: "Error Occured" });

    //Send Mail for message Reciver
    let mailReciever = await User.findOne({ _id: data });
    //Creating mail details
    let mailData = {
      email: mailReciever.email,
      subject: "New Invitation from Mangalyam Matrimony",
      message: `Recieved a new Invitation from ${user.name}, Please checkout in your Portal`,
    };
    //Sending mail
    let mail = await MailSender({ data: mailData });

    res.status(200).json({ message: "Invitation Sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Invitation Delete from user Side
router.put("/delete-user-side", async (req, res) => {
  try {
    let token = req.headers["x-auth"];
    let data = req.body.id;
    let userId = decodeJwtToken(token);
    //Getting user data
    let user = await User.findById({ _id: userId });
    let invitationSent = user.invitationSent.filter((val) => val !== data);
    // Update invitation sent for sender side
    let addInvitationSent = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { invitationSent: invitationSent } }
    );
    if (!addInvitationSent)
      return res.status(400).json({ message: "Error Occured" });
    //Getting reciver data
    let profile = await User.findById({ _id: data });
    let invitationGot = profile.invitationGot.filter((val) => val !== userId);
    //Updating invitationsGot for reciver side
    let addInvitationGot = await User.findOneAndUpdate(
      { _id: data },
      { $set: { invitationGot: invitationGot } }
    );
    if (!addInvitationGot)
      return res.status(400).json({ message: "Error Occured" });

    res.status(200).json({ message: "Invitation Sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//Invitation Delete from Reciver Side
router.put("/delete-reciever-side", async (req, res) => {
  try {
    let token = req.headers["x-auth"];
    let userId = req.body.id;
    let data = decodeJwtToken(token);
    //Getting user data
    let user = await User.findById({ _id: userId });
    let invitationSent = user.invitationSent.filter((val) => val !== data);
    // Update invitation sent for sender side
    let addInvitationSent = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { invitationSent: invitationSent } }
    );
    if (!addInvitationSent)
      return res.status(400).json({ message: "Error Occured" });
    //Getting reciver data
    let profile = await User.findById({ _id: data });
    let invitationGot = profile.invitationGot.filter((val) => val !== userId);
    //Updating invitationsGot for reciver side
    let addInvitationGot = await User.findOneAndUpdate(
      { _id: data },
      { $set: { invitationGot: invitationGot } }
    );
    if (!addInvitationGot)
      return res.status(400).json({ message: "Error Occured" });

    //Send Mail for message Reciver
    let mailReciever = await User.findOne({ _id: userId });
    //Creating mail details
    let mailData = {
      email: mailReciever.email,
      subject: "Invitation Rejected from Mangalyam Matrimony",
      message: `Your Invitation had been rejected by ${profile.name}, Please checkout in your Portal`,
    };
    //Sending mail
    let mail = await MailSender({ data: mailData });

    res.status(200).json({ message: "Invitation Sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export let invitationRouter = router;