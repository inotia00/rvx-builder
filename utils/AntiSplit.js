const { existsSync, rmSync } = require('node:fs');

const exec = require('./promisifiedExec.js');

/** @type {import('ws').WebSocket} */
let ws;

/**
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {import('ws').WebSocket} [websocket]
 */
async function antiSplit(inputPath, outputPath, websocket) {
  if (websocket != null) ws = websocket;

  if (existsSync(outputPath)) {
    rmSync(outputPath, { recursive: true, force: true });
  }

  ws.send(
    JSON.stringify({
      event: 'mergingFile'
    })
  );

  await exec(
    `java -jar "${global.jarNames.apkEditor}" m -i "${inputPath}" -o "${outputPath}"`
  );
}

module.exports = {
  antiSplit
};