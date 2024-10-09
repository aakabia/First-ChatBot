import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import { toggleChatBot } from "../utils/helpers";


function ChatBot() {
  
  useEffect(() => {

    const cleanup = toggleChatBot();
    // Above, we call toggleChatBot and assign its return function to clean up 
    // Even though we attach to variable, as we call the event listener is active when component mounted
    
    return () => {
      if (cleanup) cleanup();

    };
    // Above, we use our cleanup fucntion to remove event listener if cleanup exists. 
    // This happens when component  unmounts 

  }, []);
  // The purpose of useEffect is to manage side effects in functional components.
  // The return function is optional for clean up but is good practice.
  // The empty array is the dependency, empty array means this will run only once and that is when component first mounts.



  return (
    <section className="container-fluid showChatBot " id = "chatSection" >
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
                {" "}
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
            ></textarea>
            <span className="material-symbols-outlined" id="sendBtn">
              send
            </span>
          </div>
        </section>
      </div>
    </section>
  );
}

export default ChatBot;
