const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { type } = require("os");

app.use(express.json());
app.use(cors());

// Database conection with mongoDB 
mongoose.connect("mongodb+srv://abdelaaziz:019020@cluster0.selrp.mongodb.net/tns-shop");
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
app.use('/images', express.static("uplad/images"))
app.post("/upload",upload.single('product'), (req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.fike.fieldname}`
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
    let Product = await Product.find({})
    let id;
    if (product.length>0){
        let last_product_array = product.slice(-1)
        let last_product = last_product_array[0]
        id = last_product.id+1
    }
    else{
        id=1
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
    console.log("All products fetched")
    res.send(products)
})

app.listen(port,(error)=>{
    if (!error) {
        console.log("Server Running on Port " + port)
    }
    else {
        console.log("Error :"+error)
    }
})

