const mongoose = require('mongoose');
const passportLocalMongoose = require("passport-local-mongoose")

const Session = new mongoose.Schema({
  refreshToken: {
    type: String,
    default: ""
  }
})

const UserSchema = new mongoose.Schema({
  connection: {
    type: String
  },
  client_id: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  favorite_movies: {
    type: Map,
    default: {}
  },
  following:{
    type: Array,
    default: []
  },
  authStrategy: {
    type: String,
    default: "local",
  },
  points: {
    type: Number,
    default: 50,
  },
  refreshToken: {
    type: [Session]
  }
});

UserSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.refreshToken
    return ret
  },

});

UserSchema.plugin(passportLocalMongoose, {"usernameField": "email"});

const User = mongoose.model('User',UserSchema);

module.exports = User;
