"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToDatabase = exports.convertFormEncodedToClass = void 0;
/**
 * Note: The NPM release is messed up and does not work with TS.
 * Locally, I have implemented the fix in upstream PR #10. It is not committed
 * so you will have to duplicate it in your own fork.
 * https://github.com/mrlapizgithub/repl.it-db/pull/10
 */
const database_1 = __importDefault(require("@replit/database"));
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
function convertFormEncodedToClass(formEncodedData) {
    var _a, _b, _c;
    const data = new URLSearchParams(formEncodedData);
    const user = {
        name: (_a = data.get("name")) !== null && _a !== void 0 ? _a : "",
        discord: (_b = data.get("discord")) !== null && _b !== void 0 ? _b : "",
        password: (_c = data.get("password")) !== null && _c !== void 0 ? _c : "",
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
        }
        else {
            console.error(`Unexpected key: ${key} (value: ${value})`);
        }
    }
    return user;
}
exports.convertFormEncodedToClass = convertFormEncodedToClass;
/**
 * Sends a User object to the database
 *
 * @param data {User} The data to send to the database
 */
function sendToDatabase(data) {
    const db = new database_1.default();
    db.set(data.discord, data);
}
exports.sendToDatabase = sendToDatabase;
//# sourceMappingURL=database.js.map