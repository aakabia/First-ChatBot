const { Botkit } = require("botkit");

// Above, imports bot kit that is used for building conversational bots that can interact with different platforms

const { WebAdapter } = require("botbuilder-adapter-web");

// Above, the  WebAdapter is responsible for connecting the bot to web-based clients (such as a chatbot embedded in a web page).

// Initialize the WebAdapter
const adapter = new WebAdapter();
// Above, is a new instance of WebAdapter is created.
// This , This adapter will be used by Botkit to manage communication between the bot and the web-based frontend.

const controller = new Botkit({ adapter: adapter });

// Above, initializes the Botkit controller.
// The controller manages the bot’s behavior, including handling messages, events, and dialogs.
//  We pass the adapter (created earlier) to Botkit so it knows how to communicate with the web interface.

controller.hears(".*", "message", async function (bot, message) {
  await bot.reply(message, "I heard: " + message.text);
  console.log("Controller hears message:", message);
});

// controller.hears() is a Botkit method used to listen for specific patterns in incoming messages.
// .* is the first arg that tells the bot to listen to all messages.
// The second argument, "message", specifies the type of event to listen
// The third argument is an asynchronous function that defines how the bot should respond.
// The bot object that provides methods for interacting with the user (like replying to messages).
// message is need as first arg in bot.reply for meta data about the message the bot needs.
// The message object that contains information about the incoming message, including the text the user sent.
// Last,  we await the reply with bot.reply


controller.webserver.get("/", (req, res) => {
    res.send("Your bot is running and ready to accept messages.");
});
  
controller.webserver.listen(3002, () => {
    console.log("Web server is listening on port 3002");
});

// controller.webserver is an Express web server that Botkit automatically sets up. 
// This allows you to add routes and serve pages or respond to HTTP requests.
// .get sets up a route 
// .listen sets up the server. 