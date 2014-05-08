#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var fileName = path.join('.', process.argv[2]);
var outPath = path.join('.', path.dirname(fileName));

var source = fs.readFileSync(fileName, 'utf8');

//just in case we have crlf style newlines
source = source.split('\r\n').join('\n');

//make sure all tags are preceded by a newline
source = source.replace(/([^\n])(\/\*\!\[)/g, '$1\n$2');

var REG_OPEN = /(?:\/\*!\[([^\]]+)\]~\*\/)/g;

var tags = [];
var paths = [];

source.replace(REG_OPEN, function(startTag, path, startTagPos) {
  paths.push(path);
  var endTag = '/*~[' + path + ']!*/';
  var endTagPos = source.indexOf(endTag, startTagPos);
  tags.push({
    path: path,
    startPos: startTagPos,
    endPos: endTagPos
  });
});

var newSource = [];
var lastEnd = 0;
tags.forEach(function(tag, i) {
  var before = source.slice(lastEnd, tag.startPos);
  newSource.push(before);
  newSource.push('/*![' + tag.path + ']!*/');
  var tagLength = tag.path.length + 8;
  var fragmentSource = source.slice(tag.startPos + tagLength, tag.endPos);
  fragmentSource = fragmentSource.replace(/^\n|\n$/g, '');
  fs.writeFileSync('./' + tag.path.replace(/^.\//, '').replace(/\//g, '__'), fragmentSource);
  lastEnd = tag.endPos + tagLength;
  if (i === tags.length - 1) {
    newSource.push(source.slice(lastEnd));
  }
});

newSource = newSource.join('');
fs.writeFileSync('./_ckeditor.js', newSource);
