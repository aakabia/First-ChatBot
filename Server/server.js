const { Botkit } = require("botkit");

// Above, imports bot kit that is used for building conversational bots that can interact with different platforms

const { WebAdapter } = require("botbuilder-adapter-web");

// Above, the  WebAdapter is responsible for connecting the bot to web-based clients (such as a chatbot embedded in a web page).

const { Server } = require("socket.io");

// Above, is th server class that represents the Socket.IO server that handles WebSocket communication

const http = require("http");
// Above, we require http for client side http operations, creating and managing our webserver and handeling requests with our websocket.

const PORT = process.env.PORT || 3002;
// Above is our port the server will run on.

const adapter = new WebAdapter();
// Above, is a new instance of WebAdapter is created.
// This , This adapter will be used by Botkit to manage communication between the bot and the web-based frontend.

const controller = new Botkit({ adapter: adapter });

// Above, initializes the Botkit controller.
// The controller manages the bot’s behavior, including handling messages, events, and dialogs.
//  We pass the adapter (created earlier) to Botkit so it knows how to communicate with the web interface.

const server = http.createServer(controller.webserver);
// Above, we create n HTTP server and pass our webserver from our controller object.
// controller.webserver handles incoming HTTP requests and routes them appropriately for your bot.
// controller.webserver is like a a express instance

const io = new Server(server);

// Above, is a instance of our websocket that attaches our websocket to the same http server as our controller.
// This enabels real-time features like chat messages between the client and server.

io.on("connection", (socket) => {
  console.log("New WebSocket connection established.");

  socket.on("chat message", async (msg) => {
    // "chat message" is not a predefined event in the Socket.IO documentation. It's a custom event name
    // In Socket.IO, event types (or event names) are user-defined, meaning you can name them whatever makes sense for your app.


    if (!msg || typeof msg !== "string") {
      socket.emit("chat response", "Invalid message format.");
      return;
    }
    // Above is validation to make sure msg is a string that exists.


    console.log("Message received: " + msg);
    // We console.log if our message is valid 

    const newMessage = {
      text: msg,
      channel: socket.id,
      user: socket.id,
    };

    try {
      await controller.adapter.bot.reply(newMessage, "I heard: " + msg);
      console.log("Controller hears message:", newMessage.text);

      socket.emit("chat response", "I heard: " + msg);
    } catch (error) {
      console.error("Error processing message:", error);
      socket.emit(
        "chat response",
        "Sorry, there was an error processing your message."
      );
    }

    // Above, uses a try catch block to await our bots reply 
    // Then we pass our socket that same response to deliver to client. 
  });

  socket.on("disconnect", () => {
    // "disconnect" is a predifined event in docs 
    console.log("WebSocket connection disconnected.");
  });
  // Above logs when the socket is disconnected.
});

// io.on is a event listener is set up to listen for new WebSocket connections. 
// newMessage creates a new message object with three properties.
// newMessage represents the context of the message or the user interaction thats why it is passed as first param in bot.reply
// await controller.adapter.bot.reply  uses Botkit's reply method to generate a response based on the new message object. 
// The response is crafted to indicate that the bot heard the message.
// socket.emit sends a message back to the client through the WebSocket connection. 
// The event "chat response" is emitted along with a string that acknowledges the received message.




controller.webserver.get("/", (req, res) => {
  res.send("Your bot is running and ready to accept messages.");
});

// Above sets a get route for recieving a static page that validates our bot is running



server.listen(PORT, () => {
  console.log(`Listening on *:http://localhost:${PORT}`);
});

// Above, we start our server and listen on a specified port. 