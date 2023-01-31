import express from "express";
import mongoose, { mongo } from "mongoose";
import bcrypt from "bcryptjs";
import cors from "cors";

const app=express();



//mongoDB Connection 
mongoose.connect("mongodb+srv://rahul:rahul123@wordrace.ecpmqut.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName:"Users"
});

//defining user schema
const userSchema=new mongoose.Schema({
    fname:{type:String},
    lname:{type:String},
    username:{type:String,required:true},
    email:{type:String},
    password:{type:String}
})

const User=mongoose.model("User",userSchema);




const port=process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

app.use((req,res,next)=>{
    res.header("Access-Control-Allow-Origin",'*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
})


app.get('/', async (req, res) => {
    const data=await User.find({});
    res.send(data)
  });


//checking if the user with the email already exists!!...

app.post("/",async(req,res)=>{
    try{
        const fname=req.body.fname;
        const lname=req.body.lname;
        const username=req.body.username;
        const email=req.body.email;
        const password=req.body.password;

        //checking if user exists
        const emailExists=await User.findOne({email:email});
        if(emailExists){
            console.log("email already exists!!")
            res.status(409).json({
                message:"User Already Exists"
            })
        }else{
            const salt=await bcrypt.genSalt();
            const hashedPassword=await bcrypt.hash(password,salt)
            const user=new User({
                username:username,
                fname:fname,
                lname:lname,
                email:email,
                password:hashedPassword
            });
            await user.save();
            res.status(200).json({
                message:`New User created Succesfull with username : ${user.username}`,
                id:user.id
            });
        }

        
    }catch(err){
        console.error("an error occured");
        console.log(err);
        res.status(500).json({
            message:"an error occured : "+err
        });
    }
    

    
})

app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})
