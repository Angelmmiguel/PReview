/**
 * This file contains several util functions
 */

const footer = `> Powered by [PReview](https://github.com/Angelmmiguel/PReview)`;

// Generate a response for the callback
const buildResponse = (code, body) => {
  return {
    statusCode: code,
    body: JSON.stringify(body)
  };
}

// Messages!
const nonAuthorized = user => {
  return `Sorry ${user}, you aren't authorized to deploy a PR. Only collaborators are allowed to do it.
${footer}
`
}

// Created deployment
const createdDeployment = deployment => {
  return `Your deployment was created! Check it on [${deployment.host}](https://${deployment.host})
${footer}
`
}

module.exports = {
  buildResponse,
  messages: {
    nonAuthorized,
    createdDeployment
  }
}
