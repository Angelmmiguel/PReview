const download = require('download'),
  fs = require('fs'),
  path = require('path');

// Download the repo!
const downloadRepo = (repo, ref) => {
  let url = `https://api.github.com/repos/${repo}/tarball/${ref}`,
    dstPath = '/tmp/repo';

  try {
    return download(url, dstPath, {
      extract: true
    }).then(() => {
      console.log('Finish download')
      return `${dstPath}/` +
        fs.readdirSync(dstPath)
          .filter(file => fs.lstatSync(path.join(dstPath, file)).isDirectory())[0];
    });
  } catch (err) {
    console.log(`Error: ${err}`);
    return Promise.resolve(false);
  }
}

module.exports = downloadRepo;
