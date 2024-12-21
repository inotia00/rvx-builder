const checkFileAlreadyExists = require('./checkFileAlreadyExists.js');
const checkForUpdates = require('./checkForUpdates.js');
const getApp = require('./getApp.js');
const getAppVersion = require('./getAppVersion.js');
const getDevices = require('./getDevices.js');
const getPatches = require('./getPatches.js');
const getSettings = require('./getSettings.js');
const installReVanced = require('./installReVanced.js');
const patchApp = require('./patchApp.js');
const resetPatchOptions = require('./resetPatchOptions.js');
const resetSettings = require('./resetSettings.js');
const selectApp = require('./selectApp.js');
const selectAppVersion = require('./selectAppVersion.js');
const selectPatches = require('./selectPatches.js');
const setDevice = require('./setDevice.js');
const setSettings = require('./setSettings.js');
const updateFiles = require('./updateFiles.js');

module.exports = {
  checkFileAlreadyExists,
  checkForUpdates,
  getApp,
  getAppVersion,
  getDevices,
  getPatches,
  getSettings,
  installReVanced,
  patchApp,
  resetPatchOptions,
  resetSettings,
  selectApp,
  selectAppVersion,
  selectPatches,
  setDevice,
  setSettings,
  updateFiles
};
