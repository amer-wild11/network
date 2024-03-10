const express = require("express");
const app = express();
const mongoose = require("mongoose");
const users = require("./api/models/users");
const axios = require("axios");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan("dev"));

mongoose
  .connect(
    `mongodb+srv://amer:${
      process.env.MONGO_PW || "plmoknijb111"
    }@wild-cluster.4lg3sii.mongodb.net/?retryWrites=true&w=majority&appName=wild-cluster`
  )
  .then((res) => {
    console.log(`database connected successfuly`);
  })
  .catch((err) => {
    console.log(`an error while connecting with database`, err);
  });

app.get("/", (req, res) => {
  res.status(200).json({
    message: "we haven't any plans right now 👧",
  });
});

const usersRoute = require("./api/routes/users");
app.use("/users", usersRoute);

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    Error: {
      message: error.message,
    },
  });
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

module.exports = app;
