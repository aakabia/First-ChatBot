import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { toggleChatBot } from "../utils/helpers";
import { v4 as uuidv4 } from "uuid";
// Above we import our react tools, our io to interact with the server and our helper functions.

function ChatBot() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [prevMessages, setPrevMessages] = useState([]);
  const socketRef = useRef(null);
  const chatBoxRef = useRef(null);

  /*You can store any mutable value in a ref, 
  like timers, intervals, or even function 
  references,without causing re-renders.
  it helpsKeeping a mutable value that doesn't require re-rendering
  when changed (like a WebSocket connection). 
  */

  /* Also, we use use ref to gain refrence to our chatbox conatiner for scrolling effects.*/ 

  let userId = localStorage.getItem("userId");

  if (!userId) {
    userId = uuidv4();
    localStorage.setItem("userId", userId);
  }

  // Above is going to keep track of user sessions with a tracked uuid in local storage.
  // UUIDs provide a way to track users without requiring them to log in.

  useEffect(() => {
    const cleanup = toggleChatBot();
    // Above, we call toggleChatBot and assign its return function to clean up
    // Even though we attach to variable, as we call the event listener is active when component mounted

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3002";
    socketRef.current = io(socketUrl, {
      query: { userId },
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

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [prevMessages, messages]);

  // The use Effect Above is responsible for scrolling our page whenever our messages or prevMessages Array change.
  // It sets our scrollTop property for our chatbox element to the scrollHeight of the element. 





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

          
            <ul className="chatBox" ref={chatBoxRef}   >
              {/* Above we use our chatBox reference */}
              {prevMessages.map((item, index) => (
                <React.Fragment key={index}>
                  <li className="chat outgoing">
                    <p>{item.responseText}</p>
                  </li>
                  {/* Above is used to Render user messages from prevMessages array */}

                  <li className="chat incoming">
                    <span className="material-symbols-outlined">smart_toy</span>
                    <p>{item.response.responseText}</p>
                  </li>
                  {/*  ABove is used to Render bot response from prevMessages Array. */}
                  {/* React fragement helps group multiple sibling elements without adding extra nodes. */}
                  {/* I use fragment becuase we need to return two elements from our prev messages array */}
                </React.Fragment>
              ))}

              {/* Above, we map over our prevMessages array and use react fragment to group elements in order to return multiple elements as one element. */}
              {/* We are returing two li in this fragment. */}

              {messages.map((item, index) => (
                <li
                  className={`chat ${item.isBot ? "incoming" : "outgoing"}`}
                  key={index}
                >
                  {/* Above usees the teranary operator to help desplay css.  */}

                  {item.isBot && (
                    <span className="material-symbols-outlined">smart_toy</span>
                  )}

                  {/* Above, only displays a span if isBot is true.  */}

                  <p>{item.isBot ? item.responseText : item.text}</p>
                </li>
              ))}
              {/* Above, we map over our messages array and only return one element per index so we do not use fragment here. */}
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
