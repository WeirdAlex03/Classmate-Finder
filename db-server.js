// Ignore ununsed varible warnings until I start working on this
// jshint -W098

/**
 * Represents a class of a {@link User}
 * @typedef {Object} UserClass
 * @property {string} code - The department and number of the class, ie "MTH 141"
 * @property {string} section - The section of the class, ie "A"
 * @property {?string} subsection - The subsection of the class for the lab or
 *                                  recitation, ie "1". Is null if not specified
 */

const Database = require("@replit/database");
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
	/** @type {Object} */
	var q = url.parse(req.url, true).query;
	console.log(q);

	res.write("active");
	res.end();

	/**
	 * @todo Only proceed if it is a Form response submission
	 */

	/**
	 * Array of the user's classes to be added to the database
	 * @type {Object[]}
	 */
	var classes = [];
	for (var i = 1; i <= 10; i++) {
		if (q['Class ' + i]) {
			/** 
			 * Full class code as provided by the user, with
			 * department, number, section, and subsection.
			 * @type {string}
			 * @example "MTH 141LEC - A1"
			 * @example "TH 106 - JS"
			 */
			var classCode = q['Class ' + i];
			/**
			 * Array of RegEx matches on {@link classCode}.
			 * @type {Array}
			 * @example <caption>Class code without class type ("LEC","LLB",etc)</caption>
			 * classCode = "MTH 141 - A1"
			 * classCodeSections = classCode.match("([A-Z]{2,3} [0-9]{3})[A-Z]* - ([A-Z]+)([0-9]*))");
			 * console.log(classCodeSections);
			 * //Prints ['MTH 141 - A1','MTH 141','A','1',index: 0,input: 'MTH 141 - A1',groups: undefined]
			 * @example <caption>Class code without a lab/recitation subsection</caption>
			 * classCode = "TH 106LEC - JS"
			 * classCodeSections = classCode.match("([A-Z]{2,3} [0-9]{3})[A-Z]* - ([A-Z]+)([0-9]*))");
			 * console.log(classCodeSections);
			 * // Prints ['TH 106LEC - JS','TH 106','JS','',index: 0,input: 'TH 106LEC - JS',groups: undefined]
			 */
			var classCodeSections = classCode.match(/([A-Z]{2,3} [0-9]{3})[A-Z]* - ([A-Z]+)([0-9]*)/);
			/** @type {UserClass} */
			var classObj = {
				"code": classCodeSections[1],
				"section" : classCodeSections[2],
				"subsection" : classCodeSections[3],
			};
			classes.push(classObj);
		}
	}

	var user = new User(q['Your name'], q['Discord Tag'], q['PIN - at least 4 digits'], classes);
	console.log(user);

}).listen(8080);

console.log("Webserver active");

/**
 * Creates a new User object
 * @class
 * @classdesc Represents a user of the program. This is where the
 * lookup will go to verify the sign in and find what classes to show.
 * @param {string}      name - The user's name
 * @param {string}      tag - The users's Discord tag
 * @param {string}      pin - The user's PIN
 * @param {UserClass[]} classes - The user's classes
 */
class User {
	constructor(name, tag, pin, classes) {
		this.name = name;
		this.tag = tag;
		this.pin = pin;
		this.classes = classes;
	}
}
