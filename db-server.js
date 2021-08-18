/**
 * Represents a class of a {@link User}
 * @typedef {Object} UserClass
 * @property {string} code - The department & number of the class, ie "MTH 141"
 * @property {string} section - The section of the class, ie "A"
 * @property {string} subsection - The subsection of the class for the lab or
 *                                 recitation, ie "1". Is "" if not specified
 */

// Imports
const http = require("http");
const url = require("url");

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
http.createServer((req, res) => {
	/** @type {Object} */
	var qData = url.parse(req.url, true).query;
	console.log(qData);

	res.write("active");

	if (req.method === "POST" && req.url.pathname === "/form") {
		/**
		 * If POST request to "/form", add data to DB
		 * These requests come from the Form program
		 */
		try {
			addClassToDB(qData);
			res.writeHead(201);
		}
		catch (e) {
			res.writeHead(400, e.name + ": " + e.message);
			console.log(e);
		}
	}
	else if (req.method === "GET" && req.url.pathname === "/") {
		/**
		 * If GET request to "/", tell user to go to main project. These
		 * requests come opening the project on Replit, and the database
		 * project will not allow the user to view classes.
		 */
		res.writeHead(200, { "Content-Type": "text/plain" });
		res.write("This project only serves as the databse server.");
		res.write("Please visit the main project at https://replit.com/@WeirdAlex03/Classmate-Finder");
	}

	res.end();
}).listen(8080);

console.log("Webserver active");

/**
 * Adds the class to the database
 * @param {Object} qData - The query data from the URL request
 * @throws {Error} If any problem is encountered
 */
async function addClassToDB(qData) {

	const Database = require("@replit/database");
	const db = new Database();
	const { validateFormData } = require("./ValidateFormData.js");

	/** Validate the data from the form */
	validateFormData(qData);

	/** @type {number} */
	const numClassEntries = parseInt(qData["Class Entries"], 10);

	/**
	 * Array of the user's classes to be added to the database
	 * @type {UserClass[]}
	 */
	var classes = [];
	for (var i = 1; i <= numClassEntries; i++) {
		if (qData[`Class ${i}`]) {
			/** 
			 * Full class code as provided by the user, with
			 * department, number, section, and subsection.
			 * @type {string}
			 * @example "MTH 141LEC - A1"
			 * @example "TH 106 - JS"
			 */
			var classCode = qData[`Class ${i}`];

			/**
			 * Array of RegEx matches on {@link classCode}.
			 * @type {Array}
			 */
			var classCodeSections = classCode.match(/(?<code>[A-Z]{2,3} [0-9]{3})[A-Z]* - (?<section>[A-Z]+)(?<subsection>[0-9]*)/u);

			/** @type {UserClass} */
			var classObj = {
				code: classCodeSections.groups.code,
				section: classCodeSections.groups.section,
				subsection: classCodeSections.groups.subsection,
			};
			classes.push(classObj);
		}
	}

	/** @type {User} */
	var user = new User(
		qData["Your name"],
		qData["Discord Tag"],
		qData["PIN - at least 4 digits"],
		classes
	);

	console.log(user);
	await db.set(user.tag, user);
}
