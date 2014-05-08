#!/bin/bash
CKBUILDER_VERSION="1.7.2"

echo "Copying source files..."
rm -rf source
mkdir source
cp -R core source/
cp -R lang source/
cp -R plugins source/
cp -R skins source/
cp ckeditor.js source/
cp config.js source/
cp contents.css source/
cp styles.js source/

echo "Tagging source files..."
cd source
find . -name "*.js">filelist.txt
node ../file_indexer.js
cd ..

echo "Running CKBuilder..."
java -jar dev/builder/ckbuilder/$CKBUILDER_VERSION/ckbuilder.jar --build source release --version="4.4.0" --build-config build-config.js --overwrite --skip-omitted-in-build-config --leave-js-unminified --leave-css-unminified --no-zip --no-tar

echo "Reconstructing from build output..."
rm -rf reconstructed
mkdir reconstructed
cd reconstructed
node ../file_splitter.js ../release/ckeditor/ckeditor.js
cd ..
