import { useEffect, useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { io } from "socket.io-client";
import { data } from "react-router-dom";



const backEndUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backEndUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children })=>{
     
    const[token,setToken] = useState(localStorage.getItem("token"));
    const[authUser,setAuthUser] = useState(null);
    const[onlineUsers,setOnlineUsers] = useState([]);
    const[socket,setSocket] = useState(null);


    const checkAuth=async()=>{
        try{
            const {data} = await axios.get("/api/auth/check");
            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }
        }catch(error){
            toast.error(error.message)
        }
    }

    //login function to hanle user Authentication

    const login= async(state,Credentials)=>{
        try{
          const {data} = await axios.post(`/api/auth/${state}`,Credentials);
          if(data.success){
            setAuthUser(data.userData);
            connectSocket(data.userData);
            axios.defaults.headers.common["token"]=data.token;
            setToken(data.token);
            localStorage.setItem("token",data.token)
            toast.success(data.message)
          }else{
            toast.success(data.message)
          }
        }catch(error){
            toast.error(data.message)
        }
    }

    //log out function to hanle user Authentication

    const logOut = async()=>{
        localStorage.removeItem("token");
        setToken("null");
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"]=null;
        toast.success("Logged Out Succesfully")
        socket.disconnect();
    }

    //Update profile func

    // const  updateProfile = async(body)=>{
    //     try{
    //         const {data} = await axios.put("/api/auth/update-profile",body);
    //         if(data.success){
    //             setAuthUser(data.user);
    //             toast.success("Profile Updated")
    //         }
    //     }catch(error){
    //         toast.error(error.message)
    //     }
    // }
    const updateProfile = async (body) => {
    try {
        const { data } = await axios.put("/api/auth/update-profile", body);

        if (data.success) {
            setAuthUser(data.user);
            toast.success("Profile Updated");
            return data;
        } else {
            toast.error(data.message);
            throw new Error(data.message);
        }

    } catch (error) {
        console.error("Update Error:", error);
        toast.error(error.response?.data?.message || error.message);
        throw error; // 🔥 IMPORTANT
    }
};


    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket = io(backEndUrl,{
            query:{
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);
        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds);
        })
    }

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common["token"]=token;
        }
    },[token])

    const value={
       axios,
       authUser,
       onlineUsers,
       socket,
       login,
       logOut,
       updateProfile,
    }
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}