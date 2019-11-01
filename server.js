var http = require("http");
var Scratch = require('scratch-api');
var fs = require("fs")

var tmp = JSON.parse(fs.readFileSync("config.json"));

var PROJ_ID = tmp["project_id"];

// var val  = cloud.get("☁ " + name);
// cloud.set("☁ " + name.substr(0, name.length - 1), value);

var currentCloud = null;
var httpServer   = null;

function onCloudConnection(cloud) {
    httpServer   = http.createServer(onHttpRequest).listen(8000);
    currentCloud = cloud;

    cloud.on("error", function(err) {
        httpServer.close();
        throw err;
    });
    
    cloud.on("end", function(err) {
        console.log("Connection lost :(");
        setup();
    });
}

function urlsplit(url) {
	// Extract path
	let tmp = "";
    for (let i = 0; i < url.length; i++) {
       if (url[i][0] === "?") {
           // Start of query
           break;
       }
       tmp += url[i];
    }
    let path = tmp;
	
	// Extract query
	let query = null;
    let query_raw = url.split("?")[1];
    if (query_raw !== undefined) {
		let query_almost_done = query_raw.split("&");
        query = {};
        for (let i = 0; i < query_almost_done.length; i++) {
			let tmp = query_almost_done[i].split("=");
			query[tmp[0]] = tmp[1];
		}
    }
	
	return {"query": query, "path": path};
}

function onHttpRequest(req, res) {
    // res - The object that you should write to and read from
    // req - The request
    var { method, url } = req;
    
	var cloud = currentCloud;
	
	let url_obj = urlsplit(url);
	let query   = url_obj["query"];
	let path    = url_obj["path"];
	
	console.log("path: ", path, "query: ", query);
	
	// == Function starts here ==
	if (path == "/") {
		let result = "";
		try {
			if (query === null) {
				result = "{\"status\": \"error\", \"code\": 0, \"text\": \"No query specified.\"}";
			} else {
				if (!query["type"]) {
					result = "{\"status\": \"error\", \"code\": 1, \"text\": \"Missing `type` field.\"}";
				} else if (!query["name"]) {
					result = "{\"status\": \"error\", \"code\": 2, \"text\": \"Missing `name` field.\"}";
				} else {
					if (query["type"] === "get") {
						let tmp = cloud.get("☁ " + query["name"]);
						if (tmp !== undefined) {
							result = "{\"status\": \"ok\", \"result\": " + tmp.toString() + "}";
						} else {
							result = "{\"status\": \"error\", \"code\": 4, \"text\": \"No such variable exists.\"}";
						}
					} else if (query["type"] === "set") {
						if (!query["value"]) {
							result = "{\"status\": \"error\", \"code\": 3, \"text\": \"Missing `value` field.\"}";
						} else {
							cloud.set("☁ " + query["name"], query["value"]);
							result = "{\"status\": \"ok\"}";
						}
					}
				}
			}
		} catch (e) {
			res.writeHeader(500);
			res.end();
			throw e;
		}
		res.writeHeader(200);
		res.write(result);
		res.end();
	} else {
		res.writeHeader(404);
		res.end();
	}
}

function setup() {
    console.log("Logging in to scratch...");
    Scratch.UserSession.load(function(err, user) {
        console.error("Done loading.");
        user.cloudSession(PROJ_ID, function(err, cloud) {
            if (err) throw err;
            onCloudConnection(cloud)
        });
    });
}

setup();