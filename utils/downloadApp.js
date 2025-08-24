const { join: joinPath } = require('node:path');

const { load } = require('cheerio');
const { dloadFromURL } = require('./FileDownloader.js');
const fetchWithUserAgent = require('../utils/fetchWithUserAgent.js');
const { antiSplit } = require('./AntiSplit.js');


/**
 * @param {import('ws').WebSocket} ws
 */
async function downloadApp(ws) {
  const { version, arch } = global.apkInfo;
  const apkMirrorVersionArg = version.replace(/\./g, '-');
  const link = global.jarNames.selectedApp.link;
  const url = `https://www.apkmirror.com${link}${link.split('/')[3]}-${apkMirrorVersionArg}-release/`

  let versionDownload = await fetchWithUserAgent(url);

  if (
    !versionDownload.ok &&
    global.jarNames.selectedApp.packageName === 'com.twitter.android'
  ) {
    versionDownload = await fetchWithUserAgent(
      url.replace('/twitter/twitter', '/twitter/x-formerly-twitter')
    );
    if (!versionDownload.ok) {
      versionDownload = await fetchWithUserAgent(
        url.replace('/twitter/twitter', '/twitter/x-previously-twitter')
      );
    }
  }

  if (!versionDownload.ok) {
    ws.send(
      JSON.stringify({
        event: 'error',
        error: `Failed to scrape download link for ${version}.<br>Please try downgrading.`
      })
    );

    return;
  }

  const versionDownloadList = await versionDownload.text();

  const $ = load(versionDownloadList);

  const apkDownloadLink =
    arch &&
    global.jarNames.selectedApp.packageName ===
      'com.google.android.apps.youtube.music'
      ? $(`div:contains("${arch}")`)
          .parent()
          .children('div[class^="table-cell rowheight"]')
          .first()
          .children('a[class="accent_color"]')
          .first()
          .attr('href')
      : $('span[class="apkm-badge"]')
          .first()
          .parent()
          .children('a[class="accent_color"]')
          .first()
          .attr('href');

  const apkmDownloadLink =
  $('span[class="apkm-badge success"]')
  .first()
  .parent()
  .children('a[class="accent_color"]')
  .first()
  .attr('href');

  if (!apkDownloadLink && !apkmDownloadLink) {
    return ws.send(
      JSON.stringify({
        event: 'error',
        error: `The version ${version} does not have an APK available, please use an older version.`
      })
    );
  }

  const downloadLink = !apkDownloadLink
  ? `https://www.apkmirror.com${apkmDownloadLink}`
  : `https://www.apkmirror.com${apkDownloadLink}`;

  const downloadLinkPage = await fetchWithUserAgent(downloadLink)
  .then((res) => res.text());

  const $2 = load(downloadLinkPage);
  const pageLink = $2('a[class^="accent_bg btn btn-flat downloadButton"]')
    .first()
    .attr('href');

  const downloadPage = await fetchWithUserAgent(`https://www.apkmirror.com${pageLink}`).then(
    (res) => res.text()
  );
  const $3 = load(downloadPage);
  const apkLink = $3('a[rel="nofollow"]').first().attr('href');

  if (!apkDownloadLink) {
    await dloadFromURL(
      `https://www.apkmirror.com${apkLink}`,
      `${joinPath(
        global.revancedDir,
        global.jarNames.selectedApp.packageName
      )}.apkm`,
      ws
    );
    await antiSplit(
      `${joinPath(
        global.revancedDir,
        global.jarNames.selectedApp.packageName
      )}.apkm`,
      `${joinPath(
        global.revancedDir,
        global.jarNames.selectedApp.packageName
      )}.apk`,
      ws
    );
  } else {
    await dloadFromURL(
      `https://www.apkmirror.com${apkLink}`,
      `${joinPath(
        global.revancedDir,
        global.jarNames.selectedApp.packageName
      )}.apk`,
      ws
    );
  }

  ws.send(
    JSON.stringify({
      event: 'finished'
    })
  );
}

module.exports = {
  downloadApp
};
