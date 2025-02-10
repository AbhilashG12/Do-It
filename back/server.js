const express = require("express");
const bcrypt  = require("bcryptjs");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./User");
const FriendReq = require("./friendReq");
const Frndship = require("./friendship");
const Todo = require("./todoSchema")
const app = express();
app.use(express.json());
app.use(cookieParser());

const server = http.createServer(app);
const io = new Server(server , {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
      },
})


app.use(cors({
    origin:"http://localhost:5173",
    methods : "GET,POST",
    credentials : true
}))


mongoose.connect("mongodb://127.0.0.1:27017/couple-todo")
.then(()=>{console.log("MongoDB has been Connected")})
.catch((err)=>{console.log("MongoDb is not Connected" , err)});



io.on("connection", (socket) => {
    
    socket.on("join_room", async ({ roomId, currentUser }) => {
      socket.join(roomId);
 
      const todos = await Todo.find({ room: roomId });
      io.to(roomId).emit("todos", todos);
    });
  
    socket.on("add_todo", async ({ roomId, userId, text, currentUser }) => {
      
      if (userId !== currentUser) return;
      const todo = new Todo({ user: userId, text, room: roomId });
      await todo.save();
      const todos = await Todo.find({ room: roomId });
      io.to(roomId).emit("todos", todos);
    });
  
    socket.on("delete_todo", async ({ roomId, todoId, userId, currentUser }) => {
      const todo = await Todo.findById(todoId);
      if (!todo || String(todo.user) !== currentUser) return;
      await Todo.findByIdAndDelete(todoId);
      io.to(roomId).emit("delete_todo", { todoId });
    });
  
    socket.on("disconnect", () => {
    //   console.log("Client disconnected:", socket.id);
    });
  });   




  const JWT_SECRET = "mySuperSecretKey123";


  const authenticateJWT = (req, res, next) => {
    try {

      const token = req.cookies ? req.cookies.token : null;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
      }
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
        //   console.error("JWT verification error:", err);
          return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
        req.user = decoded;
        next();
      });
    } catch (error) {
    //   console.error("Error in authenticateJWT:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
  


app.get("/friends/:userId" , async(req,res)=>{
    try{
        const {userId} = req.params;
        if (!userId || userId === "null") {
            return res.status(400).json({ message: "Invalid userId" });
          }
        const frnds = await Frndship.find({
            $or:[{user1:userId} ,{user2:userId}],
            status:"accepted"
        }).populate("user1 user2" ,"fullName email")
        const frndsList = frnds.map((frnd)=>{
            return frnd.user1._id.toString() === userId
            ? frnd.user2
            : frnd.user1
        })
        res.status(200).json(frndsList)
    }catch(err){
        res.status(500).json({message:"Error fetching friends" , error : err.messa})
    }
})


app.get("/friend-request/:userId" , async(req,res)=>{
    try{
        const {userId} = req.params;

        const requests = await FriendReq.find({to:userId , status:"pending"}).populate("from" ,"fullName email")

        res.status(200).json(requests);

    }catch(Err){
        res.status(500).json({message:"There is an Error while fetching friend requests" , eror:Err.message})
    }
})

app.post("/accept-request" , async(req,res)=>{
    try{
        const {requestId} = req.body;
        const request = await FriendReq.findById(requestId);
        if(!request) return res.status(404).json({message:"Friend Request not found"})

        request.status = "accepted";
        request.respondedAt = new Date();
        await request.save()

        await Frndship.create({user1:request.from , user2 :request.to , status:"accepted"})

        res.status(200).json({message:"Friend Request accepted "})
    }catch(err){
        res.status(500).json({message:"Inter Server Issues" , error:err.message})
    }
})


app.get("/search" , async(req,res)=>{
    const {query} = req.query;
    try{
         if(!query){
        return res.status(400).json({message:"Search query is required"})
    }

    const users = await User.find({
        $or :[
            {fullName : {$regex: query, $options: "i" }},
            { email: { $regex: query, $options: "i" } }
        ]
    }).select("-password")

    res.json(users);
    } catch(err){
        res.status(500).json({err:"Server error"})
    }
   

})

app.post("/request" , async(req,res)=>{
    try{
        
        const {from , to } = req.body;
        if(!from || !to){
            return res.status(400).json({message:"Both sender and receiver are required"});
        }
        
        if(from === to){
            return res.status(400).json({message:"You cannot send message to yourself"})
        }

        const fromId = new mongoose.Types.ObjectId(from);
        const toId = new mongoose.Types.ObjectId(to);

        const exist = await FriendReq.findOne({ from: fromId, to: toId });
        if(exist){
            return res.status(400).json({message:"Friend request already sent"})
        }
        const senderExists = await User.exists({ _id: from });
        const receiverExists = await User.exists({ _id: to });

        if (!senderExists || !receiverExists) {
            return res.status(400).json({ message: "Invalid users" });
        }

        const frndRequest = new FriendReq({from,to});
        await frndRequest.save();
        res.status(201).json({message:"Request sent successfully"})
    }catch(err){
        res.status(500).json({err:"Server error"})
    }
})


app.post("/signup" , async (req,res)=>{
    try{
        const {fullName , email , password} = req.body;

        const exists = await User.findOne({email});
        if(exists){
            return res.status(400).json({message:"User Already Exists!"})
        }

        const hash = await bcrypt.hash(password , 10);

        const user = new User({fullName , email , password:hash});
        await user.save()

        res.status(201).json({message:"User registered Successfully"})

    }catch(err){
        res.status(500).json({err:"There is an internal server issue"})
    }
})

app.post("/login" , async(req,res)=>{
    try{
        const {email , password} = req.body;

        const exists = await User.findOne({email});
        if(!exists){
           return res.status(400).json({message:"User doesnt Exist"})
        }

        const isMatch = await bcrypt.compare(password , exists.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid Password"})

        }
        const payload = { userId: exists._id, fullName: exists.fullName };

 
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

   
    res.cookie("token", token, {
      path: "/",  
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, 
    });

    res
      .status(200)
      .json({ message: "Login Successful", fullName: exists.fullName, userId: exists._id });
    }catch(err){
        res.status(500).json({message:"Internal Error" , err});
    }
})

app.get("/protected", authenticateJWT, (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({ message: "Access granted", user: { fullName: req.user.fullName, userId: req.user.userId } });
  });


app.post("/logout", (req, res) => {
    res.clearCookie("token", {
      path: "/",  
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  });
  



  



  

server.listen(8000 , ()=>{console.log("Server has Started!")})