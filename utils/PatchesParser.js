const { readFileSync } = require('node:fs');

/**
 * @param {string} packageName
 * @param {boolean} hasRoot
 */
module.exports = async function parsePatch(packageName, hasRoot, showUniversalPatches) {
  const patchesList = JSON.parse(
    readFileSync(global.jarNames.patchesList, 'utf8')
  );

  const rootedPatches = [
    'MicroG support',
    'GmsCore support'
  ];
  const patches = [];
  const generalPatches = [];
  const universalPatches = [];

  global.versions = [];

  for (const patch of patchesList) {
    const isRooted = rootedPatches.includes(patch.name);

    // Check if the patch is compatible:
    let isCompatible = false;
    /** @type {string} */
    let compatibleVersion;

    if (patch.compatiblePackages === null) continue;

    for (const pkg of patch.compatiblePackages)
      if (pkg.name === packageName) {
        isCompatible = true;

        if (pkg.versions !== null) {
          compatibleVersion = pkg.versions.at(-1);

          global.versions.push(compatibleVersion);
        }
      }

    if (!isCompatible) {
      if (patch.compatiblePackages.length !== 0) continue;
    }

    if (isRooted && !hasRoot) continue;

    generalPatches.push({
      name: patch.name,
      description: patch.description || '(Not Provided)',
      maxVersion: compatibleVersion || 'ALL',
      universal: false,
      isRooted,
      excluded: patch.excluded || (patch.use !== undefined && !patch.use),
    });
  }

  if (global.versions.length === 0) {
    global.versions = 'NOREC';
  }

  if (!showUniversalPatches) return generalPatches;

  for (const patch of patchesList) {
    const isRooted = rootedPatches.includes(patch.name);

    // Check if the patch is compatible:
    let isCompatible = false;

    /** @type {string} */
    let compatibleVersion;

    if (patch.compatiblePackages !== null) continue;
    patch.compatiblePackages = [];

    for (const pkg of patch.compatiblePackages)
      if (pkg.name === packageName) {
        isCompatible = true;

        if (pkg.versions !== null) {
          compatibleVersion = pkg.versions.at(-1);

          global.versions.push(compatibleVersion);
        }
      }

    if (!isCompatible) {
      if (patch.compatiblePackages.length !== 0) continue;
    }

    if (isRooted && !hasRoot) continue;

    universalPatches.push({
      name: patch.name,
      description: patch.description || '(Not Provided)',
      maxVersion: 'UNIVERSAL',
      universal: true,
      isRooted,
      excluded: patch.excluded || (patch.use !== undefined && !patch.use),
    });
  }

  for (const patch of generalPatches) {
    patches.push(patch);
  }

  for (const patch of universalPatches) {
    patches.push(patch);
  }

  return patches;
};
