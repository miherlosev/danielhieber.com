const co = require('co');
const fs = require('fs');
const less = require('less');
const path = require('path');

// converts a string of LESS data to CSS
const convertLess = lessData => new Promise((resolve, reject) => {
  less.render(lessData).then(output => resolve(output.css)).catch(reject);
});

// read the LESS data from the file
const readFile = filename => new Promise((resolve, reject) => {
  const filepath = path.join(__dirname, `../less/${filename}`);
  fs.readFile(filepath, 'utf8', (err, res) => {
    if (err) reject(err);
    resolve(res);
  });
});

// saves a string of CSS data to /public/css/{filename}.css
const saveCss = (cssFilename, cssData) => new Promise((resolve, reject) => {
  const filepath = path.join(__dirname, `../public/css/${cssFilename}`);
  fs.writeFile(filepath, cssData, 'utf8', err => {
    if (err) reject(err);
    resolve();
  });
});

// completely converts a single file and saves the new .css file to /public/css
const convertFile = filename => new Promise((resolve, reject) => {

  const generator = co.wrap(function* convert(filename) {
    const lessData = yield readFile(filename);
    const cssFilename = filename.replace('.less', '.css');
    const cssData = yield convertLess(lessData);
    yield saveCss(cssFilename, cssData);
  });

  generator(filename)
  .then(resolve)
  .catch(reject);

});

// read the list of files in the LESS directory
fs.readdir('./less', 'utf8', (err, filenames) => {

  if (err) {
    console.error(err, err.stack);
    throw new Error('Unable to read LESS directory.');
  }

  // convert each of the files
  Promise.all(filenames.map(convertFile))
  .then(() => console.log('All LESS files converted successfully.'))
  .catch(err => {
    console.error(err, err.stack);
    throw new Error('There was an error converting the LESS files.');
  });

});
