// Imports
const validateRequest = require('./github/validateRequest'),
  validateCollaborators = require('./github/validateCollaborators'),
  postComment = require('./github/postComment'),
  getPullRequestData = require('./github/getPullRequestData'),
  utils = require('./utils/'),
  messages = require('./utils/messages'),
  { getRepoFiles } = require('./now/getRepoFiles'),
  downloadRepo = require('./now/downloadRepo'),
  getDeployment = require('./now/getDeployment'),
  nowClient = require('now-client');

// Now instance
const now = nowClient(process.env.NOW_TOKEN);

// Constants
const DEPLOY_REGEX = /^deploy\(\)/,
  REMOVE_DEPLOY_REGEX = /\[([\w\-]*){1}\.now\.sh\]\(https:\/\//

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
    console.log("The event doesn't require any action. Ignoring it.")
    return callback(null,
      utils.buildResponse(200, { message: "The event doesn't require any action. Ignoring it." }));
  }

  // Test the body comment
  if (body.action === 'created' && utils.commentMatch(body, DEPLOY_REGEX)) {
    let issueTitle = body.issue.title,
      issueNumber = body.issue.number,
      userId = body.comment.user.id,
      user = body.comment.user.login;

    // Check if the user is a collaborator
    validateCollaborators(user).then((userIsCollaborator) => {
      if (!userIsCollaborator) {
        console.log(`${user} not authorized to deploy`);
        return postComment(issueNumber, messages.notAuthorized(user)).then(() => {
          return callback(new Error(`[401] ${user} not authorized to deploy. They must be a Collaborator`));
        });
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
          console.log('Deploy it using now');
          // Deploy it using now!
          downloadRepo(item.repo, item.branchName).then(path => {
            getRepoFiles(path).then(files => {
              now.createDeployment(files, (err, deployment) => {
                return postComment(issueNumber, messages.createdDeployment(deployment)).then(() => {
                  return callback(null, utils.buildResponse(200, { message: 'Deployment was successfully created' }));
                });
              });
            });
          });
        });
      }
    }).catch((e) => {
      return callback(e)
    });
  } else if (body.action === 'deleted' && utils.commentMatch(body, REMOVE_DEPLOY_REGEX)) {
    let issueTitle = body.issue.title,
      issueNumber = body.issue.number,
      userId = body.comment.user.id,
      user = body.comment.user.login;

    // Remove the deployment
    let host = body.comment.body.match(REMOVE_DEPLOY_REGEX)[1];

    validateCollaborators(user).then((userIsCollaborator) => {
      if (!userIsCollaborator) {
        console.log(`${user} not authorized to deploy`);
        return postComment(issueNumber, messages.notAuthorized(user)).then(() => {
          return callback(new Error(`[401] ${user} not authorized to deploy. They must be a Collaborator`));
        });
      } else {
        getDeployment(now, host).then(deployment => {
          now.deleteDeployment(deployment.uid).then(result => {
            if (result.state === 'DELETED') {
              return postComment(issueNumber, messages.deletedDeployment()).then(() => {
                return callback(null, utils.buildResponse(200, { message: 'Deployment was successfully deleted' }));
              });
            } else {
              return postComment(issueNumber, messages.failedDeleteDeployment()).then(() => {
                return callback(
                  null,
                  utils.buildResponse(new Error(`[500] There was an error deleting the deployment: ${result}`))
                );
              });
            }
          });
        });
      }
    });
  } else {
    console.log('No action required. Ignoring it');
    return callback(null, utils.buildResponse(200, { message: 'No action requested. Ignoring it' }));
  }
}

// Export the method to the main file
module.exports = deployProject;
