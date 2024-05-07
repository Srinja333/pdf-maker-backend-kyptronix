const UserModel = require("../models/userModel");
const bcrypt = require('bcrypt');
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken")

exports.signUp = async (req, res) => {
  try {
    let userModel = new UserModel();
    userModel.first_name = req.body.first_name
    userModel.last_name = req.body.last_name
    userModel.phone_no = req.body.phone_no
    userModel.role = req.body.role
    userModel.email = req.body.email


    const password = req.body.password
    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, function (err, hash) {
        if (err) reject(err)
        resolve(hash)
      });
    })
    userModel.password = hashedPassword

    const insertedData = await userModel.save()
    if (insertedData) {
      return res.send(insertedData)
    } else {
      throw new Error("user not created")
    }
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

exports.updateUsers = async (req, res) => {
  try {
    if (req.body.password) {
      const password = req.body.password
      const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, function (err, hash) {
          if (err) reject(err)
          resolve(hash)
        });
      })
      req.body.password = hashedPassword
    }
    const updatedData = await UserModel.findOneAndUpdate(
      { _id: { $eq: req.body.user_id } },
      {
        ...req.body,
      },
      {
        new: true,
      }
    );
    if (updatedData) {
      return res.send(updatedData)
    } else {
      throw new Error("user not updated")
    }
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const allUserData = await UserModel.find({}).select("-password")
    if (allUserData) {
      res.status(201).json({
        success: true,
        message: "all user data",
        allUserData
      })
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "Error to get all user data",
    });
  }
};

exports.signIn = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.status(400).send({
        success: false,
        message: "Please provide email",
      });
    }
    if (!req.body.password) {
      return res.status(400).send({
        success: false,
        message: "Please provide password",
      });
    }


    const email = req.body.email;
    const password = req.body.password;

    const userData = await UserModel.find({ email: email });

    if (userData.length !== 0) {
      const hash = userData[0]?.password
      const isValidPassword = await bcrypt.compare(password, hash)
      // console.log("78",isValidPassword)
      if (isValidPassword) {
        const user = userData[0]

        jwt.sign(JSON.parse(JSON.stringify(user)), process.env.JWT_SECRET_KEY, { expiresIn: '1m' }, (error, token) => {
          if (error) {

            throw "error in token creation"

          }
          else {
            res.status(201).send({
              success: true,
              message: "user successfully sign in",
              token,
              user
            });
          }
        })
      }
      else {
        throw "Password not matched"
      }
    }
    else {
      throw "user not registered"
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      error,
      message: "Error in signin",
    });
  }
};

exports.getToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== undefined) {
    const bearer = bearerHeader.split(" ")
    const token = bearer[1]
    req.token = token
    next()
  } else {
    res.status(500).send({
      success: false,
      message: "can't get token",
    })
  }
}

exports.verifyToken = (req, res, next) => {
  jwt.verify(req.token, process.env.JWT_SECRET_KEY, (err, authData) => {
    if (err) {
      res.status(500).send({
        success: false,
        message: err.message,
      })
    } else {
      req.body.authData = authData;
      next()
    }
  })
}

exports.deleteUsers = async (req, res) => {
  try {
    const userId = req.body.user_id;
  
   
    const deletedData=await UserModel.findOneAndDelete(
     {_id:{$eq:userId}}
   )
    if (deletedData) {
      return res.send(deletedData)
    } else {
      throw new Error("user not deleted")
    }


  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};