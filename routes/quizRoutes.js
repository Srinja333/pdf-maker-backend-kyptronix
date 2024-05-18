const express = require("express");
const multer = require("multer");
const fs = require("fs");
const { saveQuizTemplates,updateQuizTemplates,getQuizTemplates,deleteQuizTemplates } = require("../controllers/quizController");
const path = require("path");
const { getToken, verifyToken } = require("../controllers/userController");
const router = express.Router();

if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// Multer setup
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });

router.post(
  "/",getToken, verifyToken,
  upload.fields([
    {
      name: "options",
    },
    {
      name: "answers",
    },
  ]),
  saveQuizTemplates
);

router.put("/",getToken, verifyToken, upload.fields([
  {
    name: "db_options",
  },
  {
    name: "db_answers",
  },
  {
    name: "options",
  },
  {
    name: "answers",
  },
]), updateQuizTemplates);

router.get("/", getToken, verifyToken,getQuizTemplates);

router.delete("/",getToken, verifyToken,deleteQuizTemplates)

module.exports = router;
