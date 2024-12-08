const { existsSync, mkdirSync, rmSync } = require('node:fs');
const { join: joinPath } = require('node:path');
const { getSources } = require('../utils/Settings.js');
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
  apkEditor: global.revancedDir,
  patchesList: global.revancedDir,
  selectedApp: '',
  patches: '',
  isRooted: false,
  deviceID: ''
};

/**
 * @param {import('ws').WebSocket} ws
 */
module.exports = async function updateFiles(ws) {
  const source = getSources();
  const cli = source.cli.split('/');
  const patches = source.patches.split('/');
  const integrations = source.integrations.split('/');
  const microg = source.microg.split('/');
  const preReleases = source.prereleases == 'true';
  const cli4 = source.cli4 == 'true';

  if (!existsSync(global.revancedDir)) mkdirSync(global.revancedDir);

  const filesToDownloadCli4 = [
    {
      owner: cli[0],
      repo: cli[1]
    },
    {
      owner: patches[0],
      repo: patches[1]
    },
    {
      owner: integrations[0],
      repo: integrations[1]
    },
    {
      owner: microg[0],
      repo: microg[1]
    },
    {
      owner: 'REAndroid',
      repo: 'APKEditor'
    }
  ];
  const filesToDownloadCli5 = [
    {
      owner: cli[0],
      repo: cli[1]
    },
    {
      owner: patches[0],
      repo: patches[1]
    },
    {
      owner: microg[0],
      repo: microg[1]
    },
    {
      owner: 'REAndroid',
      repo: 'APKEditor'
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
  if (cli4) await downloadFiles(filesToDownloadCli4, preReleases, cli4, ws);
  else await downloadFiles(filesToDownloadCli5, preReleases, cli4, ws);

  if (process.platform === 'android') await checkJDKAndAapt2(ws);
  else await checkJDkAndADB(ws);

  global.downloadFinished = true;

  ws.send(
    JSON.stringify({
      event: 'finished'
    })
  );
};
