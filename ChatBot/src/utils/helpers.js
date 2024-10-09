




export const toggleChatBot = (event)=>{
    let tglBtn = document.querySelector(".chatBot-toggler");
    const chatSection = document.getElementById("chatSection");

    // Above, we get the the btn to toggle our chatbot 
    // Also, we get the the section of our page our chat bot is located at.


    if (tglBtn) {
        // Above ensures the tgl btn exists 

        const handleClick = () => {
            //console.log("I clicked")
          chatSection.classList.toggle("showChatBot");
        };
        // through the use of closure and scope , handleClick has access to chat section
        // we use .toggle to toggle the showChatBot class within the container or section 

        tglBtn.addEventListener("click", handleClick);

        // Above, we add a event listener to our tglBtn and pass handle click to toggle the class.  

        return () => {
            tglBtn.removeEventListener("click", handleClick);
        };

        // toggleChatBot returns a function to handle clean up for our useEffect
        // the clean up simply removes the event listener.
      
    }


}