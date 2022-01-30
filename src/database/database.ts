
/**
 * Note: The NPM release is messed up and does not work with TS.
 * Locally, I have implemented the fix in upstream PR #10. It is not committed
 * so you will have to duplicate it in your own fork.
 * https://github.com/mrlapizgithub/repl.it-db/pull/10
 */
import Client from "@replit/database";

interface Class {
	dept: string;
	number: string;
	section: string;
	lab: string;
}

interface User {
	name: string;
	discord: string;
	password: string;

	classes: Class[];
}

/**
 * Converts form encoded data (as received from the form) into a User object
 * that can be sent to the database
 * 
 * @param formEncodedData {string} Form encoded data from the form
 * 
 * @returns {User} The data mapped to a User for sending to the database
 * 
 * @example
 * const data = "name=John+Smith&discord=JSmith%231234&password=JohnnySmith1&" +
 *              "c1d=MTH&c1c=101&c1s=A&c1l=&c2d=MTH&c2c=101&c2s=A&c2l=1";
 * convertFormEncodedToClass(data);
 * // returns {
 * //   name: "John Smith",
 * //   discord: "JSmith#1234",
 * //   password: "JohnnySmith1",
 * //   classes: [
 * //     { dept: "MTH", number: "101", section: "A", lab: "" },
 * //     { dept: "MTH", number: "101", section: "A", lab: "1" }
 * //   ]
 * // }
 */
export function convertFormEncodedToClass(formEncodedData: string): User {
	const data = new URLSearchParams(formEncodedData);

	const user: User = {
		name: data.get("name") ?? "",
		discord: data.get("discord") ?? "",
		password: data.get("password") ?? "",
		classes: []
	};

	// Load the rest of the data into the classes array
	for (const [key, value] of data) {

		// Skip user data and empty values
		if (key === "name" || key === "discord" || key === "password" || value === "") {
			continue;
		}

		// Identify the class number and portion
		if (key.startsWith("c")) {
			const classNum = parseInt(key.charAt(1));

			switch (key.charAt(2)) {
				case "d":
					user.classes[classNum - 1].dept = value;
					break;
				case "c":
					user.classes[classNum - 1].number = value;
					break;
				case "s":
					user.classes[classNum - 1].section = value;
					break;
				case "l":
					user.classes[classNum - 1].lab = value;
					break;
				default:
					console.error(`Unexpected key: ${key} (value: ${value})`);
					break;
			}
		} else {
			console.error(`Unexpected key: ${key} (value: ${value})`);
		}
	}

	return user;
}

/**
 * Sends a User object to the database
 * 
 * @param data {User} The data to send to the database
 */
export function sendToDatabase(data: User) {
	const db = new Client();

	db.set(data.discord, data);
}
