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

	if (req.method === "POST" && req.url.startsWith("/form")) {
		/**
		 * If POST request to "/form", add data to DB
		 * These requests come from the Form program
		 */
		try {
			addClassToDB(qData);
			res.writeHead(201);
		} catch (e) {
			res.writeHead(400);
			res.write(e.name + ": " + e.message);
			console.error(e);
		}
	} else if (req.method === "GET" && req.url.startsWith("/check")) {
		/**
		 * If GET request to "/check", check if user exists in DB
		 * These requests come from the frontend
		 */
		try {
			if (checkForUser(qData)) {
				res.writeHead(202);
			} else {
				res.writeHead(404);
			}
		} catch (e) {
			res.writeHead(400);
			res.write(e.name + ": " + e.message);
			console.error(e);
		}
	} else if (req.method === "GET" && req.url.startsWith("/get")) {
		/**
		 * If GET request to "/get", get user from DB
		 * These requests come from the frontend
		 */
		try {
			checkPIN(qData).then((correct) => {
				if (correct) {
					getUserClasses(qData).then((user) => {
						res.writeHead(200, {
							"Content-Type": "application/json"
						});
						res.write(JSON.stringify(user));
					});
				} else {
					res.writeHead(403);
					res.write("Incorrect PIN");
				}
			});
		} catch (e) {
			res.writeHead(400);
			res.write(e.name + ": " + e.message);
			console.error(e);
		}
	} else if (req.method === "GET" && req.url.startsWith("/")) {
		/**
		 * If GET request to "/", tell user to go to main project. These
		 * requests come opening the project on Replit, and the database
		 * project will not allow the user to view classes.
		 */
		res.writeHead(200, { "Content-Type": "text/plain" });
		res.write("This project only serves as the databse server.\n\n");
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
function addClassToDB(qData) {
	const Database = require("@replit/database");
	const db = new Database();
	const validateFormData = require("./validateFormData.js");

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
			const userClass = {
				code: classCodeSections.groups.code,
				section: classCodeSections.groups.section,
				subsection: classCodeSections.groups.subsection,
			};
			classes.push(userClass);
		}
	}

	/** @type {User} */
	var user = new User(
		qData["Your name"],
		qData["Discord Tag"],
		qData["PIN - at least 4 digits"],
		classes
	);

	/**
	 * A student for the classes in the database
	 * @typedef {Object} Student
	 * @property {string} name - The name of the student
	 * @property {string} tag - The Discord tag of the student
	 */

	/** @type {Student} */
	const student = { name: user.name, tag: user.tag };

	// Add user to the database as a student of each class
	for (const userClass of user.classes) {
		db.get(userClass.code).then((result) => {
			if (result && result[userClass.section][userClass.subsection]
				&& !result[userClass.section][userClass.subsection]
				   .includes(student)) {
				result[userClass.section][userClass.subsection].push(student);
			} else {
				// eslint-disable-next-line no-param-reassign
				result = {};
				result[userClass.section] = {};
				result[userClass.section][userClass.subsection] = [student];
			}
			db.set(userClass.code, result);
		});
	}

	db.set(user.tag, user);
}

/**
 * Checks if the given user exists in the database
 * @param {Object} qData - The query data from the URL request w/ the tag
 * @returns {Boolean} Whether or not the user exists (true if yes)
 */
function checkForUser(qData) {
	const Database = require("@replit/database");
	const db = new Database();

	/** @type {Boolean} */
	var found = false;

	db.get(encodeURIComponent(qData["Discord Tag"])).then((user) => {
		if (user) {
			found = true;
		}
	});
	return found;
}

/**
 * Checks if the correct PIN was provided
 * @param {Object} qData - The query data from the URL request w/ tag and PIN
 * @returns {Boolean} Whether or not the PIN is correct 
 */
function checkPIN(qData) {
	const Database = require("@replit/database");
	const db = new Database();

	db.get(encodeURIComponent(qData["Discord Tag"])).then((user) => {
		if (user.pin === qData["PIN - at least 4 digits"]) {
			return true;
		} else {
			return false;
		}
	});
}

/** 
 * Gets the user's classes from the database
 * @param {Object} qData - The query data from the URL request w/ tag
 */
function getUserClasses(qData) {
	const Database = require("@replit/database");
	const db = new Database();

	/** @type {Object} */
	var allClasses = {};

	db.get(encodeURIComponent(qData["Discord Tag"])).then((user) => {
		for (const userClass in user.classes) {
			db.get(userClass.code).then((result) => {
				allClasses[userClass.code] = result;
			});
		}
		return allClasses;
	});
}
