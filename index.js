const md = require('markdown-it')();
const fs = require('fs').promises;
const path = require('path');

/**
 * The Express middleware function to get the all .md files content of a dir as a JSON object with title and body
 * @param {string} dir the directory paht to laod the .md files from
 * @returns {array} it places an array of JSON object to req.markdown
 */
const readMarkdownFromDirectory = (dir) => {
    return async(req, res, next) => {
        getRenderedMarkdownFromDirectory(dir) //gets the markdown data of path dir
            .then(data => {
                req.markdown = data;
                console.log(data);
                next();  //calls next middleware
            })
    }
}

//getRenderedMarkdownFromDirectory('./test2'); //just for testing

/**
 * 
 * @param {string} dir the directory path to load the .md files from
 */
async function getRenderedMarkdownFromDirectory(dir){
    return new Promise((resolve, reject) => {
    fs.readdir(dir) //returns list of file od directories in dir
        .then(files =>{
            console.log(files);
            return getAllFiles(dir, files); //returns the array with the data of all the files in dir
        })
        .then(data =>{
            // array to save the JSON objects wiht the .md data
            
                var markdownJsonObjects = new Array(); 
                data.forEach(dat =>{ //itterates over all files data
                    markdownJsonObjects.push(renderMarkdownToJsonObject(dat)); //creates an object that includes the rendered .md text and the title
                });

                if(typeof markdownJsonObjects !== 'undefined'){
                    resolve(markdownJsonObjects);
                }else{
                    reject('no data created');
                }
        })
            //console.log(markdownJsonObjects);
        }).catch(err =>{
            console.log(err);
            return "INVALID DIRECTORY";
        })
    };

/**
 * Renders the text in the markdown syntax to a html format inside a js object
 * @param {string} dat utf8 string with markdown formated text
 * @returns {obj} returns an object with obj.body = the html rendered content and obj.title = Text of the first h1 Heading inside the file
 */
function renderMarkdownToJsonObject(dat){
    var mdobj = {};
    mdobj.body = md.render(dat);
    var firstH1 = mdobj.body.match(/<h1>[^<>]*<\/h1>/);
    mdobj.title = firstH1[0].replace(/<[^>]*>/g, "");
    return mdobj;
}

/**
 * Reads all *.md files from a path (dir)
 * @param {string} dir path of the folder 
 * @param {array} files string array with the file names (*.md) 
 * @returns promises for all files that are loading
 */
async function getAllFiles(dir, files){
    var promises = []; //empty array to push the promises to

    files.forEach((file)=>{
        //console.log(path.extname(file));
        if(path.extname(file) == '.md'){ //just .md will be loaded - !subfolders are NOT included!
            fullPath = path.join(dir, file); //joins the path
            promises.push(getFile(fullPath)); //invokes the file load and pushes the returning promise to the array to resolve them all together later
        }
    });

    var result; 
    result = Promise.all(promises); //resolves all promises at once
       
    return result; //returns the resolving promise
}

/**
 * Returns a promise for the reading file
 * @param {string} path the path of the file to load
 * @returns promise of the file reading process
 */
async function getFile(path){
    var result;
    result = fs.readFile(path, 'utf8');
    return result;
}


test('./test');

function test(dir){
    getRenderedMarkdownFromDirectory(dir) //gets the markdown data of path dir
            .then(data => {
                var req = {};
                req.markdown = data;
                console.log(data);
                console.log(req.markdown);
                //next();  //calls next middleware
            })
            .catch(error =>{
                console.log(error);
            });
}

module.exports = {readMarkdownFromDirectory};