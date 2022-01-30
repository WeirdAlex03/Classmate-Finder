import { createServer } from "http";
import { existsSync, readFileSync } from "fs";
import { convertFormEncodedToClass, sendToDatabase } from "./database/database";

createServer((req, res) => {

	if (!req.url) return res.end(readFileSync("pages/comingSoon.html"));

	const url = new URL(req.url, `http://${req.headers.host}`);

	/** Request pathname without leading `/` or trailing `.html` */
	const path = url.pathname.endsWith(".html")
		? url.pathname.slice(1, -5)
		: url.pathname.slice(1);

	let data: string = "";

	req.on("data", (chunk) => {
		data += chunk;
	});

	req.on("end", () => {

		if (req.headers["content-length"] && !(Number.parseInt(req.headers["content-length"]) === data.length)) {
			console.error("Request body length does not match content-length header");
			return res.end("Request body length does not match content-length header");
		}

		if (req.method === "GET") {
			if (path === "") {
				// If the request is for the root path, show coming soon
				res.writeHead(200, { "Content-Type": "text/html" });
				res.end(readFileSync("pages/comingSoon.html"));
			} else if (path.endsWith(".js")) {
				// If the request is for a JavaScript file, serve it
				if (existsSync(path)) {
					res.writeHead(200, { "Content-Type": "application/javascript" });
					res.end(readFileSync(path));
				} else {
					res.writeHead(404, { "Content-Type": "text/plain" });
					res.end("File not found");
					console.error("File not found: " + path);
				}
			} else if (path.endsWith(".css")) {
				// If the request is for a CSS file, serve it
				if (existsSync(path)) {
					res.writeHead(200, { "Content-Type": "text/css" });
					res.end(readFileSync(path));
				} else {
					res.writeHead(404, { "Content-Type": "text/plain" });
					res.end("File not found");
					console.error("File not found: " + path);
				}
			} else if (!existsSync(`pages/${path}.html`)) {
				// If the requested page doesn't exist, show coming soon w/ 404
				res.writeHead(404, { "Content-Type": "text/html" });
				res.end(readFileSync("pages/comingSoon.html"));
			} else {
				// Otherwise, show the requested page
				res.writeHead(200, { "Content-Type": "text/html" });
				res.end(readFileSync(`pages/${path}.html`));
			}
		} else if (req.method === "POST") {
			if (path.startsWith("database/")) {
				try {
					sendToDatabase(convertFormEncodedToClass(data));
					res.writeHead(200, { "Content-Type": "text/plain" });
					res.end("Success");
				} catch (err) {
					console.error(err);
					res.writeHead(500, { "Content-Type": "text/plain" });
					res.write("An error occurred while sending your data to the database");
					res.end("\n\n" + err);
				}
			}
		} else {
			// If unrecognized method, show coming soon w/ 400
			res.writeHead(400, { "Content-Type": "text/html" });
			res.end(readFileSync("pages/comingSoon.html"));
		}
	});
}).listen(8080);
