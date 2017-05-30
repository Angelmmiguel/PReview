const axios = require('axios'),
  GITHUB_REPO = process.env.GITHUB_REPO,
  config = require('./axiosConfig');

/* check if user is collaborator in github project */
const validateCollaborators = user => {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/collaborators/${user}`;

  // Set axios to not reject 400 responses
  config.validateStatus = function (status) {
    return status >= 200 && status < 500;
  }

  return axios.get(url, config).then(response => {
    if (response && response.headers && response.headers.status === '204 No Content') {
      console.log(`${user} is a collaborator, allow for scheduling`)
      return Promise.resolve(true);
    }
    console.log(`${user} is not a repo a collaborator`);
    return Promise.resolve(false);
  }).catch((error) => {
    console.log(error)
    // Always return a promise
    return Promise.resolve(false);
  });
}

// Export
module.exports = validateCollaborators;
