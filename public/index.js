/* eslint-disable no-unused-vars */

const WS_URI = `${window?.location?.protocol === 'https:' ? 'wss' : 'ws'}://${
  window?.location?.host ?? 'localhost:8080'
}`;
const ws = new WebSocket(WS_URI);

let currentFile;
let alreadyAddedLog = false;
let isDownloading = false;
let hasFinished = false;
let arch;
let versionChoosen;
let uploadedApk = false;

if (localStorage.getItem('black-theme')) {
  document.documentElement.classList.add('black');
}

function sendCommand(args) {
  ws.send(JSON.stringify(args));
}

function setApp() {
  const appChecked = document.querySelector('input[name="app"]:checked');

  if (appChecked === null) return alert("You didn't select an app to patch!");

  sendCommand({
    event: 'selectApp',
    selectedApp: {
      packageName: appChecked.value,
      link: appChecked.attributes.link.value,
      appName: appChecked.attributes.appName.value
    }
  });

  location.href = '/patches';
}

function loadPatches() {
  sendCommand({ event: 'getPatches' });
}

function updateFiles() {
  sendCommand({ event: 'updateFiles' });
}

/**
 * @param {boolean} bool
 */
function toggle(bool) {
  for (const checkbox of document.getElementsByClassName('select')) {
    if (bool && checkbox.getAttribute('data-excluded') !== '0') continue;

    checkbox.checked = bool;
  }
}

function goToPatches() {
  if (hasFinished) location.href = '/patches';
}

function checkForUpdates() {
  sendCommand({ event: 'checkForUpdates' });
}

function setPatches() {
  const patchElementList = Array.from(document.querySelectorAll('.select'));

  let selectedPatchList = [];
  let excludedPatchList = [];

  for (const patchElement of patchElementList)
    (patchElement.checked ? selectedPatchList : excludedPatchList).push(
      patchElement
    );

  if (selectedPatchList.length === 0)
    return alert("You haven't selected any patches.");

  selectedPatchList = selectedPatchList.map((x) =>
    x.getAttribute('data-patch-name')
  );
  excludedPatchList = excludedPatchList.map((x) =>
    x.getAttribute('data-patch-name')
  );

  sendCommand({
    event: 'selectPatches',
    selectedPatches: selectedPatchList,
    excludedPatches: excludedPatchList
  });
  if (uploadedApk) {
    location.href = '/patch';
  } else location.href = '/versions';
}

/**
 * @param {string} arch
 * @param {string} version
 */
function setAppVersion(arch, version) {
  if (!isDownloading) {
    const versionChecked = document.querySelector(
      'input[name="version"]:checked'
    );

    if (arch == null && versionChecked === null)
      return alert("You didn't select an app version!");

    if (versionChecked !== null && !localStorage.getItem('arsclib')) {
      if (
        versionChecked.hasAttribute('data-recommended') &&
        versionChecked.getAttribute('data-recommended') !== '1'
      ) {
        const alertVersion = confirm(
          "**Non-supported version selected**\n***Are you sure?***\nThis version isn't supported, do you really want to use this version?"
        );

        if (!alertVersion) return;
      }

      if (versionChecked.getAttribute('data-beta') !== '0') {
        const alertBetaVersion = confirm(
          "**Non-supported version selected**\n***Are you sure?***\nThis version isn't supported, do you really want to use this version?"
        );

        if (!alertBetaVersion) return;
      }
    }

    document.getElementById('continue').classList.add('disabled');

    sendCommand({
      event: 'selectAppVersion',
      versionChoosen: version ?? versionChecked.value,
      arch
    });

    document.getElementsByTagName('header')[0].innerHTML =
      '<h1><i class="fa-solid fa-download"></i>Downloading APK</h1>';
    document.getElementById('content').innerHTML = '<span class="log"></span>';
    document.getElementsByTagName('main')[0].innerHTML +=
      '<progress value="0"></progress>';
    isDownloading = true;
  } else {
    if (!hasFinished) return alert("Downloading process hasn't finished yet.");

    location.href = '/patch';
  }
}

/**
 * @param {boolean} isRooted
 */
function getAppVersions(isRooted, page = 1) {
  document.getElementsByTagName('header')[0].innerHTML = `
    <h1><i class="fa-solid fa-file-arrow-down"></i>Select the version you want to download</h1>
    <span>Versions marked as beta might have bugs or can be unstable, unless marked as supported<span>
    ${
      isRooted
        ? '<span><strong>You are building rooted ReVanced Extended</strong>, ReVanced Extended Builder will automatically download the correct version for you.<br>If you didn\'t intend on doing a rooted build, include all "Root required to exclude" patches<span>'
        : ''
    }
    `;

  const continueButton = document.getElementById('continue');
  const backButton = document.getElementById('back');

  continueButton.innerHTML = 'Continue';
  continueButton.onclick = () => setAppVersion();
  backButton.innerHTML = 'Back';
  backButton.onclick = () => history.back();

  if (page < 1) page = 1;

  sendCommand({ event: 'getAppVersion', checkVer: true, page });
}

function buildReVanced() {
  if (localStorage.getItem('arsclib')) {
    sendCommand({ event: 'patchAppArscLib' });
  } else {
    sendCommand({ event: 'patchApp', ripLibs: localStorage.getItem('rip-libs') });
  }
}

function getAlreadyExists() {
  sendCommand({ event: 'checkFileAlreadyExists' });
}

/**
 * @param {string} phrase
 */
function toTitleCase(phrase) {
  return phrase
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function exitApp() {
  location.href = '/exited';
}

window.addEventListener('keypress', (e) => {
  if (e.key !== 'Enter') return;

  e.preventDefault();

  document.getElementById('continue').click();
});

function setDevice() {
  const deviceElementList = Array.from(document.querySelectorAll('.select'));

  let selectedDeviceList = [];

  for (const deviceElement of deviceElementList)
    (deviceElement.checked ? selectedDeviceList : []).push(deviceElement);

  if (selectedDeviceList.length === 0)
    return alert("You haven't selected any devices.");

  selectedDeviceList = selectedDeviceList.map((x) => x.getAttribute('value'));

  sendCommand({
    event: 'setDevice',
    devices: selectedDeviceList ?? []
  });

  location.href = '/patches';
}

function getDevices() {
  sendCommand({ event: 'getDevices' });
}

function installReVanced() {
  sendCommand({ event: 'installReVanced' });
}

function addSearch(isPatches) {
  document.getElementById('search').addEventListener('keyup', () => {
    const searchText = document.getElementById('search').value.toLowerCase();

    Array.from(document.getElementsByTagName('li')).forEach(
      (x) => (x.style.display = 'none')
    );

    if (isPatches) {
      Array.from(document.getElementsByClassName('patchName'))
        .filter((x) => x.innerText.toLowerCase().includes(searchText))
        .forEach(
          (x) => (x.parentNode.parentNode.parentNode.style.display = 'flex')
        );
    } else {
      Array.from(document.getElementsByClassName('appName'))
        .filter((x) => x.innerText.toLowerCase().includes(searchText))
        .forEach((x) => (x.parentNode.style.display = 'flex'));
    }
  });
}

function resetPatchOptions() {
  sendCommand({ event: 'resetPatchOptions' });
}

function resetSettings() {
  sendCommand({ event: 'resetSettings' });
  disableARSCLib();
  setSourcesRVX();
}

function disableARSCLib() {
  if (localStorage.getItem('arsclib')) {
    document.getElementById('ARSCLibBtn').click();
  }
}

function setSources() {
  const cliOrg = document.getElementById('cli-org').value;
  const cliSrc = document.getElementById('cli-src').value;
  const cli = `${cliOrg}/${cliSrc}`;

  const cli4 = document.getElementById('cli4').value;

  const patchesOrg = document.getElementById('patch-org').value;
  const patchesSrc = document.getElementById('patch-src').value;
  const patches = `${patchesOrg}/${patchesSrc}`;

  const integrationsOrg = document.getElementById('integrations-org').value;
  const integrationsSrc = document.getElementById('integrations-src').value;
  const integrations = `${integrationsOrg}/${integrationsSrc}`;

  const microgOrg = document.getElementById('microg-org').value;
  const microgSrc = document.getElementById('microg-src').value;
  const microg = `${microgOrg}/${microgSrc}`;

  const prereleases = localStorage.getItem('pre-releases') + '';

  sendCommand({
    event: 'setSettings',
    settings: {
      cli,
      patches,
      integrations,
      microg,
      prereleases,
      cli4
    }
  });
}

function disableARSCLibBeforeSetSources() {
  disableARSCLib();
  setSources();
}

function setSourcesRVX() {
  document.getElementById('cli-org').value = 'inotia00';
  document.getElementById('cli-src').value = 'revanced-cli';

  document.getElementById('cli4').value = 'false';

  document.getElementById('patch-org').value = 'inotia00';
  document.getElementById('patch-src').value = 'revanced-patches';

  document.getElementById('integrations-org').value = 'inotia00';
  document.getElementById('integrations-src').value = 'revanced-integrations';

  document.getElementById('microg-org').value = 'ReVanced';
  document.getElementById('microg-src').value = 'GmsCore';

  disableARSCLibBeforeSetSources();
}

function setSourcesRVX_anddea() {
  document.getElementById('cli-org').value = 'inotia00';
  document.getElementById('cli-src').value = 'revanced-cli';

  document.getElementById('cli4').value = 'false';

  document.getElementById('patch-org').value = 'anddea';
  document.getElementById('patch-src').value = 'revanced-patches';

  document.getElementById('integrations-org').value = 'anddea';
  document.getElementById('integrations-src').value = 'revanced-integrations';

  disableARSCLibBeforeSetSources();
}

function setSourcesReVanced() {
  document.getElementById('cli-org').value = 'inotia00';
  document.getElementById('cli-src').value = 'revanced-cli';

  document.getElementById('cli4').value = 'false';

  document.getElementById('patch-org').value = 'revanced';
  document.getElementById('patch-src').value = 'revanced-patches';

  document.getElementById('integrations-org').value = 'revanced';
  document.getElementById('integrations-src').value = 'revanced-integrations';

  disableARSCLibBeforeSetSources();
}

function setSourcesPiko() {
  document.getElementById('cli-org').value = 'inotia00';
  document.getElementById('cli-src').value = 'revanced-cli';

  document.getElementById('cli4').value = 'true';

  document.getElementById('patch-org').value = 'crimera';
  document.getElementById('patch-src').value = 'piko';

  document.getElementById('integrations-org').value = 'crimera';
  document.getElementById('integrations-src').value = 'revanced-integrations';

  disableARSCLibBeforeSetSources();
}

function setSourcesRVX_ARSCLib() {
  document.getElementById('cli-org').value = 'inotia00';
  document.getElementById('cli-src').value = 'revanced-cli-arsclib';

  document.getElementById('cli4').value = 'true';

  document.getElementById('patch-org').value = 'inotia00';
  document.getElementById('patch-src').value = 'revanced-patches-arsclib';

  document.getElementById('integrations-org').value = 'inotia00';
  document.getElementById('integrations-src').value = 'revanced-integrations';

  setSources();
}

ws.onmessage = (msg) => {
  /** @type {Record<string, any>} */
  const message = JSON.parse(msg.data);

  switch (message.event) {
    case 'patchList':
      {
        uploadedApk = message.uploadedApk;
        const len = message.patchList.length;

        const patchListElement = document.getElementById('patchList');

        for (let i = 0; i < len; i++) {
          const patch = message.patchList[i];

          patchListElement.innerHTML += `<li>
  <input class="select" id="select-patch-${i}" data-patch-name="${
            patch.name
          }" data-excluded="${patch.excluded ? '1' : '0'}" type="checkbox">
  <label for="select-patch-${i}">
  ${
    patch.isRooted
      ? '<span class="no-root"><strong>Needed for Non-Root Building</strong></span>'
      : ''
  }
    <span><strong class="patchName">${toTitleCase(
      patch.name
    )}</strong>&nbsp;&nbsp;(${
            patch.maxVersion !== ' ' ? patch.maxVersion : 'ALL'
          })</span>
    <span class="patch-description">${patch.description}</span>
  </label>
</li>`;
        }

        addSearch(true);

        Array.from(document.getElementsByClassName('select'))
          .filter((patch) =>
            message.rememberedPatchList.includes(
              patch.getAttribute('data-patch-name')
            )
          )
          .forEach((patch) => (patch.checked = true));
      }
      break;
    case 'downloadingFile':
      {
        isDownloading = true;

        let logElement = document.getElementsByClassName('log')[0];

        if (!logElement) {
          document.getElementById('content').innerHTML =
            '<span class="log"></span>';
          document.getElementsByTagName('main')[0].innerHTML +=
            '<progress value="0"></progress>';
          logElement = document.getElementsByClassName('log')[0];
        }

        const downloadMessage = `<span class="log-line"><strong>[builder]</strong> Downloading ${message.name}...</span><br/>`;

        if (currentFile !== message.name) {
          currentFile = message.name;
          logElement.innerHTML += downloadMessage;
        }

        document.getElementsByTagName('progress')[0].value = (
          message.percentage / 100
        ).toString();
      }
      break;
    case 'mergingFile':
      document.getElementsByClassName('log')[0].innerHTML +=
        '<span class="log-line"><strong>[builder]</strong> Merging files...</span><br/>';

      break;
    case 'finished':
      hasFinished = true;

      try {
        document.getElementById('resetoptions').classList.remove('disabled');
      } catch (_) {}
      document.getElementById('continue').classList.remove('disabled');
      if (localStorage.getItem('auto-next')) {
        document.getElementById('continue').click();
      }
      document.getElementsByClassName('log')[0].innerHTML +=
        '<span class="log-line"><strong>[builder]</strong> Finished downloading files.</span><br/>';
      break;
    case 'appVersions':
      {
        const len = message.versionList.length;

        const versionsElement = document.getElementById('versions');
        versionsElement.innerHTML = '';

        versionsElement.innerHTML += `
          <li>
          ${
            message.page != 1
              ? `<button id="prevPage" onclick="getAppVersions(${
                  message.isRooted
                }, ${message.page - 1})">Previous Page</button>`
              : ''
          }
          <button id="nextPage" onclick="getAppVersions(${message.isRooted}, ${
          message.page + 1
        })">Next Page</button>
        </li>`;

        for (let i = 0; i < len; i++) {
          const version = message.versionList[i];
          const noRec = version.recommended == 'NOREC';
          const recommended = version.recommended ? 1 : 0;
          const autoSelect = message.supported == 'C' ? version.version : message.supported;

          versionsElement.innerHTML += `
          ${
            message.page == 1 && i == 0 && !localStorage.getItem('arsclib')
              ? `<li><input type="radio" name="version" id="app-${len}" value="${
                autoSelect
              }" data-beta="0" data-recommended="1"/>
                <label for="app-${len}">${autoSelect} (AUTO SELECT)</label></li>`
              : ''
          }`;

          versionsElement.innerHTML += `
            <li>
            <input type="radio" name="version" id="app-${i}" value="${
            version.version
          }" data-beta="${version.beta ? '1' : '0'}" ${
            !noRec ? 'data-recommended="' + recommended + '"' : ''
          }/>
            <label for="app-${i}">${version.version} ${
            version.beta ? ' (beta)' : ''
          } ${
            !noRec ? (version.recommended ? ' (supported)' : '') : ''
          }</label></li>`;
        }

        if (
          message.selectedApp === 'com.google.android.apps.youtube.music' &&
          !message.foundDevice
        )
          document.getElementById('continue').onclick = () => {
            const version = document.querySelector(
              'input[name="version"]:checked'
            ).value;

            document.getElementsByTagName('header')[0].innerHTML = `
          <h1><i class="fa-solid fa-rectangle-list"></i>Please select the architecture</h1>
          <span>YouTube Music APKs only have specific architecture APKs.
          <br>If you don't know which one to choose, either look at your devices architecture using CPU-Z or select Arm64.</span>`;
            document.getElementById('versions').innerHTML = `
          <li>
          <input type="radio" name="arch" id="arch-1" value="arm64-v8a"/>
          <label for="arch-1">Arm64 (armv8)</label></li>
          <li>
          <input type="radio" name="arch" id="arch-2" value="armeabi-v7a"/>
          <label for="arch-2">Arm32 (armv7)</label></li>`;
            document.getElementById('continue').onclick = () => {
              if (isDownloading && hasFinished) location.href = '/patch';

              document.getElementById('continue').classList.add('disabled');

              setAppVersion(
                document.querySelector('input[name="arch"]:checked').value,
                version
              );
            };
          };
      }
      break;
    case 'installingStockApp':
      {
        if (message.status === 'DOWNLOAD_STARTED') {
          document.getElementsByTagName('header')[0].innerHTML =
            '<h1><i class="fa-solid fa-download"></i>Downloading APK</h1>';
          document.getElementById('content').innerHTML =
            '<span class="log"></span>';
          document.getElementsByTagName('main')[0].innerHTML +=
            '<progress value="0"></progress>';
          isDownloading = true;
          document.getElementById('continue').classList.add('disabled');
        } else if (message.status === 'DOWNLOAD_COMPLETE') {
          document.getElementById('continue').classList.add('disabled');
          isDownloading = false;
          document.getElementsByClassName(
            'log'
          )[0].innerHTML += `<span class="log-line info"><strong>[builder]</strong> Uninstalling the stock app...</span><br>`;
        } else if (message.status === 'UNINSTALL_COMPLETE') {
          document.getElementsByClassName(
            'log'
          )[0].innerHTML += `<span class="log-line info"><strong>[builder]</strong> Installing the downloaded (stock) APK...</span><br>`;
        } else if (message.status === 'ALL_DONE') {
          document.getElementsByClassName(
            'log'
          )[0].innerHTML += `<span class="log-line info"><strong>[builder]</strong> Complete.</span><br>`;
          document.getElementById('continue').classList.remove('disabled');
          document.getElementById('continue').onclick = () => {
            location.href = '/patch';
          };
        }
      }
      break;
    case 'patchLog':
      {
        const logLevel = message.log.includes('WARNING')
          ? 'warn'
          : message.log.includes('SEVERE')
          ? 'error'
          : 'info';

        document.getElementsByClassName(
          'log'
        )[0].innerHTML += `<span class="log-line ${logLevel}"><strong>[builder]</strong> ${message.log}</span><br>`;

        const logWrap = document.getElementById('content--wrapper');
        logWrap.scrollTop = logWrap.scrollHeight;
      }
      break;
    case 'fileExists':
      {
        // TODO: on a root install, if the file already exists and the user selects yes it skips checking if a device is plugged in
        document.getElementsByTagName('header')[0].innerHTML = `
            <h1><i class="fa-solid fa-file-arrow-down"></i>Use already downloaded APK?</h1>
            <span>The APK already exists in the revanced folder.${
              message.isRooted ? ' ' : '<br>'
            }Do you want to use it?${
          message.isRooted
            ? '<br>(Saying no is supported for rooted building)<br>If you didn\'t intend on doing a rooted build, include all "Root required to exclude" patches'
            : ''
        }</span>`;

        const continueButton = document.getElementById('continue');
        const backButton = document.getElementById('back');

        continueButton.innerHTML = 'Yes';
        continueButton.onclick = () => {
          location.href = '/patch';
        };
        backButton.innerHTML = 'No';
        backButton.onclick = () => getAppVersions(message.isRooted);
      }
      break;
    case 'fileDoesntExist':
      getAppVersions(message.isRooted);
      break;
    case 'buildFinished':
      {
        if (message.install) location.href = '/installer';
        document.getElementsByTagName('header')[0].innerHTML =
          '<h1><i class="fa-solid fa-square-check"></i>Finished</h1>';

        const firstFooterElement = document.getElementsByTagName('footer')[0];

        if (!WS_URI.startsWith('ws://localhost'))
          firstFooterElement.innerHTML +=
            '<button class="highlighted" onclick="window.open(\'/revanced.apk\', \'_blank\')">Download</button>';

        firstFooterElement.innerHTML +=
          '<button class="highlighted" onclick="location.href = \'/\'">Build Again</button><button onclick="exitApp();">Quit</button>';
      }
      break;
    case 'error':
      location.href = `/failure?error=${message.error}`;
      break;
    case 'notUpToDate':
      document.getElementById(
        'builderVersion'
      ).innerHTML = `${message.builderVersion}`;
      document.getElementById(
        'currentVersion'
      ).innerHTML = `${message.currentVersion}`;
      document.querySelector('.updater .latest').style.display = 'none';
      document.querySelector('.updater .outdated').style.display = 'block';
      document.querySelector('.updater').style.display = 'block';
      break;
    case 'upToDate':
      document.getElementById(
        'builderVersion'
      ).innerHTML = `${message.currentVersion}`;
      document.getElementById(
        'currentVersion'
      ).innerHTML = `${message.currentVersion}`;
      document.querySelector('.updater').style.display = 'block';
      break;
    case 'multipleDevices':
      location.href = '/devices';
      break;
    case 'devices': {
      const len = message.devices.length;

      for (let i = 0; i < len; i++) {
        const device = message.devices[i];

        document.getElementById('devices').innerHTML += `
        <li>
        <input class="select" id="app-${i}" value="${device.id}" type="checkbox">
        <label for="app-${i}">
          <span><strong>${device.id} (${device.model})</strong></span>
        </label>
      </li>`;
      }
      break;
    }
    case 'askRootVersion':
      {
        const confirmVer = confirm(
          `**Non Supported Version**\nYour device has a non supported version. This means you have to let the builder replace the stock YouTube with a supported version.\nContinue?`
        );

        if (confirmVer)
          return sendCommand({
            event: 'getAppVersion',
            installLatestRecommended: true
          });
        else {
          if (confirm('Alright, proceed with the non-supported version?'))
            return sendCommand({
              event: 'getAppVersion',
              useVer: true
            });
        }
      }
      break;
    case 'appList': {
      let id = 0;
      for (const app of message.list) {
        const appName = app.appName.replace(' (Wear OS)', '');
        const link = app.link.replace('-wear-os', '');
        document.getElementById('appList').innerHTML += `
              <li>
                <input
                  type="radio"
                  name="app"
                  id="app-${id}"
                  value="${app.appPackage}"
                  link="${link}"
                  appName="${appName}"
                /><label class="appName" for="app-${id}">${appName} (${app.appPackage})</label>
              </li>`;

        id++;
      }

      addSearch(false);
      break;
    }

    case 'apkUploaded': {
      document.querySelector(
        '.inf'
      ).innerHTML = `<div><img src="${message.icon}"/><h2>${message.appName}</h2></div><p>${message.package}<br>v${message.versionName}</p>`;
      document.querySelector('.shw').style.display = 'block';
      document
        .getElementById('continue')
        .setAttribute('onClick', "location.href = '/patches'");
      break;
    }

    case 'settings': {
      const cli = message.settings.cli.split('/');
      const patches = message.settings.patches.split('/');
      const integrations = message.settings.integrations.split('/');
      const microg = message.settings.microg.split('/');
      const cli4 = message.settings.cli4 == 'true';

      const cliOrg = document.getElementById('cli-org');
      const cliSrc = document.getElementById('cli-src');

      cliOrg.value = cli[0];
      cliSrc.value = cli[1];

      const patchesOrg = document.getElementById('patch-org');
      const patchesSrc = document.getElementById('patch-src');

      patchesOrg.value = patches[0];
      patchesSrc.value = patches[1];

      const integrationsOrg = document.getElementById('integrations-org');
      const integrationsSrc = document.getElementById('integrations-src');

      integrationsOrg.value = integrations[0];
      integrationsSrc.value = integrations[1];

      const microgOrg = document.getElementById('microg-org');
      const microgSrc = document.getElementById('microg-src');

      microgOrg.value = microg[0];
      microgSrc.value = microg[1];

      const cli4Src = document.getElementById('cli4');
      cli4Src.value = cli4;

      const preReleases = document.getElementById('pre-releases');
      if (typeof prereleases === 'undefined') {
          preReleases.value = 'false';
      } else {
          preReleases.value = prereleases;
      }
    }
  }
};
