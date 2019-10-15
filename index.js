const pa11y = require("pa11y");
const fs = require("fs");
const readline = require("readline");

const dateString = getDateString();
const outputFolder = "results/" + dateString;
const outputErrorFolder = "errors/" + dateString;
const urlPath = "./urls.txt";
const baseUrl = "https://www.softec.wiwi.uni-due.de";

/**
 *
 * @param {string} urlPath Path to URLs to be tested
 * @param {string} baseUrl Base Url which gets prepended to every url
 */
async function run(outputFolder, outputErrorFolder, urlPath, baseUrl) {
  const rl = readline.createInterface({
    input: fs.createReadStream(urlPath),
    crlfDelay: Infinity
  });

  let cnt = 0;
  // Read file line by line
  for await (const line of rl) {
    // Increase count
    cnt++;
    const name = "result_" + cnt;
    // Add base url if neccessary
    const url = baseUrl ? baseUrl + line : line;
    try {
      console.info(`Testing #${cnt}: ${url}`);
      // Test url
      const result = await testUrl(url);
      // Write results to .json file
      writeToFile(outputFolder, name, "json", JSON.stringify(result));
      // Wait 4 seconds to avoid huge server load
      await slowDown(4000);
    } catch (err) {
      logError(outputErrorFolder, "error_" + cnt, err);
      writeToFile(outputFolder, name, "json", JSON.stringify(err));
    }
  }
}

/**
 *
 * @param {string} url URL to be tested with Pa11y
 */
async function testUrl(url) {
  try {
    return await pa11y(url);
  } catch (err) {
    throw { pageUrl: url, error: err };
  }
}

/**
 *
 * @param {string} folder Folder name
 * @param {string} name File name
 * @param {error} error Error
 */
function logError(folder, name, error) {
  ensureFolderExists(`./${folder}`);
  writeToFile(folder, name, "json", JSON.stringify(error));
}

/**
 *
 * @param {string} folder Folder name
 * @param {string} name File name
 * @param {string} suffix File suffix
 * @param {string} data Data to be written
 */
function writeToFile(folder, name, suffix, data) {
  ensureFolderExists(`./${folder}`);
  const path = `./${folder}/${name}.${suffix}`;
  fs.writeFileSync(path, data);
}

/**
 *
 * @param {string} path Folder path
 */
function ensureFolderExists(path) {
  fs.mkdirSync(path, { recursive: true });
}

/**
 *
 * @param {number} ms Delay in Milliseconds
 */
function slowDown(ms) {
  return new Promise(res => setTimeout(res, ms));
}

//prettier-ignore
function getDateString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1);
  const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  return [year, month, day].join("-");
}

run(outputFolder, outputErrorFolder, urlPath, baseUrl);
