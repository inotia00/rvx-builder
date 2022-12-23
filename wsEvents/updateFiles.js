const { existsSync, mkdirSync, rmSync } = require('node:fs');
const { join: joinPath } = require('node:path');

const { downloadFiles } = require('../utils/FileDownloader.js');
const checkJDKAndAapt2 = require('../utils/checkJDKAndAapt2.js');
const checkJDkAndADB = require('../utils/checkJDKAndADB.js');

global.revancedDir = joinPath(process.cwd(), 'revanced');
global.javaCmd = 'java';
global.jarNames = {
  cli: '',
  patchesJar: global.revancedDir,
  integrations: global.revancedDir,
  microG: global.revancedDir,
  patchesList: global.revancedDir,
  selectedApp: '',
  patches: '',
  isRooted: false,
  deviceID: '',
  patch: {
    integrations: false
  }
};

/**
 * @param {import('ws').WebSocket} ws
 */
module.exports = async function updateFiles(ws) {
  if (!existsSync(global.revancedDir)) mkdirSync(global.revancedDir);
  if (existsSync('revanced-cache'))
    rmSync('revanced-cache', { recursive: true, force: true });

  const filesToDownload = [
    {
      owner: 'inotia00',
      repo: 'revanced-cli'
    },
    {
      owner: 'inotia00',
      repo: 'revanced-patches'
    },
    {
      owner: 'inotia00',
      repo: 'revanced-integrations'
    },
    {
      owner: 'inotia00',
      repo: 'VancedMicroG'
    }
  ];

  if (
    typeof global.downloadFinished !== 'undefined' &&
    !global.downloadFinished
  ) {
    ws.send(
      JSON.stringify({
        event: 'error',
        error:
          "Downloading process hasn't finished and you tried to download again."
      })
    );

    return;
  }

  global.downloadFinished = false;

  await downloadFiles(filesToDownload, ws);

  if (process.platform === 'android') await checkJDKAndAapt2(ws);
  else await checkJDkAndADB(ws);

  global.downloadFinished = true;

  ws.send(
    JSON.stringify({
      event: 'finished'
    })
  );
};
