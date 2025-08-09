import { execSync } from 'child_process';

/**
 * @typedef {object} GitResult
 * @property {string} time - The commit date and time (YYYY-MM-DD HH:MM:SS).
 * @property {string} shortHash - The short commit hash.
 * @property {string} fullHash - The full commit hash.
 * @property {string} message - The commit message.
 */

/**
 * Gets information about the latest git commit.
 * @returns {GitResult}
 */
export const getLatestCommitInfo = () => {
  const separator = '___';
  const command = `git log -1 --pretty=format:"%ad${separator}%h${separator}%H${separator}%s" --date=format:'%Y-%m-%d %H:%M:%S'`;
  const output = execSync(command).toString().trim().split(separator);

  if (output.length !== 4) {
    throw new Error('Could not parse the latest Git commit output.');
  }

  const result = {
    time: output[0],
    shortHash: output[1],
    fullHash: output[2],
    message: output[3],
  };

  return result;
};

/**
 * Gets information about the latest git commit as a single string.
 * @returns {string}
 */
export const getLatestCommitInfoAsString = () => {
  const commitInfo = getLatestCommitInfo();

  const commitInfoString = Object.entries(commitInfo)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');

  return commitInfoString;
};
