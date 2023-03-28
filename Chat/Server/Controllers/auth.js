// Import necessary packages and modules
import bcrypt from "bcrypt";
import { Jwt } from "jsonwebtoken";
import User from "../Models/User";

// Register a new user
export const register = async (req, res) => {
  try {
    // Extract user information from the request body
    const {
      fisrtName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    // Create a new user object with the hashed password
    const newUser = new User({
      fisrtName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });

    // Save the user object to the database and return it as a JSON response
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    // Return an error response if there was an error during registration
    res.status(500).json({ error: err.message });
  }
};

// Log in a user
export const login = async (req, res) => {
  try {
    // Extract email and password from the request body
    const { email, password } = req.body;

    // Check if a user with the provided email exists in the database
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ msg: "user does not exist" });

    // Compare the provided password with the hashed password in the user object
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "invalid credentials" });

    // If the passwords match, generate a JSON Web Token (JWT)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Remove the password from the user object using the "delete" keyword
    delete user.password;

    // Return a JSON response with the JWT and the user object (without the password)
    res.status(200).json({ token, user });
  } catch (error) {
    // Return an error response if there was an error during login
    res.status(500).json({ error: error.message });
  }
};
