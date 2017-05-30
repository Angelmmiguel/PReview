// Get a deployment based on the host
const getDeployment = (now, host) => {
  return now.getDeployments().then(deployments => {
    return deployments.filter(d => d.url.indexOf(host) > -1)[0];
  });
}

module.exports = getDeployment;
