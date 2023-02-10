import TelegramBot from "node-telegram-bot-api";
import { config } from "dotenv";
import invariant from "tiny-invariant";
import { Configuration, OpenAIApi } from "openai";

config();
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
})
const token = process.env.TELEGRAM_BOT_TOKEN
const openai = new OpenAIApi(configuration)

invariant(token, "Couldn't read the token the enviroment variable")

const bot = new TelegramBot(token, {polling: true});

let selectedTone: string;


bot.onText(/\/echo(.+)/, (msg, match) => {
  
    // The 'msg' is the received Message from Telegram
    // and 'match' is the result of executing the regexp 
    // above on the text content of the message
     
    const chatId = msg.chat.id;
     
    // The captured "whatever"
    const resp = match[1]; 
     
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId,resp);
     
   });

bot.on("message", async (msg) => {
    // Retrieve the selected tone from the variable or the database.
    if (!selectedTone) {
        console.log("Doesn't found"); 
        return;
    }


    const prompt = `"I want to reply in ${selectedTone} tone. ${msg.text}".`

    const baseCompletion = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt,
        temperature: 0.8,
        max_tokens: 250,
    });

    console.log(baseCompletion.data.usage?.prompt_tokens)
    const basePromptOuput = baseCompletion.data.choices.pop()

    const chatId = msg.chat.id

    invariant(basePromptOuput?.text, "Couldn't receive something from OpenAI")
    bot.sendMessage(chatId, basePromptOuput?.text)
    
});


