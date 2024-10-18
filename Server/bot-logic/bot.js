const mongodb = require("mongodb");
// Above, imports mongo db to create id for messages


botController = async (controller, collection) => {

    // Above is a async function that sets up our bot;
    // It takes in the controller conig  and database collection

    
  controller.handleMessage = async function (socket, message, userId) {
    // handleMessage is a custom function added to our controller. It takes the socket and a message.
    try {
      if (!message || !message.text) {
        console.error("Invalid message object:", message);
        return;
      }
      // Above validates we have a message to process

      //console.log("Received message:", message);

      let responseMessage = "I heard: " + message.text;

      const responseObj = { responseText: responseMessage, isBot: true }; // Simple echo response
      // Process the message and generate a response as a object

      const structuredMessage = {
        _id: new mongodb.ObjectId(),
        userId: userId,
        messageInfo: {
          messageId: new mongodb.ObjectId().toHexString(),
          text: message.text || "",
          user: message.socketUser || "",
          channel: message.channel || "",
          conversation: {
            id: message.conversation ? message.conversation.id : "",
          },
          type: "message",
          response: responseObj,
        },
        createdAt: new Date(),
      };

      // Above we structure the message before saving to db.

      console.log("structured message:", structuredMessage);

      try {
        const result = await collection.insertOne(structuredMessage);
        //console.log("Document inserted:");
      } catch (error) {
        console.error("Error inserting document into the database:", error);
      }
      // Above we add the structured message into the db

      console.log("Message saved to database:", responseObj);

      console.log("Triggering reply with response:", responseObj);
      
      controller.trigger("reply", socket, {
        responseObj,
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

  controller.on("reply", async (socket, { responseObj, originalMessage }) => {
    try {
      if (!responseObj || !originalMessage || !originalMessage.text) {
        console.error("Invalid reply data:", { responseObj, originalMessage });
        return; // Exit if the expected data is not present
      }
      // Above, validates that responseText and originalMessage are defined

      console.log("Sending reply:", responseObj);
      socket.emit("chat response", responseObj);
      // Above, sends the reply back to the socket
    } catch (error) {
      console.error("Error in reply handler:", error);
    }
  });

   // Above controller.on("reply" triggers once controller.handleMessage structures our messgae and sends it to db.
  // It takes in the variables we used to trigger it for later use.
  // We use socket.emit to send the response back to client




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
};


// botController helps set up different events that help our bot handle messages.

module.exports= {botController}
