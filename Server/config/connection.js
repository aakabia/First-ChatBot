const mongodb = require("mongodb");


mongoConnection = async () => {


    try{
  const mongoClient = new mongodb.MongoClient(
    process.env.MONGODB_URI || process.env.bot_data_db);

  // Above is our client connection to mongodb.


  await mongoClient.connect();
  // Above we connect to mongo
  const database = mongoClient.db();
  // Above we connect to the database
  const collection = database.collection("botstorage");
  // Above we make a collection within the db.

  await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 1800 });
  // Establish a TTL index for each entry in db to maintain db.
  // 1800 seconds equals 30 mins

  console.log("Successfully connected to the database and created the TTL index.");

  return {collection,mongoClient}


  }catch (error) {
    console.error("Error Connecting to database:", error);
    throw error;
  }
};

module.exports= { mongoConnection};