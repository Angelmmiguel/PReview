const axios = require('axios'),
  config = require('./axiosConfig'),
  GITHUB_REPO = process.env.GITHUB_REPO;

const getPullRequestData = number => {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/pulls/${number}`
  return axios.get(url, config).then(function(response) {
    return response.data;
  });
}

// Exports
module.exports = getPullRequestData;
