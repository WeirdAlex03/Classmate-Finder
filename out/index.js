"use strict";
exports.__esModule = true;
var http_1 = require("http");
var fs_1 = require("fs");
(0, http_1.createServer)(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    // Make sure path doesn't include ".html" extension, redirect if it does
    var PATH = !req.url ? "/" : req.url.endsWith(".html") ? req.url.slice(0, -5) : req.url;
    if (PATH === "/") {
        // If the request is for the root path, show coming soon
        res.end((0, fs_1.readFileSync)("pages/comingSoon.html"));
    }
    else if (!(0, fs_1.existsSync)("pages".concat(PATH, ".html"))) {
        // If the requested page doesn't exist, show coming soon w/ 404
        res.statusCode = 404;
        res.end((0, fs_1.readFileSync)("pages/comingSoon.html"));
    }
    else {
        // Otherwise, show the requested page
        res.end((0, fs_1.readFileSync)("pages".concat(PATH, ".html")));
    }
}).listen(8080);
