const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(
  cors({
    origin: ["https://moto-car-hub.onrender.com", "http://localhost:3000"],
  })
);
app.use(express.json());

// Connect to MongoDB database
mongoose
  .connect(
    "mongodb+srv://charles:charlie98@jijomotors.qwb5cf0.mongodb.net/jijomotors?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.log("Database connection error: " + error);
  });

// Configure Cloudinary
cloudinary.config({
  cloud_name: "charleswambua",
  api_key: "698412892359667",
  api_secret: "rIAE9A4gsBJ8T3N3Y8nlh6o7sAQ",
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "jijomotors",
    format: async (req, file) => "png",
    public_id: (req, file) => Date.now().toString(),
  },
});

const upload = multer({ storage });

// Define a schema for the car data
const carSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
});

// Create a model based on the schema
const CarModel = mongoose.model("motors", carSchema);

// Get all cars
app.get("/getCars", async (req, res) => {
  try {
    const cars = await CarModel.find();
    res.status(200).json(cars);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new car

// Add a new car
app.post("/addCar", upload.single("image"), async (req, res) => {
  try {
    // Create a new car object
    const newCar = new CarModel({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.file.path,
    });

    const savedCar = await newCar.save();
    res.status(201).json(savedCar);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Define a schema for the user data
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// Create a model based on the schema
const UserModel = mongoose.model("users", userSchema);

// Register a new user
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // Check if user already exists
  const userExists = await UserModel.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = new UserModel({
    email: email,
    password: hashedPassword,
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login a user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Check if password is correct
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Create token
  const token = jwt.sign({ _id: user._id }, "secretkey");

  res.header("auth-token", token).json({ token: token });
});

// Get all users from the database (only for testing purposes)
app.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a specific user by ID from the database (only for testing purposes)
app.get("/users/:id", getUser, (req, res) => {
  res.status(200).json(res.user);
});

// Middleware function to get a user by ID from the database
async function getUser(req, res, next) {
  let user;
  try {
    user = await UserModel.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}

const port =process.env.PORT ||3001 ;
app.listen("3001", () => {
  console.log(`Server running on port ${port}`);
});
console.log("Cloudinary connected successfully");
