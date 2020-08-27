const express = require('express');
const server = express();
const fs = require('fs');
const http = require('http');
const myArgs = process.argv;
const PATH = myArgs[2]


const ORIGIN_URL="http://localhost:8000"

console.log(myArgs[2])
console.log(myArgs[3])
console.log('origin: ' +ORIGIN_URL);

server.use('/', express.static(PATH + '/'));

/*	http://localhost:8000/fetchall
	returns the list of titles in the direcotry	 */
server.get('/fetchall', (req, res)=> {
	fs.readdir(PATH, function(err, items) {
		res.json({"items":items});
	});
});

/*	http://localhost:8000/pulldata?title=mario.mp4
	downloads the title file from origin server and saves in the directory	 */
server.get('/pulldata',(req, res)=>{
	if(req.query.title==undefined)
	{
		res.status(400);
		res.json({"message":"pass the title parameter"});
		return;
	}
	console.log(req.query.title+" requested from origin server "+ORIGIN_URL);
	fs.readdir(PATH, function(err, items) {
		for(var i=0;i<items.length;i++)
		{
			if(items[i]==req.query.title)
			{
				res.status(200);
				res.json({"message":"File already present"});
				return;
			}
		}
		const file = fs.createWriteStream(PATH+"/"+req.query.title);
		const request = http.get(ORIGIN_URL+"/"+req.query.title, function(response) {
			response.pipe(file);
			res.status(200);
			res.json({"message":"File saved"});
			console.log(req.query.title+" : File saved !");
			return;
		});
	});
	
});

/*	http://localhost:8000/checkdata?title=mario.mp4
	returns 200 if title is present in the directory	 */
server.get('/checkdata', (req, res)=> {
	if(req.query.title==null)
	{
		res.status(400);
		res.json({"message":"title missing in request!"});
		return;
	}
	console.log("checkdata called for title: "+req.query.title);
	fs.readdir(PATH, function(err, items) {
		for(var i=0;i<items.length;i++)
		{
			if(items[i]==req.query.title)
			{
				res.status(200);
				res.json({"items":req.query.title});
				return;
			}
		}
		res.status(400);
		res.json({});
		return;
		
	});
});

server.listen(myArgs[3], () => {
    console.log("Replica Server is listening on port "+ myArgs[3]);
});