require("dotenv").config();
const http = require("http");
const { MongoDbStorage } = require("botbuilder-storage-mongodb");
const { Botkit } = require("botkit");
const { WebAdapter } = require("botbuilder-adapter-web");
const { Server } = require("socket.io");
const { mongoConnection } = require("./config/connection");
const { botController } = require("./bot-logic/bot");
const { setupSocket } = require("./bot-logic/socket");

// Above is a import for MongoDbStorage to give storage for our bot.
// Above, imports bot kit that is used for building conversational bots that can interact with different platforms
// Above, the  WebAdapter is responsible for connecting the bot to web-based clients (such as a chatbot embedded in a web page).
// Above, is th server class that will represent the Socket.IO server that handles WebSocket communication
// Above, we require http for client side http operations, creating and managing our webserver and handeling requests with our websocket.
// Above, dotenv is responsible for our enviornment variables.
// mongoConnection establishes connection to our db and returns the collection
// botController sets events on the controller object from botkit.
// setupSocket sets events on the websocket/io object from Server 

const PORT = process.env.PORT || 3002;
// Above is our port the server will run on.

// Above is our client connection to mongodb.

async function start() {
  try {
    const { collection, mongoClient } = await mongoConnection();

    const mongoStorage = new MongoDbStorage(collection);
    // Above, we assign that collection for storage

    const adapter = new WebAdapter();
    // Above, is a new instance of WebAdapter is created.
    // This , This adapter will be used by Botkit to manage communication between the bot and the web-based frontend.

    const controller = new Botkit({
      adapter: adapter,
      storage: mongoStorage,
      logLevel: "debug",
      webhook_uri: "/api/messages",
    });

    // Above, initializes the Botkit controller.
    // The controller manages the bot’s behavior, including handling messages, events, and dialogs.
    //  We pass the adapter (created earlier) to Botkit so it knows how to communicate with the web interface.
    // We pass our mongoStorage for storage use
    // logLevel allows us to debug better.

    const server = http.createServer(controller.webserver);
    // Above, we create n HTTP server and pass our webserver from our controller object.
    // controller.webserver handles incoming HTTP requests and routes them appropriately for your bot.
    // controller.webserver is like a a express server instance

    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3001", // Your front-end URL
        methods: ["GET", "POST"],
      },
    });

    // Above, is a instance of our websocket that attaches our websocket to the same http server as our controller.
    // This enabels real-time features like chat messages between the client and server.
    // We add the cors property to handle dealing with cors verification on front end.

    await botController(controller, collection);
    // Above we create our bot functionality  with the functions defined in botController
    // We pass in controller as argument to have acess to botkit controller.

    await setupSocket(io, collection, controller);
    // Above we set up our socket functionality with the functions defined in setupSocket
    // We pass in the controller as a argument to let the io websocket communicate with our controller.

    // We do not assign either botController or setupSocket because they are meant to set up events and sideffects on the controller object and io object.

    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    //Above, we start our server and listen on a specified port.
  } catch (error) {
    console.error("Error starting the application:", error);
    throw error;
  }
}

start();
