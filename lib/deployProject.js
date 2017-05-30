// Imports
const validateRequest = require('./github/validateRequest'),
  validateCollaborators = require('./github/validateCollaborators'),
  postComment = require('./github/postComment'),
  getPullRequestData = require('./github/getPullRequestData'),
  utils = require('./utils/'),
  { getRepoFiles } = require('./now/getRepoFiles'),
  downloadRepo = require('./now/downloadRepo')
  nowClient = require('now-client');

// Now instance
const now = nowClient(process.env.NOW_TOKEN);

// Constants
const DEPLOY_REGEX = /deploy\(\)/;

/**
 * Create a new deploy. This method receives the hook from Github and instance a new deployment
 * using now.
 */
const deployProject = (event, context, callback) => {
  const body = JSON.parse(event.body);

  // Validate the Github Webhook request
  let isValidRequest = validateRequest(event);
  if (isValidRequest instanceof Error) {
    console.log(`Validation Error:`, isValidRequest);
    return callback(isValidRequest);
  }

  // Return early on Github 'ping' events for webhook test
  if (event.headers['X-GitHub-Event'] === 'ping') {
    return callback(null, utils.buildResponse(200, { pong: true }));
  }

  // We only want to interact with pull requests
  if (body.issue === undefined || body.issue.pull_request === undefined) {
    // Exiting early event not an issue or PR
    console.log('The event is not a PR');
    return callback(null, utils.buildResponse(200, { message: 'Event is not a PR' }));
  }

  // Test the body comment
  if (body.action === 'created' && body.comment && body.comment.body && body.comment.body.match(DEPLOY_REGEX)) {
    let issueTitle = body.issue.title,
      issueNumber = body.issue.number,
      userId = body.comment.user.id,
      user = body.comment.user.login;

    // Check if the user is a collaborator
    validateCollaborators(user).then((userIsCollaborator) => {
      if (!userIsCollaborator) {
        console.log('post not authed message');
        return postComment(issueNumber, utils.messages.notAuthorized(user)).then(() => {
          return callback(new Error('[401] ${userName} not authorized to schedule posts. They must be a Collaborator'))
        })
      } else {
        getPullRequestData(issueNumber).then((response) => {
          return {
            number: issueNumber,
            title: issueTitle,
            // sha: response.head.sha,
            branchName: response.head.ref,
            repo: response.head.repo.full_name,
            userName: user,
            userId: userId,
          }
        }).then((item) => {
          console.log('Deploy it using now ', item);
          // Deploy it using now!
          downloadRepo(item.repo, item.branchName).then(path => {
            getRepoFiles(path).then(files => {
              now.createDeployment(files, (err, deployment) => {
                return postComment(issueNumber, utils.messages.createdDeployment(deployment)).then(() => {
                  return callback(null, utils.buildResponse(200, { message: 'Deployment was successfully created' }));
                })
              });
            });
          });
        });
      }
    }).catch((e) => {
      return callback(e)
    });
  } else {
    console.log('No deploy requested');
    return callback(null, utils.buildResponse(200, { message: 'No deploy requested' }));
  }
}

// Export the method to the main file
module.exports = deployProject;
