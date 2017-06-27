#! /usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const question = require('./question');
const audio = require('./audio');

// const path = './downloaded.zip';
// audio.download({ questionId:1982, saveTo:path })
// .then(() => console.log('did download'))
// .then(() => audio.getLyric(path))
// .then((lyrics) => {
//   console.log('lyrics: ', lyrics);
// })
// .catch(err => console.error('failed to download: ', err));

// audio.getLyric(path)
// .then((lyrics) => {
//   console.log(lyrics);
// })
// .catch((error) => {
//   console.error('failed to get lyrics, error: ', error);
// });

const outputDir = 'output';
const outputFile = `${outputDir}/output.sqlite`;
fs.stat(outputDir, (error, stats) => {
  if (stats.isDirectory()) {
    start(outputFile);
  } else {
    if (stats.isFile()) {
      fs.unlinkSync(outputDir);
    }
    fs.mkdir(outputDir, (error) => {
      if (error) {
        console.error('failed to create directory: ', outputDir);
      } else {
        start(outputFile);
      }
    });
  }
});

function lyricFilenameForQuestion(q) {
  return `${q.source}-${q.order_index}-${q.section}.json`.toLowerCase();
}

function start(dbpath) {
  const QUESTION_DB = 'resources/toeflapp.sqlite';
  const qs = [];
  // const db = new sqlite3.Database(dbpath);
  const questionFilter = (q) => {
    if (!q || typeof q.source !== 'string') {
      return false;
    }
    switch (q.source.toLowerCase()) {
      case 'tpo':
      case 'og':
        return true;
      default:
        return false;
    }
  };

  question.traverse(
    QUESTION_DB,
    {
      visitor: (error, q) => {
        if (questionFilter(q)) {
          if (!fs.existsSync(lyricFilenameForQuestion(q))) {
            qs.push(q);
          }
        }
        if (error) {
          console.error('error reading QUESTIO_DB: ', error);
        }
      },
      onEnd: () => {
        getAudioForQ(
          qs,
          0,
          (data, q) => {
            const ff = lyricFilenameForQuestion(q);
            try {
              const serialized = JSON.stringify(data);
              fs.writeFileSync(ff, JSON.stringify(data));
            } catch (e) {
              console.error('failed handling lyrics, error: ', data, e);
              if (fs.existsSync(ff)) {
                fs.unlinkSync(ff);
              }
            }
          },
          () => {
          }
        );
      },
    }
  );
}

const INTERVAL_MS = 5000;
function getAudioForQ(qs, fromIndex, onData, onEnd) {
  if (!qs) {
    console.error('error, invalid question array: ', qs);
    onEnd(false);
    return;
  }
  if (fromIndex >= qs.length) {
    console.log('done');
    onEnd(true);
    return;
  }
  const q = qs[fromIndex];
  if (!q || typeof q.id !== 'number') {
    console.error('error, invalid q: ', q);
    onEnd(false);
    return;
  }

  const path = `./${q.id}.zip`;
  audio.download({ questionId: q.id, saveTo: path })
    .then(() => audio.getLyric(path))
    .then((lyrics) => {
      onData(lyrics, q);
      setTimeout(() => {
        getAudioForQ(qs, fromIndex + 1, onData, onEnd);
      }, INTERVAL_MS);
    })
    .catch((err) => {
      console.error('failed to download: ', err);
      onEnd(false);
    });
}
