const http = require("http"),
  fs = require("fs"),
  url = require("url");

http
  .createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Hello Node!\n");
  })
  .listen(8080);

console.log("My first Node test server is running on Port 8080.");

const server = http.createServer((request, response) => {
  const parsedUrl = url.parse(request.url, true);
  if (parsedUrl.pathname.includes("documentation")) {
    fs.readFile("documentation.html", (err, data) => {
      if (err) {
        response.writeHead(404);
        response.end("Error: File Not Found");
      } else {
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(data);
      }
    });
  } else {
    fs.readFile("index.html", (err, data) => {
      if (err) {
        response.writeHead(404);
        response.end("Error: File Not Found");
      } else {
        response.writeHead(200, { "Content-Type": "text/html" });
        response.end(data);
      }
    });
  }
});
