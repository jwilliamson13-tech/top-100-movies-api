const User = require('../models/User');
const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;
const { getToken, COOKIE_OPTIONS, getRefreshToken } = require("../authenticate")
const bcrypt = require('bcrypt');

console.log(User);

class userDAO{

  static async getAllUsers(){

    try{
      const users = User.find({});
      return users;
    } catch(e){
      console.error("Error getting users: ", e);
    }
  }

  static async getUser(userId){
    try{

      const user = User.findById(userId);

      return user;
    } catch(e){
      console.error("Error getting user: ", e);
    }
  }

  static async registerUser(email, password, password2){
    /*
    if(!email){
      return {success: false, error: "No Email Given"}
    }

    if(password != password2){
      return {success: false, error: "Passwords do not match"}
    }

    //Check if user exists
    console.log("2");
    //If not, register

      try{
        console.log("3");
        await User.register(new User({email: email}),password, async (err,newUser) => {
          console.log("4");
          if(err){
            console.log(err);
            return {success: false, error: "Failure generating user"}
          }
          else{
            console.log("5");
            //Get user token
            const token = getToken({ _id: newUser._id });
            const refreshToken = getRefreshToken({ _id: newUser._id });
            newUser.refreshToken.push({ refreshToken });
            var updatedUser = newUser.save()
            console.log("6");

            var thingToReturn = { success: true, token: token, refreshToken:refreshToken }
            console.log("7");
            return { success: true, token: token, refreshToken:refreshToken }

            /*
            //Salt password
            bcrypt.genSalt(10, (err, salt) => {
              if(err){
                return {success: false, error: "Failure generating salt"}
              }
              else{
                bcrypt.hash(password, salt, async (err, hash) => {
                  if (err){
                    return {success: false, error: "Failure hashing password"}
                  }
                  newUser.password = hash;
                  await newUser.save()

                  var thingToReturn = { success: true, token: token, refreshToken:refreshToken }
                  console.log(thingToReturn)
                  return { success: true, token: token, refreshToken:refreshToken }
                });
              }
              });
              - COMMENT ENDER GOES HERE * /

            }
          });
      }
      catch (e){
        console.error("Error creating user:", e);
      }
      */
    }

  //Delete User
  static async deleteUser(userId){
    try{

      const user = await User.findByIdAndDelete(userId);

      return true;
    } catch(e){
      console.error("Error getting user: ", e);
    }
  }

  //Add movies to user
  //Consider building to add just one movie
  static async addMovies(userId,moviesList){
    //Get a list of current movies
    try{

      const currentMovies = await User.findById(userId).favorite_movies ? currentMovies : [];
      var newMoviesList = currentMovies;

      //Check if new movies are not in movies list
      moviesList.forEach((movie) =>{
        if(!currentMovies.includes(movie)){
          newMoviesList.push(movie);
        }
      })
    } catch(e){
      console.error("Error finding user:", e);
    }

    //Update user object
    try{
      const updateUser = await User.findOneAndUpdate({"_id":userId},{'$set': {"favorite_movies":newMoviesList}},{'new':true});

      var updatedMovies = updateUser.favorite_movies;
      //Compare if movies have been updated
      updatedMovies.sort();
      newMoviesList.sort();

      for(var i = 0; i < updateUser.favorite_movies.length; i++){
        if(updatedMovies[i] != newMoviesList[i]){
          return false;
        }
      }
      return true;
    } catch(e){
      console.error("Error updating user's movies: ", e);
    }

  }

  //Remove movies from user
  //Removing following from user
  static async deleteMovie(userId,movie){
    //Get a list of current followers
    try{
      //For some reason, if I do not access the object and compare in the same statement, it works here.
      const user = await User.findById(userId);
      var newMovies = user.favorite_movies;

      console.log(newMovies);

      //Remove from following list
      newMovies.splice(newMovies.indexOf(movie), 1);

      console.log(newMovies);
    } catch(e){
      console.error("Error finding user:", e);
    }

    //Update user object
    try{
      const updateUser = await User.findOneAndUpdate({"_id":userId},{'$set': {"favorite_movies":newMovies}},{'new':true});
      var updatedMovies = updateUser.favorite_movies;

      //Compare if following has been updated
      updatedMovies.sort();
      newMovies.sort();

      for(var i = 0; i < updateUser.favorite_movies.length; i++){
        if(updatedMovies[i] != newMovies[i]){
          return false;
        }
      }

      return true;

    } catch(e){
      console.error("Error updating user's following: ", e);
    }

  }


  //Add following to user
  static async addFollowing(userId,followingId){
    //Get a list of current followers
    try{
      //For some reason, if I do not access the object and compare in the same statement, it works here.
      const user = await User.findById(userId);
      var newFollowing = user.following;

      console.log(newFollowing);

      //Check if new foller is not in following list
      if(!newFollowing.includes(followingId)){
        newFollowing.push(followingId);
      }

      console.log(newFollowing);
    } catch(e){
      console.error("Error finding user:", e);
    }

    //Update user object
    try{
      const updateUser = await User.findOneAndUpdate({"_id":userId},{'$set': {"following":newFollowing}},{'new':true});
      var updatedFollowing = updateUser.following;

      //Compare if following has been updated
      updatedFollowing.sort();
      newFollowing.sort();

      for(var i = 0; i < updateUser.following.length; i++){
        if(updatedFollowing[i] != newFollowing[i]){
          return false;
        }
      }

      return true;

    } catch(e){
      console.error("Error updating user's following: ", e);
    }

  }

  //Removing following from user
  static async deleteFollowing(userId,followingId){
    //Get a list of current followers
    try{
      //For some reason, if I do not access the object and compare in the same statement, it works here.
      const user = await User.findById(userId);
      var newFollowing = user.following;

      console.log(newFollowing);

      //Check if following is in the list
      if(newFollowing.includes(followingId)){
        //Remove from following list
        newFollowing.splice(newFollowing.indexOf(followingId), 1);
      }

      console.log(newFollowing);
    } catch(e){
      console.error("Error finding user:", e);
    }

    //Update user object
    try{
      const updateUser = await User.findOneAndUpdate({"_id":userId},{'$set': {"following":newFollowing}},{'new':true});
      var updatedFollowing = updateUser.following;

      //Compare if following has been updated
      updatedFollowing.sort();
      newFollowing.sort();

      for(var i = 0; i < updateUser.following.length; i++){
        if(updatedFollowing[i] != newFollowing[i]){
          return false;
        }
      }

      return true;

    } catch(e){
      console.error("Error updating user's following: ", e);
    }

  }


};


module.exports = userDAO;
