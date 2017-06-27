const fetch = require('node-fetch');
const fs = require('fs');

const REQ_OPT = {
  'user-agent': 'toeflListen/20170516.3 CFNetwork/711.1.16 Darwin/14.0.0',
};

const URL_LISTEN_AUDIO_ZIP = 'http://img.enhance.cn/toefl/zip/listenaudiozip/{questionId}.zip'

function download({ questionId, saveTo }) {
  const url = URL_LISTEN_AUDIO_ZIP.replace(/\{questionId}/, `${questionId}`);
  return fetch(url, { ...REQ_OPT })
  .then((res) => {
    return new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(saveTo);
      dest.on('finish', () => {
        resolve();
      });
      dest.on('error', (err) => {
        reject(err);
      });
      res.body.pipe(dest);
    });
  });
}

module.exports = { download };
