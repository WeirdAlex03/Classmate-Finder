
// Ignore ununsed varible warnings until I start working on this
// jshint -W098

const Database = require("@replit/database");
const https = require("https");
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
https.createServer(function (req, res) {
	//todo
}).listen(8080);

console.log("Webserver active");