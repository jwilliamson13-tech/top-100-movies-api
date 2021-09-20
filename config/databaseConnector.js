const mongoose = require("mongoose");
const mongoDBConfig = require('./mongoDBConfig');

class databaseConnector {
  static async connect() {

    
    try{
      await mongoose.connect(mongoDBConfig.mongoURI,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );

      console.log("Successfully connected to MongoDB");
    } catch(e){
      console.error("Cannot connect to MongoDB: ",e);
    }
    /*

    mongoose.connection.on('open', function (ref) {
        console.log('Connected to mongo server.');

        mongoose.connection.db.listCollections().toArray(function (err, names) {
            console.log(names);
        });
    });
    */
  };

}



module.exports = databaseConnector;
