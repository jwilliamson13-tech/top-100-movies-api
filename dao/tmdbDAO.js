const axios = require('axios');


class tmdbDAO{
  static async getMovies(name,page) {
    try{
      const movies = await axios.get('https://api.themoviedb.org/3/search/movie?api_key=bd5df5de4a59e0570ab70926d5144f61&language=en-US&query=' + name + '&include_adult=false' + '&page=' + page);
      console.log(movies.data);
      return movies
    }
    catch(error){
      console.log("Error loading Movies: ", error);
      return null
    }
  }
};


module.exports = tmdbDAO;
