const express = require('express');
const { auth } = require('express-openid-connect');
const config = require("./config/config.js");
const dbConn = require("./config/databaseConnector.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport")

process.env.NODE_ENV = 'production';

if (process.env.NODE_ENV == "production") {
  // Load environment variables from .env file
  require("dotenv").config()
}

require("./strategies/jwtStrategy")
require("./strategies/localStrategy")
require("./authenticate")

//Express
const app = express();

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(passport.initialize())

//Process .env PORT is used for Heroku deployment
const port = process.env.PORT || 80;

const whiteList = process.env.WHITELISTED_DOMAINS ? process.env.WHITELISTED_DOMAINS.split(",") : [];

const corsOptions = {
  origin: function (origin, callback) {
    //console.log(whiteList);
    //console.log(origin);
    //console.log(whiteList.indexOf(origin));

    //indexOf wasn't working for some reason
    const whiteListIndex = whiteList.findIndex((url) => {
      return url === origin;
    });
    if (!origin || whiteListIndex !== -1) {
      callback(null, true);
    }
    else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(cors(corsOptions));
app.use(auth(config));
app.use('/', require('./routes/index.js'));
app.use('/api/v1', require('./routes/api.js'));
app.use('/users', require('./routes/users.js'));


//Connect to mongoDB
const db = dbConn.connect();

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
