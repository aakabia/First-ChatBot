
const OpenAI = require("openai");
const openai = new OpenAI();

async function fetchHaiku() {
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a customer support chatbot for an e-commerce website that sells electronics. The website offers free shipping, a 30-day return policy, and has products like smartphones, laptops, and gaming accessories." },
            {
                role: "user",
                content: "What is your return policy?",
            },
        ],
    });

    console.log(completion.choices[0].message.content);
}

module.exports = {fetchHaiku};