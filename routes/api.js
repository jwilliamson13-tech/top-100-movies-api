const util = require('util');
const circularJSON = require('circular-json');
const { requiresAuth } = require('express-openid-connect');
const express = require('express');
const router = express.Router();
const tmdbDAO = require("../dao/tmdbDAO.js");
const bodyParser = require('body-parser');
const { getToken, COOKIE_OPTIONS, getRefreshToken,verifyUser } = require("../authenticate")
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

//Get movies based on search query
router.get('/movies', async (req,res) => {
  //Pull this out and do checks on query
  var query = req.query;

  //Respond back if name does not exist

  const page = req.query.page ? req.query.page : 1;

  const name = req.query.name ? req.query.name : false;

  if(!name){
    res.send({"error":"No Movie name selected."});
  }
  else{
    try{
      //Get the movies from the DAO
      var movies = await tmdbDAO.getMovies(name,page);
      console.log(movies);

      //Check if pages exceed the maximum
      if(page > movies.data.total_pages){
        movies = await tmdbDAO.getMovies(name,1);
      }

      res.send(circularJSON.stringify(movies));
    } catch(e){
      console.error("Could not get movies from TMDBDAO: ", e);
    }
  }
});

router.get('/',async (req,res) =>{
  console.log(req.oidc);
});

router.delete('/movies', jsonParser, verifyUser, async (req,res) => {
  var {id, movie} = req.body;

  //Add checks for authentication and user id = id AND add in the authentication piece in the top beside json Parser

  //Get user's favorite movies
  User.findOne({"_id":id}, async (err, user) => {
    if(err){
      console.error("Error finding user: ", err);
      res.status(500);
      res.send({success: false, error: "User not found."});
    }
    else{
      var favorite_movies = user.favorite_movies;
      var moviesArray = favorite_movies.entries();
      var movieToDeleteKey = -1;

      //Loop through the array of entries
      for(let [rank, currentMovie] of moviesArray){
        //Find one where the movie ID matches
        if(currentMovie.id == movie.id){
          //Note the key
          movieToDeleteKey = rank;
        }
      }


      //Delete the movie
      if(movieToDeleteKey != -1){
        console.log("DELETING BASED ON KEY");
        favorite_movies.delete(movieToDeleteKey);
      }
      else{
        console.error("Movie not found in user's list");
        res.status(500);
        res.send({success: false, error: "Movie not in user's list"});
      }

      //Update the user with new favorite_movies
      const updatedUser = await User.findOneAndUpdate({"_id":id},{'$set': {"favorite_movies":favorite_movies}},{'new':true});

      //Check to see if new movie was deleted (this helps return errors)
      if(updatedUser.favorite_movies.entries().length === favorite_movies.length){
        res.send({success:true});
      }
      else{
        res.send({success:false, error: "Error updating movie list"});
      }
    }
  });
});

router.post('/movies', jsonParser, verifyUser, async (req,res) => {
  var {id, movie, rank} = req.body;

  //Add checks for authentication and user id = id



  if(rank !== undefined && rank <= 100 && rank >= 1){
    //Get user's favorite movies
    User.findOne({"_id":id}, async (err, user) => {
      if(err){
        console.error("Error finding user: ", err);
        res.status(500);
        res.send({success: false, error: "User not found."});
      }
      else{
        console.log(user.favorite_movies);
        var favorite_movies = user.favorite_movies;

        var currentPosition = rank;
        var done = false;
        var toBePlaced = movie;
        var buffer;


        while(currentPosition <= 100 && !done) {
          //If our named rank doesn't exist, we're good to go
          if(!favorite_movies.has(currentPosition.toString())) {
            favorite_movies.set(currentPosition.toString(),toBePlaced);
            done = true;
          }
          else {
            //Shift everything up one until we hit something that's empty
            buffer = favorite_movies.get(currentPosition.toString());
            favorite_movies.set(currentPosition.toString(),toBePlaced);
            currentPosition++;
            if(buffer === undefined){
              done = true;
            }
            else{
              toBePlaced = buffer;
            }
          }
        }
        console.log(favorite_movies);

        //Update user
        const updatedUser = await User.findOneAndUpdate({"_id":id},{'$set': {"favorite_movies":favorite_movies}},{'new':true});

        //Check to see if new movie was added (this helps return errors)
        if(updatedUser.favorite_movies.get(rank).id === movie.id){
          res.send({success:true});
        }
        else{
          res.send({success:false, error: "Error updating movie list"});
        }
      }
    })
  }
  else {
    res.send({success: false, error: "Rank is an incorrect value."})
  }
});

router.post('/follow', jsonParser, verifyUser, async(req,res) =>{
  var {id, followId} = req.body;

  User.findOne({"_id":id}, async (err, user) => {
    if(err){
      console.error("Error finding user: ", err);
      res.status(500);
      res.send({success: false, error: "User not found."});
    }
    else{
      var currentFollowing = user.following;
      currentFollowing.push(followId);


      //Update user
      const updatedUser = await User.findOneAndUpdate({"_id":id},{'$set': {"following":currentFollowing}},{'new':true});

      //Check to see if new movie was added (this helps return errors)
      if(updatedUser.following.length == currentFollowing.length){
        res.send({success:true});
      }
      else{
        res.send({success:false, error: "Error updating followers."});
      }
    }
  });
});

router.post('/unfollow', jsonParser, verifyUser, async(req,res) =>{
  if(true){
    var {id, followId} = req.body;

    User.findOne({"_id":id}, async (err, user) => {
      if(err){
        console.error("Error finding user: ", err);
        res.status(500);
        res.send({success: false, error: "User not found."});
      }
      else{
        var currentFollowing = user.following;
        var followIndex = currentFollowing.indexOf(followId);
        if(followIndex > -1){
          currentFollowing.splice(followIndex,1);
        }

        //Update user
        const updatedUser = await User.findOneAndUpdate({"_id":id},{'$set': {"following":currentFollowing}},{'new':true});

        //Check to see if new movie was added (this helps return errors)
        if(updatedUser.following.length == currentFollowing.length){
          res.send({success:true});
        }
        else{
          res.send({success:false, error: "Error updating followers."});
        }
      }
    });
  }
});

module.exports = router;
