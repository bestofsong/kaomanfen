#! /usr/bin/env node
const question = require('./question');
const audio = require('./audio');

// const visitor = (error, row) => console.log(row);
// question.traverse('resources/toeflapp.sqlite', { visitor });

audio.download({ questionId:1, saveTo:'./downloaded.zip' })
.then(() => console.log('did download'))
.catch(err => console.error('failed to download: ', err));

// User-Agent: toeflListen/20170516.3 CFNetwork/711.1.16 Darwin/14.0.0
// Accept-Encoding: gzip, deflate

