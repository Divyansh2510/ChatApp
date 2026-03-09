import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMsg, getUsersSidebar, markMsgSeen, sendMsg } from "../controllers/msgControl.js";

const messageRouter = express.Router();

messageRouter.get("/users",protectRoute,getUsersSidebar);
messageRouter.get("/:id",protectRoute,getMsg);
messageRouter.put("/mark/:id",protectRoute,markMsgSeen);
messageRouter.post("/send/:id",protectRoute,sendMsg);

export default messageRouter;