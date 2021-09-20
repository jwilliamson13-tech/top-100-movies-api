const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("../models/User")

//Call during login/sign up.
passport.use(new LocalStrategy({usernameField:'email'},User.authenticate()))

//Call to set user
passport.serializeUser(User.serializeUser())
