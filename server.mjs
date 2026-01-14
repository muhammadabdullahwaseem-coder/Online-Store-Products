import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 1. Initialize dotenv to read your .env file
dotenv.config();

// 2. Define __dirname (Required because you are using .mjs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Set the port (Matches uppercase PORT in .env)
const PORT = process.env.PORT || 9999;

const productSchema = new mongoose.Schema({
  productName: String,
  productPrice: Number,
  currencyCode: String,
  numberOfSale: Number,
  rating: Number,
  isFreeShipping: Boolean,
  shopName: String,
  createdOn: { type: Date, default: Date.now },
});
const productModel = mongoose.model("Product", productSchema);

let app = express();
app.use(express.json());
app.use(cors());

// 4. CRITICAL FIX: Serve your HTML files from the current folder
app.use(express.static(__dirname));

// API Routes
app.get("/products", async (req, res) => {
  let result = await productModel.find({}).exec().catch((e) => {
      res.status(500).send({ message: "error in getting all products" });
      return;
    });
  res.send({ message: "all products success ", data: result });
});

app.get("/product/:id", async (req, res) => {
  let result = await productModel.findOne({ _id: req.params.id }).exec().catch((e) => {
      res.status(500).send({ message: "error in getting product" });
      return;
    });
  res.send({ message: "product success ", data: result });
});

app.post("/product", async (req, res) => {
  let body = req.body;
  if (!body.productName || !body.productPrice) {
    res.status(400).send({ message: "Required fields missing" });
    return;
  }
  let result = await productModel.create(body).catch((e) => {
      console.log("error: ", e);
      res.status(500).send({ message: "db error" });
    });
  res.send({ message: "product added", data: result });
});

app.delete("/product/:id", async (req, res) => {
    try {
        const result = await productModel.findByIdAndDelete(req.params.id);
        res.send({message: "deleted"});
    } catch (err) {
        res.status(500).send({ message: "db error" });
    }
})

app.put("/product/:id", async (req, res) => {
  try {
    const result = await productModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send({ message: "updated" });
  } catch (err) {
    res.status(500).send({ message: "db error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Database Connection
let dbURI = process.env.Mongo_db_URI; // Using variable from .env
mongoose.connect(dbURI);
mongoose.connection.on("connected", () => console.log("Mongoose is connected"));
mongoose.connection.on("error", (err) => console.log("Mongoose connection error: ", err));