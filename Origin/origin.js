//node origin.js {PATH} {IP} {PORT}

const express = require('express');
const server = express();
const fs = require('fs');
const requestmodule = require("request");
const myArgs = process.argv;
const PATH = myArgs[2];
const PORT = myArgs[3];


console.log(PATH)

var REPLICAS=["http://localhost:8001", "http://localhost:8002"];



server.use('/', express.static(PATH + '/'));

/*	http://localhost:8000/fetchall
	returns the list of titles in the direcotry	 */
server.get('/fetchall', (req, res)=> {
	fs.readdir(PATH, function(err, items) {
		res.json({"items":items});
	});
});



/*	http://localhost:8000/pushdata?title=mario.mp4
	pushes the title to all the replicas if title is present in the origin directory*/
server.get('/pushdata',(request, result)=>{
	if(request.query.title==undefined)
	{
		result.status(400);
		result.json({"message":"pass the title parameter"});
		return;
	}
	
	// check if title is present in the local directory (only push to replica if present in origin directory!!)
	var items=fs.readdir(PATH, function(err, items) {
		for(var i=0;i<items.length;i++)
		{
			// Item present in origin directory
			if(items[i]==request.query.title)
			{
				REPLICAS.forEach(replica_ip=>{
					requestmodule(replica_ip+'/pulldata?'+'title='+request.query.title,(req,res)=> {
						console.log('pushed '+request.query.title+' to replica '+replica_ip);
					});
				});
				result.status(200);
				result.json({"message":"data pushed to all replicas"});
				return;
			}
		}
		result.status(400);
		result.json({"message":"data not present on origin"});
		return;
	});
});


/*	http://localhost:8000/pushdata?title=mario.mp4
	pushes any new files in origin directory to all replica servers*/

server.get('/refresh',(request, result)=>{
	
	// push data to all replicas
	var items=fs.readdir(PATH, function(err, items) {
		items.forEach(item=>
		{
			console.log(item);
			REPLICAS.forEach(replica_ip=>{
				// check if item present in replica
				requestmodule(replica_ip+'/checkdata?'+'title='+item,(req,res)=> {
					if(res.statusCode!=200)
					{
						// if item not present then push it
						requestmodule(replica_ip+'/pulldata?'+'title='+item,(req2,res2)=> {
							console.log('pushed '+item+' to replica '+replica_ip);
						});
					}
				});
				
			});
		});
		result.status(200);
		result.json({"message":"Replicas refreshed"});
		return;
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
	fs.readdir(PATH, function(err, items) {
		console.log(items)
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

server.listen(PORT, () => {
    console.log("Origin Server is listening on port "+ PORT);
});