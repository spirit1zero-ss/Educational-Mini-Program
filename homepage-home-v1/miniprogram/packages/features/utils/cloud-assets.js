const CLOUD_FILE_PREFIX = "cloud://prod-d0ge2jwpgc0db67eb.7072-prod-d0ge2jwpgc0db67eb-1453312076/miniapp-assets/v1/";

const CLOUD_ASSET_FILE_IDS = Object.freeze({
  "module2.heroTree": `${CLOUD_FILE_PREFIX}module-2/hero-tree-v3.png`,
  "module2.definitionBook": `${CLOUD_FILE_PREFIX}module-2/definition-book-v4.png`,
  "module2.stageStudy": `${CLOUD_FILE_PREFIX}module-2/stage-study-v2.png`,
  "module2.englishAbc": `${CLOUD_FILE_PREFIX}module-2/english-abc-v2.png`,
  "module2.englishBricks": `${CLOUD_FILE_PREFIX}module-2/english-bricks-v3.png`,
  "module2.englishFrame": `${CLOUD_FILE_PREFIX}module-2/english-frame-v3.png`,
  "module2.mathAbacus": `${CLOUD_FILE_PREFIX}module-2/math-abacus-v2.png`,
  "module2.closingTree": `${CLOUD_FILE_PREFIX}module-2/closing-window-tree-v2.png`,
  "module2.subjectEnglish": `${CLOUD_FILE_PREFIX}module-2/subject-english-v2.png`,
  "module2.subjectMath": `${CLOUD_FILE_PREFIX}module-2/subject-math-v2.png`,
  "module2.subjectChinese": `${CLOUD_FILE_PREFIX}module-2/subject-chinese-v2.png`,
  "module3.habitHero": `${CLOUD_FILE_PREFIX}module-3/habit-hero-v2.png`,
  "module3.habitChild": `${CLOUD_FILE_PREFIX}module-3/habit-child-v2.png`,
  "module4.driveHero": `${CLOUD_FILE_PREFIX}module-4/drive-hero-v2.png`,
  "module4.driveFamily": `${CLOUD_FILE_PREFIX}module-4/drive-family-v2.png`,
  "module5.heroScene": `${CLOUD_FILE_PREFIX}module-5/camp-hero-scene-v2.png`,
  "module5.divider": `${CLOUD_FILE_PREFIX}module-5/camp-landscape-divider-v2.png`,
  "module5.closing": `${CLOUD_FILE_PREFIX}module-5/camp-closing-illustration-v2.png`,
  "module5.driveIcon": `${CLOUD_FILE_PREFIX}module-5/camp-icon-drive-v2.png`,
  "module5.habitIcon": `${CLOUD_FILE_PREFIX}module-5/camp-icon-habit-v2.png`,
  "module5.subjectIcon": `${CLOUD_FILE_PREFIX}module-5/camp-icon-subject-v2.png`,
  "module5.processForm": `${CLOUD_FILE_PREFIX}module-5/camp-process-form-v2.png`,
  "module5.processHouse": `${CLOUD_FILE_PREFIX}module-5/camp-process-house-v2.png`,
  "module5.processTutor": `${CLOUD_FILE_PREFIX}module-5/camp-process-tutor-v2.png`,
  "assessment.subjectChildren": `${CLOUD_FILE_PREFIX}assessments/ABC-04.jpg`
});

const resolvedUrlCache = {};

function resolveCloudAssetFields(fieldAssetMap) {
  const entries = Object.keys(fieldAssetMap || {})
    .map((field) => ({
      field,
      fileID: CLOUD_ASSET_FILE_IDS[fieldAssetMap[field]]
    }))
    .filter((item) => item.fileID);

  if (!entries.length || !wx.cloud || !wx.cloud.getTempFileURL) {
    return Promise.resolve({});
  }

  const resolvedFields = {};
  const missingFileIDs = [];

  entries.forEach((item) => {
    if (resolvedUrlCache[item.fileID]) {
      resolvedFields[item.field] = resolvedUrlCache[item.fileID];
    } else if (!missingFileIDs.includes(item.fileID)) {
      missingFileIDs.push(item.fileID);
    }
  });

  if (!missingFileIDs.length) {
    return Promise.resolve(resolvedFields);
  }

  return new Promise((resolve) => {
    wx.cloud.getTempFileURL({
      fileList: missingFileIDs,
      success: (result) => {
        (result.fileList || []).forEach((file) => {
          if (file.fileID && file.tempFileURL) {
            resolvedUrlCache[file.fileID] = file.tempFileURL;
          }
        });

        entries.forEach((item) => {
          if (resolvedUrlCache[item.fileID]) {
            resolvedFields[item.field] = resolvedUrlCache[item.fileID];
          }
        });
        resolve(resolvedFields);
      },
      fail: () => resolve(resolvedFields)
    });
  });
}

function applyCloudAssets(page, fieldAssetMap) {
  page.__restoredCloudAssetFields = {};
  return resolveCloudAssetFields(fieldAssetMap).then((fields) => {
    if (Object.keys(fields).length) {
      page.setData(fields);
    }
    return fields;
  });
}

function restoreLocalAsset(page, event, localAssets) {
  const field = event && event.currentTarget && event.currentTarget.dataset.cloudField;
  if (!field || !localAssets[field]) return;

  page.__restoredCloudAssetFields = page.__restoredCloudAssetFields || {};
  if (page.__restoredCloudAssetFields[field]) return;

  page.__restoredCloudAssetFields[field] = true;
  page.setData({ [field]: localAssets[field] });
}

module.exports = {
  CLOUD_ASSET_FILE_IDS,
  CLOUD_FILE_PREFIX,
  applyCloudAssets,
  resolveCloudAssetFields,
  restoreLocalAsset
};
