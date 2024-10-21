// Imports
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/userRoutes");
const { OAuth2Client } = require("google-auth-library");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

// Google Auth
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(CLIENT_ID);

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// Routes

app.post("/api/google-login", async (req, res) => {
  const { token } = req.body;
  try {
    // 01. Verify the token using Google API
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;
    // 02. Check if the user exists in the MongoDB database
    let user = await User.findOne({ googleId: sub });
    if (!user) {
      // 03. Create a new user record if not exist
      user = new User({
        googleId: sub,
        email,
        name,
        picture,
      });
      await user.save();
    }
    // 04. Generate a session token for the authenticated user
    const sessionToken = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );
    // 05. Send the session token and role to the client
    res.json({ success: true, sessionToken, role: user.role });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

app.use("/users", userRoutes);
app.use("/api/cars", require("./routes/carRoutes"));
app.use("/api/rental", require("./routes/carRentalRoutes"));
app.get("/", (req, res) => {
  res.send("Welcome to Rentify Drive API");
});

// Server
const PORT = process.env.PORT || 3001;
const MONGOOSE_URL =
  process.env.MONGODB_URL || "mongodb://localhost:27017/rentify-drive";
console.log(MONGOOSE_URL);

mongoose
  .connect(MONGOOSE_URL)
  .then(() => {
    console.log("connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Node API app is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
