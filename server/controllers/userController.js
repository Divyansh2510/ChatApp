import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";


export const signUp = async(req,res)=>{
    const {fullName , email, password,bio}=req.body;
    try{
        if(!fullName|| !email|| !password || !bio){
            return res.json({success:false,message : 'Missing Details'})
        }
        const user = await User.findOne({email});
        
        if(user){
            return res.json({success:false , message :"User Already exist"})
        }

        const salt = await  bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = await User.create({
            fullName,email,password:hashedPassword,bio
        });

        const token = generateToken(newUser._id)
        res.json({success:true,userData:newUser,token,message:"Account Created Successfully"})
    }catch(error){
         console.log(error.message);
         res.json({success:false,message:error.message})
    }
}


//Controller to login a user

export const login = async(req,res)=>{
    try{
    const {email,password}  = req.body;
    
    const UserData = await User.findOne({email})

    if (!UserData) {
    return res.json({ success: false, message: "User does not exist" });
}

    const isPassCorrect = await bcrypt.compare(password,UserData.password);

    if(!isPassCorrect){
        return res.json({success:false,message:"Login Failed"})
    }

    const token = generateToken(UserData._id)
    res.json({success:true,userData:UserData,token,message:"Logged in  Successfully"})

    }catch(error){
         console.log(error.message);
         res.json({success:false,message:error.message})
    }
}

//authenticate

export const checkauth=(req,res)=>{
    res.json({success:true,user:req.user});
}

//Cnotroller to Update Profile PIC

// export const updateProfile=async(req,res)=>{
//     try{
//         const {profilePic,bio,fullName}=req.body;
//         const userID= req.user._id;
//         let updatedUser;

//         if(!profilePic){
//           updatedUser =  await User.findByIdAndUpdate(userID,{bio,fullName},{new:true});
//         }else{
//             const upload = await cloudinary.uploader.upload(profilePic);

//             updatedUser = await User.findByIdAndUpdate(userID,{profilePic:upload.secure_url,bio,fullName},{new:true});
//             res.json({success:true,user:updatedUser});
//         }
//     }catch(error){
//         res.json({success:false,message: error.message});
//     }
// }

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userID = req.user._id;

        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(
                userID,
                { bio, fullName },
                { new: true }
            );
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(
                userID,
                {
                    profilePic: upload.secure_url,
                    bio,
                    fullName
                },
                { new: true }
            );
        }

        // 🔥 SEND RESPONSE IN BOTH CASES
        res.json({ success: true, user: updatedUser });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};
