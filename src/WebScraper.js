const axios = require("axios");

const utils = require("util");
const fs = require("fs");
const path = require("path");

const readFile = utils.promisify(fs.readFile);
const mkdir = utils.promisify(fs.mkdir);

class WebScraper {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  async scrape(pathname) {
    const cachedFilePath = path.resolve(__dirname, "..", ".cache", pathname + ".html");

    try {
      // Return the cached file if it's available
      const cachedFile = await readFile(cachedFilePath, {encoding: "utf-8"});
      return cachedFile
    } catch (err) {
      // If no file is cached for the given pathname we store one
      if (err.code === "ENOENT") {
        const url = new URL(pathname, this.baseURL);

        console.log("DOWNLOADING:", url.toString());

        const response = await axios.get(url.toString(), { responseType: "stream" });

        // Create cache file directory if it's unavailable
        const cachedFileDir = path.dirname(cachedFilePath)
        await mkdir(cachedFileDir, {recursive: true});

        // Create a write stream where the downloaded file will be stored.
        const cachedFileWriteStream = fs.createWriteStream(cachedFilePath)

        // Download the file to the cache directory
        response.data.pipe(cachedFileWriteStream)

        // We return a promise -- reading the downloaded file and passing the contents
        // as the resolved result of the promise
        return new Promise((res, rej) => {
          cachedFileWriteStream.on("finish", () => {
            readFile(cachedFilePath, {encoding: "utf-8"}).then(res).catch(rej);
          })

          cachedFileWriteStream.on("error", rej);
        })
      }
    }
  }
}

module.exports = exports = WebScraper
