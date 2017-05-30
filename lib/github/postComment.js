const axios = require('axios'),
  config = require('./axiosConfig'),
  GITHUB_REPO = process.env.GITHUB_REPO;

const postComment = (number, message) => {
  /* /repos/:owner/:repo/issues/:number/comments */
  const commentAPI = `https://api.github.com/repos/${GITHUB_REPO}/issues/${number}/comments`;
  return axios.post(commentAPI, {
    "body": message,
  }, config).then(function(response) {
    return response;
  });
}

// Exports
module.exports = postComment;
