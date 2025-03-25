const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");


require("dotenv").config(); // Load .env variables
const SECRET_KEY = process.env.JWT_SECRET || "secret_ecom";
console.log("JWT Secret: ", process.env.JWT_SECRET)

//const ProductModel = require('./models/Product'); 


app.use(express.json());
const corsOptions = {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Add your frontend URL here
    methods: "GET,POST,PUT,DELETE",
    credentials: true
};

app.use(cors(corsOptions));

// Database conection with mongoDB 
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
console.log("MongoDB URI: ", process.env.MONGO_URI); 
// API creation

app.get("/",(req,res)=>{
    res.send("Express App is Running")
})

// Image Storage Engine

const storage =multer.diskStorage({
    destination: './upload/images',
    filename: (erq, file, cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({storage:storage})

// Creating Upload
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single('product'), (req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for creating product
const Product = mongoose.model("Product", {
    id:{
        type:Number,
        require:true,
    },
    name:{
        type:String,
        require:true
    },
    image:{
        type:String,
        require:true
    },
    category:{
        type:String,
        require:true
    },
    new_price:{
        type:Number,
        require:true
    },
    old_price:{
        type:Number,
        require:true
    },
    date:{
        type:Date,
        default:Date.now,
    },
    avilable:{
        type:Boolean,
        default:true
    },
})

app.post('/addproduct', async (req,res)=> {
    let productList = await Product.find({});
    let id;
    if (productList.length > 0) {
        let last_product = productList[productList.length - 1]; // Fix this
        id = last_product.id + 1;
    } else {
        id = 1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    })
    console.log(product)
    await product.save()
    console.log("Saved")
    res.json({
        success:true,
        name:req.body.name,
    })
})

//Creating API for Deleting Products
app.post('/removeproduct', async (req,res)=> {
    await Product.findOneAndDelete({id:req.body.id})
    console.log("Removed")
    res.json({
        success:true,
        name:req.body.name,
    })
})

//Creating api for getting all products
app.get('/allproducts', async (req,res)=> {
    let products = await Product.find({})
    res.send(products)
})

// Shema creating for User model

const Users = mongoose.model('Users', {
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData: {
        type: Object,
        default: {}, // 🟢 Ensure cartData is initialized as an empty object
    },
    date: {
        type: Date,
        default: Date.now,
    },
})

// Creating Endpoint for registring 
app.post('/signup', async (req, res)=>{
    let check = await Users.findOne({email:req.body.email})
    if (check) {
        return res.status(400).json({success:false, errors:'existing user found with same email address'})
    } 
    let cart = {};
    for (let i = 0; i < 300; i++){
        cart[i]=0
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign({ user: { id: user._id } }, SECRET_KEY, { expiresIn: "1h" });

    //const token = jwt.sign(data, SECRET_KEY);
    res.json({success:true, token})
})

// creating endpoint for user login
app.post('/login', async (req, res)=> {
    let user = await Users.findOne({email:req.body.email})
    if(user){
        const passCompare = req.body.password === user.password;
        if (passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign({ user: { id: user._id } }, SECRET_KEY, { expiresIn: "1h" });

            //const token = jwt.sign(data,SECRET_KEY);
            res.json({success:true,token})
        }
        else {
            res.json({success:false, errors:"Wrong Password"});
        }
    }
    else {
        res.json({success:false,errors:"Wrong Email Id"})
    }
})

// Creating endpoint for newcollection data
app.get('/newcollections', async (req,res)=>{
    let Products = await Product.find({})
    let newcollection = Products.slice(1).slice(-8);
    console.log("New Collection Fetched");
    res.send(newcollection)
})

// Creating endpoint for popular in women section
app.get('/popularinwomen', async (req,res)=>{
    let products = await Product.find({category:"women"})
    let popular_in_women = products.slice(0,4)
    console.log("popular in women fetched")
    res.send(popular_in_women)
})

//Creating middelware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    
    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
    else{
        try {
        const data = jwt.verify(token, SECRET_KEY);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
    }
    
};

// Create authenticateToken
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    console.log("Received Header:", authHeader); // Debugging line
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ errors: "Please authenticate using a valid token" });
    }
  
    const token = authHeader.split(" ")[1]; // Extract token
    console.log("Extracted Token:", token);
  
    if (!token) {
      return res.status(403).json({ errors: "Token is missing" });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ errors: "Invalid token" });
  
      req.user = decoded.user; // Attach user to request
      next();
    });
  };




// Creating endpoint for adding products in cartdata
app.post("/addtocart",fetchUser,async (req, res) => {
    console.log(req.body,req.user);

    let userData = await Users.findOne({_id:req.user.id})
    userData.cartData[req.body.itemId] +=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Added")
});


// Creating endpoint to remove product from cartdata
app.post('/removefromcart',fetchUser,async(req,res)=>{
    console.log("Removed",req.body.itemId)
    let userData = await Users.findOne({_id:req.user.id})
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.send("Removed")
})

// Creating endpoint to get cart
app.get("/getcart", fetchUser, async (req, res) => {
    try {
        let user = await Users.findOne({ _id: req.user.id });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user.cartData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});



app.listen(port,(error)=>{
    if (!error) {
        console.log("Server Running on Port " + port)
    }
    else {
        console.log("Error :"+error)
    }
})


