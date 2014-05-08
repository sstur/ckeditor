#!/usr/bin/env node

var fs = require('fs');

var list = fs.readFileSync('./filelist.txt', 'utf8');
list = list.split(/\r\n|\r|\n/g);

list.forEach(function(file) {
  if (!file) return;
  //console.log('loading', file);
  var source = fs.readFileSync(file);
  if (source.slice(0, 3).toString('hex') === 'efbbbf') {
    source = source.slice(3).toString('utf8');
  } else
  if (source.slice(0, 2).toString('hex') === 'fffe') {
    source = source.slice(2).toString('utf16le');
  } else {
    source = source.toString('utf8');
  }
  var lines = source.split(/\r\n|\r|\n/g);
  while (lines[lines.length - 1] === '') lines.pop();
  lines.unshift('/*![' + file + ']~*/');
  lines.push('/*~[' + file + ']!*/');
  fs.writeFileSync(file, lines.join('\n') + '\n');
});
