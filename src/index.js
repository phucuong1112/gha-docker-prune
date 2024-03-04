const { getInput } = require('@actions/core');
const DockerApi =  require('./docker-api.js');

function testVersion(s, arrRegExp, caseSensitive = true) {
  for (const exp of arrRegExp) {
    let regexp = new RegExp(exp, caseSensitive ? undefined : 'i');
    if (regexp.test(s)) 
      return true;
  }
  return false;
}

(async () => {
  const dockerUsername = getInput("docker_username");
  const dockerToken = getInput("docker_token");
  const dockerApiUrl = getInput("docker_api_url");
  const dockerNamespace = getInput("docker_namespace");
  const dockerRepository = getInput("docker_repository");
  const keep = parseInt(getInput("keep"));

  const regexps = getInput("include_tags").split(/\r\n|\r|\n/g);

  const dockerApi = new DockerApi({
    url: dockerApiUrl,
    username: dockerUsername,
    password: dockerToken
  });
  const tags = await dockerApi.listAllTags(dockerNamespace, dockerRepository);
  let sortedTags = tags
    .filter( t => testVersion(t.name, regexps, false))
    .sort( (a, b) => a.last_updated < b.last_updated);

  console.log('* List tags:')
  sortedTags.forEach(x => console.log(`- ${x.name} - ${x.last_updated}`))

  let removeTags = keep > sortedTags.length ? [] : sortedTags.slice(keep);
  
  console.log('* Remove tags:')
  for (const tag of removeTags) {
    console.log(`- Removing tag ${tag.name}`);
    await dockerApi.deleteTag(dockerNamespace, dockerRepository, tag.name);
  }
})();