const md = require('markdown-it')();
const fs = require('fs').promises;
const path = require('path');

const readMarkdownFromDirectory = (dir) => {
    return async(req, res, next) => {
        req.markdown = new Array();
        fs.readdir(dir).then(files =>{
            getAllFiles(dir, files).then(data =>{
                data.forEach(dat =>{
                    var mdobj = {};
                    mdobj.body = md.render(dat);
                    var firstH1 = mdobj.body.match(/<h1>[^<>]*<\/h1>/);
                    mdobj.title = firstH1[0].replace(/<[^>]*>/g, "");
                    req.markdown.push(mdobj);
                });
                next();
            });
        })
    }
}

async function getAllFiles(dir, files){
    var promises = [];

    files.forEach((file)=>{
        fullPath = path.join(dir, file);
        promises.push(getFile(fullPath));
    });

    Promise.all(promises)
        .then(data => {
            console.log(data);
            return data;            
        })
        .catch(err =>{
            console.log(err);
        });
}

//returns a promise for the reading file
function getFile(p){
    return fs.readFile(p, 'utf8');
}

module.exports = {readMarkdownFromDirectory};