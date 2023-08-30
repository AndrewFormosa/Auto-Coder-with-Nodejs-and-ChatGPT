
require('dotenv').config();
const  calledFunctions=require('./called_functions');


// OPEN AI FUNCTIOJ CALL  _________________________________________________________


const { Configuration, OpenAIApi } = require("openai");
const { error } = require('console');
const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
  });
const openai = new OpenAIApi(configuration);

//CHECK FOR TOKEN LIMIT
let initialPrompt = 'You are an AI coder that can create anything by writing and reading all of the necessary code and files to and from a file on a computer. You will be given specific functions that you can run. Only use those functions, and do not respond with a message directly. You will first ask the user to describe the project that they want built and you will help them build it. Build the project step by step by calling the proveded functions. If you need clarification then use the ask_for_more_information function. When finished you will call the ask_for_more_information function.';
let tokenResetPoint = 4000;

let allMessages = [
  { role: 'user', content: initialPrompt },
];

let lastUserInstruction;


async function convers(){

  openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: allMessages,
    functions: calledFunctions.functions,
    function_call: 'auto', // or 'none' to force user-facing message
  }).then(
    response=>{

      const responseMessage = response.data.choices[0].message;

      allMessages.push(responseMessage);

      if (responseMessage.function_call) {
        const functionName = responseMessage.function_call.name;
        const functionArgs = JSON.parse(responseMessage.function_call.arguments);
        const argArray = Object.values(functionArgs);

      
         const functionToUse = calledFunctions.available_functions[functionName];
         functionToUse(argArray[0],argArray[1]).then(
          res=>{

            const functionResponse = {
              role: 'function',
              name: functionName,
              content: res,
            };          

            allMessages.push(functionResponse);

            //MANDAGE TOKEN RESET
            if(functionName=="ask_for_more_information"){
              lastUserInstruction=res;
            }
            const totalTokens = response.data.usage.total_tokens;
            console.log('Total Tokens: '+totalTokens);

            if(totalTokens>tokenResetPoint){
              console.log('last user in:'+calledFunctions.lastUserInstruction);
              console.log('YOU ARE ABOUT TO REACH THE TOKEN LIMIT FROM CHAT-GPT.\n---------------------------\nIn order to avoid crashing. The conversation history will be deleted and ChatGPT will be now read all the files and attempt to continue with your last request...');
   
              allMessages = [
                { role: 'user', content: initialPrompt },
                { role: 'user', content: 'First, Please familiarise yourself with the content of all of contents of the files and then carry our the following: '+lastUserInstruction}
              ];
            }
            convers();
          }
        ); 
      }else{
        calledFunctions.askForMoreInformation(responseMessage.content).then(
          res=>{
            lastUserInstruction=res;
            allMessages.push({role:'user',content:res});
            convers();
          })
      }

    }
  ).catch(error=>{
    //Handle Error
    console.log("There has been an ERROR - restart attempted");
    allMessages = [
      { role: 'user', content: initialPrompt },
      { role: 'user', content: 'First, Please familiarise yourself with the content of all of contents of the files and then carry our the following: '+lastUserInstruction}
    ];
    convers();
  });

}

//START PROGRAM

console.log('Welcome to my auto coder - Inspired by a video from Unconventional Coding who wrote one in Python, I wanted to give it a go with Nodejs.\nTo quit the program you can simply type quit at any time.\nHave Fun!!..')
convers();

