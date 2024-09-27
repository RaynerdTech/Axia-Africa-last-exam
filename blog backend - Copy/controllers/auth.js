const bcrypt = require('bcryptjs');
const userModel = require('../models/usersSchema');
const jwt = require('jsonwebtoken');

// Create user
const register = async (req, res) => {
    try {
        const { userName, password, email, gender, age, role } = req.body;

        // Check if the user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Encrypt password
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);

        // Create a new user
        const newUser = new userModel({
            userName,
            password: hashPassword,
            email,
            gender,
            age,
            role: role
        });

        const saveUser = await newUser.save();
        res.status(201).json(saveUser);
        console.log(saveUser);

    } catch (err) {
        res.status(500).json({ error: "Unable to create user" });
        console.log(err);
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Checking if email matches
        const userInfo = await userModel.findOne({ email });
        if (!userInfo) {
            return res.status(404).json({ message: "Unable to find user" });
        }

        // Checking if password matches
        const verify = bcrypt.compareSync(password, userInfo.password);
        console.log(verify);
        if (!verify) {
            return res.status(401).json({ message: "Password does not match" });
        }

        const aboutUser = { id: userInfo.id, role: userInfo.role };
        const token = jwt.sign(aboutUser, process.env.JWT_SECRET);
        console.log(token);

        res.cookie('user_token', token);
        res.status(200).json({ message: "Successfully logged in" });
    } catch (err) {
        res.status(500).json({ error: "Failed to login" });
        console.log(err);
    }
};

// Logout user
const logout = async (req, res) => {
    try {
        res.clearCookie("user_token");
        res.status(200).json({ message: "Successfully logged out" });
    } catch (error) {
        res.status(500).json({ error: "Failed to logout" });
    }
};

// Authenticate and register
const authRegister = async (req, res) => {
    const { username, email, gender } = req.body;
    try {
        // Check if account exists and if it is a credential account
        const findOne = await userModel.findOne({ email });
        if (findOne && findOne.credentialAccount) {
            return res.status(400).json({ message: "Illegal parameters" });
        }

        // Check if the account exists and set a cookie
        if (findOne) {
            const aboutUser = { id: findOne.id, role: findOne.role };
            const token = jwt.sign(aboutUser, process.env.JWT_SECRET);
            res.cookie("user_token", token);
            return res.status(200).json({ message: "Login successful" });
        }

        // Create new user
        const newUser = new userModel({
            username,
            email,
            gender,
            credentialAccount: false,
        });
        const savedUser = await newUser.save();
        const aboutUser = { id: savedUser.id, role: savedUser.role };
        const token = jwt.sign(aboutUser, process.env.JWT_SECRET);
        res.cookie("user_token", token);
        return res.status(201).json({ message: "User created and login successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { register, loginUser, logout, authRegister };
