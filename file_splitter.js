#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var source = fs.readFileSync('./ckeditor.js', 'utf8');

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
  var fragmentSource = source.slice(tag.startPos, tag.endPos + tagLength);
  fragmentSource = fragmentSource.replace(/^\n|\n$/g, '');
  mkdirp.sync(path.dirname(tag.path));
  fs.writeFileSync(tag.path, fragmentSource);
  lastEnd = tag.endPos + tagLength;
  if (i === tags.length - 1) {
    newSource.push(source.slice(lastEnd));
  }
});

newSource = newSource.join('');
fs.writeFileSync('./ckeditor.js', newSource);
