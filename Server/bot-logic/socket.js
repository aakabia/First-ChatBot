setupSocket = async (io, collection, controller) => {

    // Above is a async function that sets up our web socket;
    // It takes in the io connection, controller for our bot and database collection


  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    // Above is the passed UUID from client to the server via the socket.

    console.log(`New WebSocket connection established.`);

    try {
      const messages = await collection.find({ userId: userId }).toArray(); // Convert cursor to array

      if (messages.length === 0) {
        console.log("No messages found for user.");
      }

      let initalMessage = "Hello! How can I assist you today?";

      const initalMessageObj = { responseText: initalMessage, isBot: true };

      socket.emit("chat response", initalMessageObj);
      // Above initally sends a respones from our web socket.

      //console.log("Messages:", messages);

      const newPrevMessageArr = messages.map((message) => {
        const {
          messageInfo: { text, response },
        } = message;

        // Above is destructuring a object within a object
        // messageInfo is a object within the messages object
        // we destructure the text and response from messageInfo

        const prevMessageTextObj = { responseText: text, response };

        return prevMessageTextObj;
      });

      //console.log(newPrevMessageArr)
      // Above maps through our messages from our db and formats them for use in front end.

      socket.emit("previous messages", newPrevMessageArr);
      // Above emits our response to the client on "previous messages" event.
    } catch (error) {
      console.error("Error fetching Previous Messages:", error);
    }

    // Above is a try catch block that queries our db for all messages from the user and sends it back on first load if any exist.

    socket.on("chat message", async (msg) => {
      // "chat message" is not a predefined event in the Socket.IO documentation. It's a custom event name
      // In Socket.IO, event types (or event names) are user-defined, meaning you can name them whatever makes sense for your app.

      if (!msg || typeof msg !== "string") {
        socket.emit("chat response", "Invalid message format.");
        return;
      }
      // Above is validation to make sure msg is a string that exists.

      //console.log("Message received: " + msg);

      const newMessage = {
        text: msg,
        channel: socket.id,
        socketUser: socket.id,
        type: "message",
        conversation: {
          id: socket.id,
        },
        channelId: "websocket",
      };

      // Above, creates a new message format we want to pass to handle message.

      console.log("New message being triggered:", newMessage);

      await controller.handleMessage(socket, newMessage, userId);

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
};

// io.on is a event listener is set up to listen for new WebSocket connections.
// newMessage creates a new message object with properties we want as part of our message.
// setupSocket helps us event listeners for our frontend and backend communication.
// You can achieve this by adding events to the socket.

module.exports = { setupSocket };
