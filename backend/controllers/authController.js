import User from "../models/User.js";
import Workspace from "../models/Workspace.js";
import jwt from "jsonwebtoken";

const generateToken = (id, role, workspaceId) => {
  return jwt.sign({ id, role, workspaceId }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // This endpoint is now exclusively for creating new Companies (Admins)
    const user = new User({
      name,
      email,
      password,
      role: "admin",
    });

    // Create a new Workspace for this admin
    const workspace = await Workspace.create({
      name: `${name}'s Workspace`,
      owner: user._id,
    });

    user.workspaceId = workspace._id;
    await user.save();

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        workspaceId: user.workspaceId,
        token: generateToken(user._id, user.role, user.workspaceId),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // We use .select("+password") because password has select: false in schema
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        workspaceId: user.workspaceId,
        token: generateToken(user._id, user.role, user.workspaceId),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.avatar = req.body.avatar || user.avatar;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        workspaceId: updatedUser.workspaceId,
        token: generateToken(updatedUser._id, updatedUser.role, updatedUser.workspaceId),
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/password
// @access  Private
export const updateUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    if (user) {
      const { currentPassword, newPassword } = req.body;

      if (await user.matchPassword(currentPassword)) {
        user.password = newPassword;
        await user.save();
        res.json({ message: "Password updated successfully!" });
      } else {
        res.status(400).json({ message: "Incorrect current password" });
      }
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register an employee via invite token
// @route   POST /api/auth/register-employee
// @access  Public
export const registerEmployee = async (req, res) => {
  try {
    const { name, email, password, token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Invite token is required" });
    }

    const workspace = await Workspace.findOne({ inviteToken: token });

    if (!workspace) {
      return res.status(400).json({ message: "Invalid or expired invite token" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "employee",
      workspaceId: workspace._id,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        workspaceId: user.workspaceId,
        token: generateToken(user._id, user.role, user.workspaceId),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Employee Error:", error);
    res.status(500).json({ message: error.message });
  }
};
