
/* 
 * Classmates for [your name here]
 *   CSE 199 - B1
 *     Same section & lab/recitation
 *       John Smith (JSmith#1234), Jane Smith (JaneS#6789), Joe (JoeWho#6969)
 *     Same class section, different lab/recitation
 *       Name (user#tag)
 *     Same class, different sections (and possibly different teacher)
 *       Name (user#tag), Name (user#tag)
 * 
 *   RUS 101 - B
 *       Same section
 *       Name (user#tag), Name (user#tag)
 *     Same class (possibly different teacher)
 *       Name (user#tag), Name (user#tag), Name (user#tag)
 */

/**
 * @typedef  {Object}   MenuItem
 * @property {String}   name - The name of the menu item
 * @property {function} func - The function to call on selection
 */

// Imports
const http = require("http");
const readline = require("readline");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Constants
const FORM_URL = "https://forms.gle/xHCtedWDv1tznBoT9";
const DB_URL = "https://Classmate-Finder-Database.weirdalex03.repl.co";

// On start
displayHeader();
displayTopMenu();

/** Displays the header */
function displayHeader() {
	console.log(" ≡≡≡ Welcome to Classmate Finder! ≡≡≡ ");
	console.log(" ========== Version: InDev ========== ");
	console.log(" ------ Created by WeirdAlex03 ------ ");
}

/** Displays the top-level menu */
function displayTopMenu() {
	/** @type MenuItem[] */
	const topMenu = [
		{ name: "Find classmates", func: findClassmates },
		{ name: "Add classes", func: displayFormLink },
		{ name: "About", func: displayAbout },
		{ name: "Exit", func: exit }
	];
	console.log("");
	console.log("What would you like to do?");
	makeMenu(topMenu);
}

/**
 * Makes a menu and prompts user to select an item. If the item is valid, the
 * function associated with that item is called. Otherwise, it asks again.
 * @param {MenuItem[]} menu - The menu to display
 */
function makeMenu(menu) {
	for (var i = 0; i < menu.length; i++) {
		console.log(` ${i + 1}. ${menu[i].name}`);
	}
	rl.question("Choice: ", (input) => {
		console.log("");

		/** @type {Number} */
		const answer = parseInt(input, 10) - 1;
		if (isNaN(answer) || answer < 0 || answer >= menu.length) {
			console.log("Invalid choice!");
			makeMenu(menu);
		} else {
			menu[answer].func();
		}
	});
}

/**
 * Prompts user to "sign in" with Discord tag and PIN,
 * then queries database for classes displays calssmates
 */
function findClassmates() {
	/** @type {String} */
	var tag;

	// Prompt for Discord tag, check if in DB
	rl.question("What is your Discord tag: ", (input) => {
		http.get({
			host: DB_URL,
			path: "/check" + encodeURIComponent("Discord Tag") + "="
			    + encodeURIComponent(input),
			port: 8080
		}, (res) => {
			if (res.statusCode === 404) {
				console.log(`Could not find ${input} in the database.`);
				console.log("Please use the same tag you used on the form.");
				displayFormLink();
			} else if (res.statusCode === 202) {
				tag = input;
			} else {
				console.log("Unexpected error in DB call: " + res.statusCode
				           + " " + http.STATUS_CODES[res.statusCode]);
				displayTopMenu();
			}
		});
	});

	// Discord tag was found, prompt for PIN
	rl.question("What is your PIN: ", (input) => {
		http.get({
			host: DB_URL,
			path: "/get" + encodeURIComponent("Discord Tag") + "="
			    + encodeURIComponent(tag) + "&"
				+ encodeURIComponent("PIN - at least 4 digits") + "="
				+ encodeURIComponent(input),
			port: 8080
		}, (res) => {
			if (res.statusCode === 202) {
				displayClassmates(JSON.parse(res.body));
			} else if (res.statusCode === 404) {
				console.log(`Could not find ${input} in the database.`);
				console.log("Please use the same tag you used on the form.");
				displayFormLink();
			} else {
				console.log("Unexpected error in DB call: " + res.statusCode
				           + " " + http.STATUS_CODES[res.statusCode]);
			}
		});
	});
}

/**
 * Displays all the classmates a user has
 * @param {Object} classes - The classes from the database
 * @todo
 */
function displayClassmates(classes) {
	console.log(classes);
}

/** Displays the link to the form to submit classes */
function displayFormLink() {
	console.log("To add your classes to the database, please go to");
	console.log(FORM_URL);

	displayTopMenu();
}

/** Displays the about page */
function displayAbout() {
	console.log("Classmate Finder");
	console.log("By WeirdAlex03");
	console.log("");
	console.log("A tool to help you find and reach out to your classmates");
	console.log("before classes start. Fill out your classes, invite all your");
	console.log("friends to do the same, and then use this program to find");
	console.log("everyone who shares a class with you!");
	console.log("");
	console.log("Big changes are planned for the next semester, so keep an");
	console.log("the project! You can see the plans on the TODO project board");
	console.log("on GitHub, linked below.");
	console.log("");
	console.log("Contact the creator:");
	console.log("Discord: WeirdAlex03#5049");
	console.log("");
	console.log("View source and report problems:");
	console.log("https://github.com/WeirdAlex03/Classmate-Finder");

	displayTopMenu();
}

/** Exits the program */
function exit() {
	console.log("Goodbye!\n");
	process.exit(0);
}
