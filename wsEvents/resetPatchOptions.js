const exec = require('../utils/promisifiedExec.js');

/**
 * @param {import('ws').WebSocket} ws
 */
module.exports = async function resetPatchOptions(ws) {
  const java = `${global.javaCmd}`;
  const cli = `${global.jarNames.cli}`;
  const patches = `${global.jarNames.patchesJar}`;

  await exec(
    `${java} -jar "${cli}" options --overwrite "${patches}"`
  );
};
