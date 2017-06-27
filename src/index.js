#! /usr/bin/env node
const question = require('./question');

const visitor = (error, row) => console.log(row);
question.traverse('resources/toeflapp.sqlite', { visitor });
