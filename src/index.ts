import { createServer } from "http";
import { existsSync, readFileSync } from "fs";

createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/html" });

	if (!req.url) return res.end(readFileSync("pages/comingSoon.html"));

	const url = new URL(req.url, `http://${req.headers.host}`);

	/** Request pathname without leading `/` or trailing `.html` */
	const path = url.pathname.endsWith(".html")
		? url.pathname.slice(1, -5)
		: url.pathname.slice(1);

	let data: string = "";

	req.on("data", (chunk) => {
		console.log("" + chunk);
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
				res.end(readFileSync("pages/comingSoon.html"));
			} else if (!existsSync(`pages/${path}.html`)) {
				// If the requested page doesn't exist, show coming soon w/ 404
				res.statusCode = 404;
				res.end(readFileSync("pages/comingSoon.html"));
			} else {
				// Otherwise, show the requested page
				res.end(readFileSync(`pages/${path}.html`));
			}
		} else if (req.method === "POST") {
			if (path.startsWith("database/")) {
				// TEMP: Just console log the data for now
				console.log(data);
				res.end();
			}
		} else {
			// If unrecognized method, show coming soon w/ 400
			res.statusCode = 400;
			res.end(readFileSync("pages/comingSoon.html"));
		}
	});
}).listen(8080);
