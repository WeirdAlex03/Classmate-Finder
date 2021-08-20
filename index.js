
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
const readline = require("readline");
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

// Header
console.log(" ≡≡≡ Welcome to Classmate Finder! ≡≡≡ ");
console.log(" ========== Version: InDev ========== ");
console.log(" ------ Created by WeirdAlex03 ------ ");
console.log("");

// Top menu
/** @type MenuItem[] */
const topMenu = [
	{ name: "Find classmates", func: findClassmates },
	{ name: "Add classmates", func: displayFormLink },
	{ name: "About", func: displayAbout },
];
console.log("What would you like to do?");
displayMenu(topMenu);
rl.question("Choice: ", (input) => {
	/** @type {Number} */
	const answer = parseInt(input, 10) - 1;
	if (isNaN(answer) || answer < 0 || answer >= topMenu.length) {
		console.log("Invalid choice!");
	}
	else {
		topMenu[answer].func();
	}
});

/**
 * Displays a string array as a menu
 * @param {MenuItem[]} menu - The menu to display
 */
function displayMenu(menu) {
	for (var i = 0; i < menu.length; i++) {
		console.log(` ${i + 1}. ${menu[i].name}`);
	}
}

/**
 * Prompts user to "sign in" with Discord tag and PIN,
 * then queries database for classes displays calssmates
 * @todo
 */
function findClassmates() {
	console.error("Not implemented yet!");
}

/**
 * Displays the link to the form to submit your class
 */
function displayFormLink() {
	console.log("To add your classes to the database, please go to");
	console.log("https://forms.gle/xHCtedWDv1tznBoT9");
}

/**
 * Displays the about page
 */
function displayAbout() {
	console.log("\n");
	console.log("About");
	console.log("=====");
	console.log("Classmate Finder");
	console.log("By WeirdAlex03");
	console.log("");
	console.log("This program is a tool to help you find and reach out to");
	console.log("your classmates before classes start. Fill out your classes,");
	console.log("invite all your friends to do the same, and then use this");
	console.log("program to find everyone who shares a class with you!");
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
}
