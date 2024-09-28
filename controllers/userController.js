const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const axios = require("axios")
const config = require("config")

const User = require("../models/user")


const signinController = async (req, res) => {
}

const signupController = async (req, res) => {
}

module.exports = {
  signinController,
  signupController
}
