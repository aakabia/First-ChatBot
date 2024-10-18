import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { toggleChatBot } from "../utils/helpers";
import { v4 as uuidv4 } from 'uuid';
// Above we import our react tools, our io to interact with the server and our helper functions.

function ChatBot() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [prevMessages, setPrevMessages] = useState([]);
  const socketRef = useRef(null);

  /*You can store any mutable value in a ref, 
  like timers, intervals, or even function 
  references,without causing re-renders.
  it helpsKeeping a mutable value that doesn't require re-rendering
  when changed (like a WebSocket connection). 
  */

  let userId = localStorage.getItem('userId');

  if (!userId) {
      userId = uuidv4();
      localStorage.setItem('userId', userId);
  }

  // Above is going to keep track of user sessions with a tracked uuid in local storage.
  // UUIDs provide a way to track users without requiring them to log in.





  useEffect(() => {
    const cleanup = toggleChatBot();
    // Above, we call toggleChatBot and assign its return function to clean up
    // Even though we attach to variable, as we call the event listener is active when component mounted

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3002";
    socketRef.current = io(socketUrl,{
      query: { userId }
    });
    // Above, is our connection to our web socket.
    // It ensures for production and local development.
    // Above, whenever we query the socket we will pass the same uuid for this session. 

    socketRef.current.on("chat response", (msg) => {
      console.log("Message from server:", msg);
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Above, indicates what we want to happen on the client end when the server / websocket sends a chat response
    // It logs the message and adds it to our messages array.

    socketRef.current.on("previous messages", (msgs) => {
      console.log("Previous Message from server:", msgs);
      setPrevMessages((prevMessages) => [...prevMessages, ...msgs]);
    });

    // Above we spread msgs in order to unpack them into one array.

    

    return () => {
      if (cleanup) cleanup();
      socketRef.current.disconnect();
      socketRef.current.off("chat response");
      socketRef.current.off("previous messages");
    };
    // Above, we use our cleanup fucntion to remove event listener if cleanup exists.
    // This happens when component  unmounts
  }, []);
  // The purpose of useEffect is to manage side effects in functional components.
  // The return function is optional for clean up but is good practice.
  // The empty array is the dependency, empty array means this will run only once and that is when component first mounts.



  useEffect(() => {
    console.log("Messages array updated:", messages);
    console.log("PrevMessages array updated:", prevMessages);
  }, [messages]);

  // Above logs the two arrays every time the messages array changes.




  const sendMessage = () => {
    if (inputValue.trim()) {
      // .trim here allows us to run whats below if a value occurs.

      console.log("Sending message:", inputValue);

      socketRef.current.emit("chat message", inputValue);
      // Above, emits a message to the server. emit helps sends to server.

      console.log("Adding to messages:", { text: inputValue, isBot: false });
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: inputValue, isBot: false },
      ]);

      setInputValue("");
    }
  };
  // Above helps send a message to our chatbot for processing.

  return (
    <section className="container-fluid showChatBot " id="chatSection">
      <div className="row ">
        <button className="chatBot-toggler">
          <span className="material-symbols-outlined">mode_comment</span>
          <span className="material-symbols-outlined">close</span>
        </button>

        <section className="chatBot">
          <div className="chatHeader">
            <h2>ChatBot</h2>
            <span className="material-symbols-outlined">close</span>
          </div>

          <ul className="chatBox">
            <li className="chat incoming">
              <span className=" material-symbols-outlined">smart_toy</span>
              <p>
                Hello 👋, <br /> how can I help today?
              </p>
            </li>

            <li className="chat outgoing">
              <p>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quae
                doloribus nihil dignissimos non nam! Reprehenderit, explicabo
                molestiae veniam iusto esse temporibus optio repellat molestias
                iste!
              </p>
            </li>
          </ul>

          <div className="chatInput">
            <textarea
              name="chatQuery"
              placeholder="Enter a message..."
              required
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            ></textarea>
            {/* Above, we use setInputval on the onchange event handler. We asign the events target value. */}
            {/* Also, we use value and set input value in {} for the text arear to always retain that value.*/}
            <span
              className="material-symbols-outlined"
              id="sendBtn"
              onClick={sendMessage}
            >
              send
            </span>
          </div>
        </section>
      </div>
    </section>
  );
}

export default ChatBot;
