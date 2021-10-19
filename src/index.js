let [service, input] = process.argv.slice(2);

const fs = require("fs");
const path = require("path");
const unzip = require("extract-zip");
const figlet = require("figlet");

const tempDir = path.resolve(__dirname, "temp");
if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });

if (!service) return console.log("No service specified");
if (!input) return console.log("No file specified");

const servicesDir = path.resolve(__dirname, "services");
const servicesList = fs.readdirSync(servicesDir);

service = service.toLowerCase();
service = servicesList.find(file => path.basename(file).toLowerCase() === service);

if (!service) return console.log("Service '" + service + "' not found");
if (!fs.existsSync(input)) return console.log("Input '" + input + "' not found");

const update = output => {
  // console.clear();
  console.log(title);
  if (output) console.log(output);
};

const end = error => {
  if (error) update("❌ " + error);
  if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true });
};

const title = figlet.textSync(service);
update();

const servicePath = path.resolve(servicesDir, service);
const callback = require(servicePath);
(async () => {
  if (input.endsWith(".zip")) {
    update("Unzipping...");
    await unzip(input, { dir: tempDir });
    input = tempDir;
  }

  if (fs.lstatSync(input).isDirectory()) {
    let files = fs.readdirSync(input);
    while (files.length === 1) {
      const [file] = files;
      input = path.resolve(input, file);
      if (!fs.lstatSync(input).isDirectory()) break;
      files = fs.readdirSync(input);
    }
  }

  callback(input, update, end);
})();