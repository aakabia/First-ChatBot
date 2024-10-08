const mongodb = require("mongodb");

// Above, is a a import of mongo db for storage use.

const { MongoDbStorage } = require("botbuilder-storage-mongodb");

// Above is a import for MongoDbStorage to give storage for our bot.

const { Botkit } = require("botkit");

// Above, imports bot kit that is used for building conversational bots that can interact with different platforms

const { WebAdapter } = require("botbuilder-adapter-web");

// Above, the  WebAdapter is responsible for connecting the bot to web-based clients (such as a chatbot embedded in a web page).

const { Server } = require("socket.io");

// Above, is th server class that represents the Socket.IO server that handles WebSocket communication

const http = require("http");
// Above, we require http for client side http operations, creating and managing our webserver and handeling requests with our websocket.

// Above is astorage adapter for our bot

const PORT = process.env.PORT || 3002;
// Above is our port the server will run on.

const mongoClient = new mongodb.MongoClient(
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/botdata",
  { useUnifiedTopology: true }
);

// Above is our client connection to mongodb.

async function start() {
  // Above is our start function responsible for our server instance and mongo connection.

  await mongoClient.connect();
  // Above we connect to mongo
  const database = mongoClient.db();
  // Above we connect to the database
  const collection = database.collection("botstorage");
  // Above we make a collection within the db.

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
  // controller.webserver is like a a express instance

  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3001", // Your front-end URL
      methods: ["GET", "POST"],
    },
  });

  // Above, is a instance of our websocket that attaches our websocket to the same http server as our controller.
  // This enabels real-time features like chat messages between the client and server.

  controller.handleMessage = async function (socket, message) {
    // handleMessage is a custom function added to our controller. It takes the socket and a message.
    try {
      if (!message || !message.text) {
        console.error("Invalid message object:", message);
        return;
      }
      // Above validates we have a message to process

      console.log("Received message:", message);

      const responseText = "I heard: " + message.text; // Simple echo response
      // Process the message and generate a response

      const structuredMessage = {
        _id: new mongodb.ObjectId(),
        messageInfo: {
          messageId: new mongodb.ObjectId().toHexString(),
          text: message.text || "",
          user: message.user || "",
          channel: message.channel || "",
          conversation: {
            id: message.conversation ? message.conversation.id : "",
          },
          type: "message",
          response: responseText,
        },
      };

      // Above we structure the message before saving to db.

      console.log("structured message:", structuredMessage);

      try {
        const result = collection.insertOne(structuredMessage);
        console.log("Document inserted:");
      } catch (error) {
        console.error("Error inserting document:", error);
      }
      // Above we add the structured message into the db

      console.log("Message saved to database:", responseText);

      console.log("Triggering reply with response:", responseText);
      controller.trigger("reply", socket, {
        responseText,
        originalMessage: message,
      });

      // Above, triggers the reply event with a clear structure
      // controller.trigger triggers our reply
    } catch (error) {
      console.error("Error in handleMessage:", error);
    }
  };

  // Above, controller.handleMessage handles the functionality for our bot while keeping the controller properties.
  // We pass our socket and message into this function in order to structure and pass them to controller.on("reply".

  controller.on("reply", async (socket, { responseText, originalMessage }) => {
    try {
      if (!responseText || !originalMessage || !originalMessage.text) {
        console.error("Invalid reply data:", { responseText, originalMessage });
        return; // Exit if the expected data is not present
      }
      // Above, validates that responseText and originalMessage are defined

      console.log("Sending reply:", responseText);
      socket.emit("chat response", { text: responseText });
      // Above, sends the reply back to the socket
    } catch (error) {
      console.error("Error in reply handler:", error);
    }
  });

  // Above controller.on("reply" triggers once controller.handleMessage structures our messgae and sends it to db.
  // It takes in the variables we used to trigger it for later use.
  // We use socket.emit to send the response back to client

  io.on("connection", (socket) => {
    console.log("New WebSocket connection established.");

    socket.emit("chat response", "Hello! How can I assist you today?");
    // Above initally sends a respones from our web socket or bot.

    socket.on("chat message", async (msg) => {
      // "chat message" is not a predefined event in the Socket.IO documentation. It's a custom event name
      // In Socket.IO, event types (or event names) are user-defined, meaning you can name them whatever makes sense for your app.

      if (!msg || typeof msg !== "string") {
        socket.emit("chat response", "Invalid message format.");
        return;
      }
      // Above is validation to make sure msg is a string that exists.

      console.log("Message received: " + msg);

      const newMessage = {
        text: msg,
        channel: socket.id,
        user: socket.id,
        type: "message",
        conversation: {
          id: socket.id,
        },
        channelId: "websocket",
      };

      // Above, creates a new message format we want to pass to handle message.

      console.log("New message being triggered:", newMessage);

      await controller.handleMessage(socket, newMessage);

      // Above, we pass the socket and newMessage to our custom controller function controller.handleMessage
      // This allows us to keep using the socket outside of this scope.
      console.log("**************finish***********");
    });

    socket.on("disconnect", () => {
      // "disconnect" is a predifined event in docs
      console.log("WebSocket connection disconnected.");
    });
    // Above logs when the socket is disconnected.
  });

  // io.on is a event listener is set up to listen for new WebSocket connections.
  // newMessage creates a new message object with properties we want as part of our message.

  controller.webserver.get("/", (req, res) => {
    res.send("Your bot is running and ready to accept messages.");
  });

  // Above sets a get route for recieving a static page that validates our bot is running

  controller.webserver.get("/messages", async (req, res) => {
    try {
      const messages = await collection.find({}).toArray(); // Adjust based on your storage method
      res.json(messages);
    } catch (error) {
      console.error("Error retrieving messages:", error);
      res.status(500).send("Error retrieving messages");
    }
  });

  // Above gets all our data for us to see at that /messages route.
  //  We use collection.find({}).toArray() to achieve this.

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });

  // Above, we start our server and listen on a specified port.
}

try {
  start();
} catch (error) {
  console.error("Error starting the application:", error);
}

// Above we start our application within a try catch.
// start is responsible for our bot logic
