const OpenAI = require("openai");
// Above we require the openai package

async function botOpenAIResponse(userInput) {
  try {
    if (typeof userInput !== "string") {
      console.log("Invalid date type for api call!");
      return;
    }
    // Above Error handels for the correct data type

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    // Above creates your open ai instance with your api key.

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a compassionate therapist that responds in a calming and supportive tone, but you do not provide advice on self-harm or medical issues. You answer only to responses concerning therapy. ",
        },
        {
          role: "user",
          content: userInput,
        },
      ],
    });

    // Above creates a chat completion using the OpenAI API.

    //console.log(completion.choices[0].message.content);
    return completion.choices[0].message.content;
    // Above is  accessing the response and returning it.
  } catch (error) {
    console.error("Error Fetching response from Open AI :", error);
    throw error;
  }
}

module.exports = { botOpenAIResponse };
