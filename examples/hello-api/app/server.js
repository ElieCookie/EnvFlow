const http = require("http");

const port = Number(process.env.PORT || 8080);

http
  .createServer((_req, res) => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ hello: "envflow", pid: process.pid, ts: Date.now() }));
  })
  .listen(port, () => {
    console.log(`hello-api listening on :${port}`);
  });
