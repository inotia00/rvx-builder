const fetch = require('node-fetch');
const { existsSync, readFileSync } = require('node:fs');
const exec = require('../utils/promisifiedExec.js');

async function fetchPackages(packages) {
  const request = await fetch(
    `https://www.apkmirror.com/wp-json/apkm/v1/app_exists/`,
    {
      method: 'POST',
      body: JSON.stringify({ pnames: packages }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.231 Mobile Safari/537.36',
        Authorization:
          'Basic YXBpLXRvb2xib3gtZm9yLWdvb2dsZS1wbGF5OkNiVVcgQVVMZyBNRVJXIHU4M3IgS0s0SCBEbmJL'
      }
    }
  );

  try {
    const response = await request.json();
    return response.data;
  } catch (e) {
    const response = [];
    return response;
  }
}
/**
 * @param {import('ws').WebSocket} ws
 */
module.exports = async function getPatches(ws) {
  const patchesJson = `${global.jarNames.patchesList}`;

  const java = `${global.javaCmd}`;
  const cli = `${global.jarNames.cli}`;
  const patches = `${global.jarNames.patchesJar}`;
  const command = `${java} -jar "${cli}" patches --path="${patchesJson}" "${patches}"`;

  try {
    const patchesList = JSON.parse(
      readFileSync(global.jarNames.patchesList, 'utf8')
    );
    for (const patches of patchesList) {
    if (patches.compatiblePackages === null) continue;
      for (const packages of patches.compatiblePackages) {
      }
	}
  } catch (e) {
    await exec(command);
  }

  const patchesList = JSON.parse(
    readFileSync(global.jarNames.patchesList, 'utf8')
  );
  const appsList = [];
  const list = [];

  for (const patches of patchesList) {
    if (patches.compatiblePackages === null) continue;
    for (const packages of patches.compatiblePackages) {
      if (!appsList.some((el) => el.pname === packages.name))
        appsList.push({ pname: packages.name });
    }
  }

  const apps = await fetchPackages(appsList);
  for (const app of apps) {
    if (!app.exists) continue;

    list.push({
      appName: app.app.name,
      appPackage: app.pname,
      link: app.app.link
    });
  }

  ws.send(
    JSON.stringify({
      event: 'appList',
      list
    })
  );

  return;
};
