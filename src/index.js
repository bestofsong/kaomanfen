#! /usr/bin/env node

let variable = 'let';
const constant = 'const';
const objtmp = { foo:'bar' };
const obj = { ...objtmp, 'let':'go' };

console.log(`
let: ${variable},
const: ${constant},
obj: ${JSON.stringify(obj)},
keys: ${Object.keys(obj).reduce((res, k) => res+k+',', '')}
`);

