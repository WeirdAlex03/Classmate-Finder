import { createServer } from "http";
import { existsSync, readFileSync } from "fs";

createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/html" });

	// Make sure path doesn't include ".html" extension, redirect if it does
	const PATH = !req.url ? "/" : req.url.endsWith(".html") ? req.url.slice(0, -5) : req.url;

	if (PATH === "/") {
		// If the request is for the root path, show coming soon
		res.end(readFileSync("pages/comingSoon.html"));
	} else if (!existsSync(`pages${PATH}.html`)) {
		// If the requested page doesn't exist, show coming soon w/ 404
		res.statusCode = 404;
		res.end(readFileSync("pages/comingSoon.html"));
	} else {
		// Otherwise, show the requested page
		res.end(readFileSync(`pages${PATH}.html`));
	}
}).listen(8080);
