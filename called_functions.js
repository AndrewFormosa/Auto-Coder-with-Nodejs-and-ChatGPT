const { error } = require('console');
const fs = require('fs');
const path = require('path');
const { exit } = require('process');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const folderPath='./AUTO_PROJECTS';



const functions = [
  {
    name: 'list_files',
    description: 'Retruns a list of all of the files available',
    parameters: {
      type: 'object',
      properties: {
      },
      required: [],
    },
  },
  {
    name:'read_file',
    description:'Returns the content of the specified file',
    parameters:{
        type:'object',
        properties:{
            fileName:{
              type:'string',
              description:'the name of the file to be read'  
            }
      
        },
        requires:['fileName'],
    },
  },
  {
    name:'write_file',
    description:'Creates or writes-over the file content into the specified file',
    parameters:{
        type:'object',
        properties:{
            fileName:{
              type:'string',
              description:'the name of the file to be writin to'  
            },
            fileContent:{
              type:'string',
              description:'the content to be writen into the file'
            }
      
        },
        requires:['fileName','fileContent'],
    },
  },
  {
    name:'append_file',
    description:'appends the file content into the specified file',
    parameters:{
        type:'object',
        properties:{
            fileName:{
              type:'string',
              description:'the name of the file to be appended to'  
            },
            fileContent:{
              type:'string',
              description:'the content to be appended into the file'
            }
      
        },
        requires:['fileName','fileContent'],
    },
  },
  {
    name:'delete_file',
    description:'deleted the specified file',
    parameters:{
        type:'object',
        properties:{
            fileName:{
              type:'string',
              description:'the name of the file to be deleted'  
            }
      
        },
        requires:['fileName'],
    },
  },
  {
    name:'ask_for_more_information',
    description:'displays a question to the user and returns the answer',
    parameters:{
        type:'object',
        properties:{
            question:{
              type:'string',
              description:'the question aked to ask the user.'  
            }
      
        },
        requires:['question'],
    },
  },
];

const available_functions = {
  "list_files": listFiles,
  "read_file":readFile,
  "ask_for_more_information":askForMoreInformation,
  "write_file":writeFile,
  "delete_file":deleteFile,
  "append_file":appendFile
} 


async function listFiles() {
  console.log('FUNCTION CALLED: LIST FILES.');
  try{
  const files = fs.readdirSync(folderPath);
  const fileList = files.filter(file => fs.statSync(path.join(folderPath, file)).isFile());
  const response = fileList.join(', ');
  console.log('FILES LISTED: '+response);
  return response;
  } catch(error) {
    console.log('Error retrieving list of files');
    throw new Error('Error retrieving list of files: '+error);
  }

}
 
async function readFile(fileName) {
  console.log('FUNCTION CALLED: READ FILE');
  try {
    const filePath = path.join(folderPath, fileName);
    const content = fs.readFileSync(filePath, { encoding: 'utf-8' }); // Set the encoding option here
    console.log("FILE READ: "+fileName);
    return content;
  } catch (error) {
    throw new Error('Error reading file: ' + error);
  }
}

async function writeFile(fileName,fileContent){
  console.log('FUNCTION CALLED: WRITE FILE');
  try{
    const filePath= path.join(folderPath,fileName);
    fs.writeFileSync(filePath,fileContent);
    console.log("WRITE FILE: "+fileName);
    return ('File writen ok: '+ fileName);
  }catch{
    return error('Error writing to file '+error);
  }
}

async function deleteFile(fileName){
  console.log('FUNCTION CALLED: DELETE FILE');
  try{
    const filePath= path.join(folderPath,fileName);
    if(fs.existsSync(filePath)){
        fs.unlinkSync(filePath);
        console.log("FILE DELETED: "+fileName);
        return('File deleted ok: '+fileName);
    }else{
      return('File does not exist: '+fileName);
    }
  }catch{
    return error('Error deleting file '+error);
  }
}

async function appendFile(fileName, fileContent){
  console.log('FUNCTION CALLED: APPEND FILE');
  try{
    const filePath= path.join(folderPath,fileName);
    fs.appendFileSync(filePath,fileContent);
    console.log("APPEND FILE: "+fileName);
    return ('File appended ok: '+fileName);
  }catch{
    return error('Error appending to file '+error);
  }
}

async function askForMoreInformation(question,empty){
try{
    return new Promise((resolve) => {
      const fullQuestion = question + '(Type "quit" to quit program). Please type your response: ';
     // process.stdin.resume(); // Flush the input buffer
      readline.question(fullQuestion, (input) => {
        if(input=='quit'){
          console.log('Thank you and goodbuy!');
          exit();
        };
        const stringToReturn = 'You asked: '+question+'. The user answered: '+input;
        resolve(stringToReturn);
      });
    });

    }catch{
    return error('Error asking question '+error);
  }
 
}



module.exports={
    functions,
    available_functions,
    listFiles,
    readFile,
    writeFile,
    deleteFile,
    appendFile,
    askForMoreInformation,
    readline,
};