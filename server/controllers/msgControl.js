import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io,userSocketMap } from "../server.js";

//Retrieving Users for Sidebar except logged in

export const getUsersSidebar=async(req,res)=>{
    try{
       const userID = req.user._id;
       const filteredUsers = await User.find({_id:{$ne:userID}}).select("-password");

       const unseenMsg={};
       const promises = filteredUsers.map(async(user)=>{
        const messages = await Message.find({senderId:user._id,receiverId:userID,seen:false})
        if(messages.length>0){
            unseenMsg[user._id]=messages.length;
        }
       })
       await Promise.all(promises);
       res.json({success:true,users:filteredUsers,unseenMsg})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//Get message for selected User.

export const getMsg=async(req,res)=>{
    try{
        const {id:selectedUserId} = req.params;
        const myId = req.user._id;
        
        const messages = await Message.find({
            $or:[
                {senderId : myId,receiverId:selectedUserId},
                {senderId:selectedUserId,receiverId:myId},
            ]
        })
        await Message.updateMany({senderId:selectedUserId,receiverId:myId},{seen:true});
        res.json({success:true,messages})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}


// Mark messages as seen 

export const markMsgSeen = async(req,res)=>{
    try{
        const {id} = req.params;
        await Message.findByIdAndUpdate(id,{seen:true})
        res.json({success:true})
    }catch(error){
        console.log(error)
        res.json({success:false,message:error.message})
    }
}

//Send message to selected User

export const sendMsg = async(req,res)=>{
    try{
        const {text,image}=req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;
        let imageURL;

        if(image){
            const UploadResp = await cloudinary.uploader.upload(image)
            imageURL = UploadResp.secure_url;
        }

        const newMsg = await Message.create({
            senderId,
            receiverId,
            text,
            image : imageURL
        })
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMsg)
        }
        res.json({success:true, newMessage:newMsg})

    }catch(error){
            console.log(error)
            res.json({success:false,message :error.message})
    }
}