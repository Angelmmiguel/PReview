/* Github Request headers for axios */
const GITHUB_API_TOKEN = process.env.GITHUB_API_TOKEN,
  GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'PReviewBot';

module.exports = {
  'headers': {
    'User-Agent': GITHUB_USERNAME,
    'Authorization': `token ${GITHUB_API_TOKEN}`
  }
}
