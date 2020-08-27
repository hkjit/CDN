const express = require('express');
const bodyParser = require('body-parser');
const request = require("request");
const app = express();
const requestasync = require('sync-request');

var REPLICAS=["http://localhost:8001", "http://localhost:8002"];
var ORIGIN=["http://localhost:8000"];
var REPLICA_LEN=REPLICAS.length;
var REPLICAS_TO_RETRY=2;
var COUNTER=0;
console.log(REPLICA_LEN);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// To check if resource is available at the given replica
function checkResource(title, n)
{
	console.log(title+" requested at "+REPLICAS[n]+'/checkdata?title='+title);
	try{
		var response=requestasync('GET',REPLICAS[n]+'/checkdata?title='+title)
	}
	catch{
		return 0;
	}
	if (response.statusCode!=200)
		return 0
	return 1;
}

// fetch a given resource url from the replica
app.get('/fetch', (req, res) => {
	var next=COUNTER
	var i=0
	// Round robin the replica servers for the next request
	COUNTER=(COUNTER+1)%REPLICA_LEN;
	
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
	

	// try to fetch the resource from the next "REPLICAS_TO_RETRY" number of replicas
	while(i<REPLICAS_TO_RETRY){
		var result_json={};
		var check=checkResource(req.query.title,next)
		// Resource found
		if(check == 1 )
		{
			// attach the url of the resource in the result json
			result_json["url"]= REPLICAS[next]+'/'+req.query.title;
			console.log(result_json);
			res.json(result_json);

			return;
		}
		
		next=(next+1)%REPLICA_LEN;
		i=i+1
	}
	result_json["status"]="400";
	res.json(result_json);
    
});

// Get the playlist from the origin server's folder directory
app.get('/fetchPlaylist', (rqst, result) => {
	result.setHeader('Access-Control-Allow-Origin', '*');
	result.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	result.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization');
	console.log(ORIGIN[0]+'/fetchall')
	request(ORIGIN[0]+'/fetchall',(req,res)=> {
		if(res!=null && res.statusCode==200)
			result.json(JSON.parse(res.body))
		else{
			result.status(400)
			result.json({})
		}
	});
    
});


app.listen(3000, () => {
    console.log("Controller is listening on port 3000");
});

