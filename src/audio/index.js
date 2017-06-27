const fetch = require('node-fetch');
const fs = require('fs');
const unzip = require('unzip');
const sqlite3 = require('sqlite3').verbose();


const REQ_OPT = {
  'user-agent': 'toeflListen/20170516.3 CFNetwork/711.1.16 Darwin/14.0.0',
};

const URL_LISTEN_AUDIO_ZIP = 'http://img.enhance.cn/toefl/zip/listenaudiozip/{questionId}.zip'

function download({ questionId, saveTo }) {
  const url = URL_LISTEN_AUDIO_ZIP.replace(/\{questionId}/, `${questionId}`);
  console.log('downloading audio zip: ', url);
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

function extractSqlite(path) {
  return new Promise((resolve, reject) => {
    const dbpath = `${path}.sqlite`;
    let found = false;

    fs.createReadStream(path)
    .pipe(unzip.Parse())

    .on('error', (err) => {
      console.error('unzip failed');
      reject(err);
    })

    .on('end', () => {
      if (!found) {
        reject(`sqlite file not found in zip file: ${path}`);
      }
    })

    .on('entry', (entry) => {
      const fileName = entry.path;
      if (!fileName || !fileName.match(/\.sqlite$/)) {
        entry.autodrain();
      } else {
        found = true;
        entry.pipe(fs.createWriteStream(dbpath))
        .on('error', (err) => {
          reject(err);
        })
        .on('finish', () => {
          resolve(dbpath);
        });
      }
    });
  });
}

function fixedStr(input) {
  if (!input) {
    return input;
  }
  if (typeof input !== 'string') {
    return input;
  }
  return input.replace(/^\s+/, '').replace(/\s+$/, '');
}

function getLyric(path) {
  return extractSqlite(path)
  .then((dbpath) => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbpath, sqlite3.OPEN_READONLY);
      const ret = [];
      db.each(
        "SELECT content,content_zh,start_time,audio_time FROM lyric",
        (error, row) => {
          if (row && (fixedStr(row.content) || fixedStr(row.content_zh))) {
            ret.push(row);
          }
        },
        () => {
          db.close((error) => {
            if (error) {
              reject(error);
            } else {
              fs.unlinkSync(dbpath);
              resolve(ret);
            }
          });
        }
      );
    });
  })
  .catch(error => console.error('faield to getLyric, error: ', error));
}

module.exports = { download, getLyric };
