/**
 * This file contains several util functions
 */

// Generate a response for the callback
const buildResponse = (code, body) => {
  return {
    statusCode: code,
    body: JSON.stringify(body)
  };
}

// Based on the given response, check if this body comment match
const commentMatch = (body, regex) => body.comment && body.comment.body && body.comment.body.match(regex);

module.exports = {
  buildResponse,
  commentMatch
}
