function ChatBot() {
  return (
    <section className="container-fluid ">
      <div className="row ">
        <section className="chatBot">

          <div className="chatHeader">ChatBot</div>

          <ul className="chatBox">
            <li className="chat incoming">
                <span className="material-symbols-outlined">smart_toy</span>
                <p> Hello 👋, <br/> how can I help today?</p>
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
                <textarea name="chatQuery" placeholder="Enter a message..."></textarea>
                <span className="material-symbols-outlined"  id="sendBtn">send</span>
            </div>

        </section>
      </div>
    </section>
  );
}

export default ChatBot;
