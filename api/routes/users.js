const express = require("express");
const Users = require("../models/users");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");

router.get("/", (req, res) => {
  Users.find()
    .select("email _id")
    .then((users) => {
      res.status(200).json({
        uesrs: users,
      });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

router.delete("/", (req, res) => {
  Users.deleteMany()
    .then((result) => {
      res.status(200).json({
        message: "users has deleted successfuly",
        result: result,
      });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

router.post("/signup", (req, res) => {
  Users.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res.status(500).json({
          message: "email already exist",
        });
      }
      if (!req.body.password) {
        return res.status(500).json({
          message: "password is required",
        });
      }
      if (!req.body.email) {
        return res.status(500).json({
          message: "email is required",
        });
      }
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }
        const user = new Users({
          id: new mongoose.Types.ObjectId(),
          email: req.body.email,
          password: hash,
        });
        user
          .save()
          .then((user) => {
            const token = jwt.sign(
              { email: user.email, userId: user._id },
              process.env.JWT_KEY || "amer_jwt_key",
              { expiresIn: "999h" }
            );
            res.status(200).json({
              message: "user has created",
              user: user,
              token: token,
            });
          })
          .catch((err) => res.status(500).json({ message: err.message }));
      });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

router.post("/login", (req, res) => {
  Users.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(500).json({
          message: `email is incorrect`,
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(500).json({
            message: err.message,
          });
        }
        if (result) {
          const token = jwt.sign(
            { email: user.email, userId: user._id },
            process.env.JWT_KEY || "amer_jwt_key",
            { expiresIn: "999h" }
          );
          return res.status(200).json({
            message: "loged in successfuly",
            user: {
              email: user.email,
              _id: user._id,
            },
            token: token,
          });
        } else {
          return res.status(500).json({
            message: "password is incorrect",
          });
        }
      });
    })
    .catch((err) => res.status(500).json({ message: err.message }));
});

module.exports = router;
