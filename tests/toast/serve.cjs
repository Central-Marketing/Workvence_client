const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const http = require("node:http");
// Reuse Next's installed webpack; no production fixture route or new dependency.
const { webpack } = require("next/dist/compiled/webpack/webpack");
const root = path.resolve(__dirname, "../..");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "workvence-toast-test-"));
const compiler = webpack({
  mode: "development",
  devtool: false,
  entry: path.join(__dirname, "fixture.tsx"),
  output: { path: output, filename: "fixture.js" },
  resolve: { extensions: [".tsx", ".ts", ".js"] },
  module: { rules: [{ test: /\.(tsx?|css)$/, exclude: /node_modules/, use: path.join(__dirname, "loader.cjs") }] },
});
compiler.run((error, stats) => {
  if (error || stats.hasErrors()) {
    console.error(error || stats.toString({ all: false, errors: true }));
    process.exitCode = 1;
    compiler.close(() => {});
    return;
  }
  compiler.close(() => {});
  const globals = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
  const fontRules = globals.match(/@font-face\s*\{[^}]+\}/g).join("\n");
  const fontVariable = globals.match(/--font-sf-pro:[^;]+;/)[0];
  const server = http.createServer((req, res) => {
    if (req.url === "/fixture.js") {
      res.setHeader("Content-Type", "text/javascript");
      res.end(fs.readFileSync(path.join(output, "fixture.js")));
    } else if (/^\/fonts\/sf-pro\/[\w.-]+$/.test(req.url)) {
      const font = path.join(root, "public", req.url);
      if (!fs.existsSync(font)) { res.writeHead(404); res.end(); return; }
      res.setHeader("Content-Type", "font/ttf");
      res.end(fs.readFileSync(font));
    } else {
      res.setHeader("Content-Type", "text/html");
      res.end(`<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${fontRules}:root{${fontVariable}}*{box-sizing:border-box}body{margin:0;background:#f8fafc}</style></head><body><div id="root"></div><script src="/fixture.js"></script></body></html>`);
    }
  });
  server.listen(3217, "127.0.0.1", () => console.log("Local toast fixture ready"));
});
