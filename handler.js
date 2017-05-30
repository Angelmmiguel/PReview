const deployProject = require('./lib/deployProject');

/* Function that listens for github webhook events */
module.exports.deployProject = deployProject;
