const fs = require("fs");

/**
 *
 * @param {string} inputPath Path to results, which need to be combined
 * @param {string} outputPath Path to resulting tsv file
 */
function Report(inputPath, outputPath) {
  const files = getFiles(inputPath);
  const header = createHeader("\t");
  let stream = fs.createWriteStream(outputPath, { flags: "a" });
  stream.write(header);
  files.forEach((file, idx) => {
    const filePath = `${inputPath}/${file}`;
    const data = JSON.parse(fs.readFileSync(filePath));
    const lines = createLines(data, idx + 1, "\t");
    stream.write(lines);
  });
  stream.end();
}

/**
 *
 * @param {string} path Path to result files
 */
function getFiles(path) {
  const files = fs.readdirSync(path).sort((a, b) => {
    return parseInt(a.split("_")[1]) - parseInt(b.split("_")[1]);
  });
  return files;
}

/**
 *
 * @param {string} sep Separator to be used
 */
function createHeader(sep) {
  return `sourceFile${sep}documentTitle${sep}pageUrl${sep}issueCode${sep}context${sep}message${sep}type${sep}typeCode${sep}selector\n`;
}

/**
 *
 * @param {any} data Result Data to be written
 * @param {number} idx Source File Index
 * @param {string} sep Separator to be used
 */
function createLines(data, idx, sep) {
  if (!data.issues || data.issues.length <= 0) return "";
  let lines = "";
  // Add lines with issues
  data.issues.forEach(issue => {
    // prettier-ignore
    let line = [idx,data.documentTitle, data.pageUrl, issue.code, issue.context, issue.message, issue.type, issue.typeCode, issue.selector].join(sep);
    lines += line.replace(/\n/g, "\\n") + "\n";
  });
  return lines;
}

Report("./results/2019-08-28", "./results/2019-08-28.tsv");
