// Footer
const footer = `> Powered by [PReview](https://github.com/Angelmmiguel/PReview)`;

// Messages!
const nonAuthorized = user => {
  return `😞 Sorry ${user}, you aren't authorized to deploy a PR. Only collaborators are allowed to do it.
${footer}
`
}

// Created deployment
const createdDeployment = deployment => {
  let url = `https://${deployment.host}`;
  return `🚀 Your deployment was successfully created. You can access it on [${deployment.host}](${url}). Also, you can see the deployed [source code](${url}/_src) and the [logs](${url}/_logs).

**To delete the deployment**, just delete this comment:

  \`\`\`
  ┌──────────────────────────────┐
  │                           X  │
  ├───────────────────────────▲──┤
  │                           │  │
  │                ┌────────┐ │  │
  │                │ Delete ├─┘  │
  │                └────────┘    │
  └──────────────────────────────┘
  \`\`\`

${footer}
`
}

const deletedDeployment = deployment => {
  return `❎ Your deployment was sucessfully deleted. To create a new deployment just post a new comment below with the following content:

  \`\`\`
  deploy()
  \`\`\`

${footer}
`
}

const failedDeleteDeployment = deployment => {
  return `❌ There was an error deleting your deployment. Please, check the logs.

${footer}
`
}

module.exports = {
  nonAuthorized,
  createdDeployment,
  deletedDeployment,
  failedDeleteDeployment
}
