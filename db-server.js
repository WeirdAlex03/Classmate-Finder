// Ignore ununsed varible warnings until I start working on this
// jshint -W098

const Database = require("@replit/database"); // lgtm [js/unused-local-variable]
const http = require("http");
const url = require("url");

/**
 * Creates a webserver with a requestListener function. 
 * 
 * The server is used to open this project's Replit database to other
 * programs. This program passes the parameters to helper functions to
 * deal with each request type.
 * 
 * @param {IncomingMessage} req - The request recieved by the server
 * @param {ServerResponse}  res - The response sent back by the server
 */
http.createServer(function (req, res) {
	//todo
	var q = url.parse(req.url, true).query;
	console.log(q);

	res.write("active");
	res.end();
}).listen(8080);

console.log("Webserver active");
