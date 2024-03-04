const axios = require('axios');

const DOCKER_BASE_URL = "https://hub.docker.com/v2"

/**
 * DockerApi class for interacting with the Docker API.
 *
 * @class
 * @name DockerApi
 */
class DockerApi {

  /**
   * 
   * @constructor
   * @param {Object} [opt={}] - Optional parameters.
   * @param {string} [opt.url] - The base URL for the Docker API. Defaults to "https://hub.docker.com/v2".
   * @param {string} [opt.username] - The username for authentication.
   * @param {string} [opt.password] - The password for authentication.
   */
  constructor(opt = {}) {

    this.baseUrl = opt.url || DOCKER_BASE_URL;
    this.username = opt.username;
    this.password = opt.password;

    // Init axios instance
    this.axios = axios.create({
      baseURL: this.baseUrl,
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Inject JWT token
    this.axios.interceptors.request.use(
      async (config) => {
        const accessToken = await this.getToken();
        config.headers['Authorization'] = `Bearer ${accessToken}`;
        return config;
      },
      (err) => {
        return Promise.reject(err);
      },
    );
  }

  /**
   * Retrieves the authentication token.
   * If the token is not already stored in the instance, it calls the login method to obtain the token.
   * 
   * @returns {string} The authentication token.
   */
  async getToken() {
    if (!this.token) {
      this.token = await this.login();
    }
    return this.token;
  }

  /**
   * Logs in the user and retrieves the authentication token.
   * 
   * @returns {string} The authentication token.
   */
  async login() {
    const res = await axios.post(
      `${this.baseUrl}/users/login`, 
      {
        username: this.username,
        password: this.password
      }, {
        "Content-Type": "application/json", 
      }
    );

    this.token = res.data.token;
    return this.token;
  }

  /**
   * Retrieves a list of tags for a given namespace and repository.
   * 
   * @param {string} namespaceName - The name of the namespace.
   * @param {string} repositoryName - The name of the repository.
   * @param {Object} [options={}] - Optional parameters.
   * @param {number} [options.page=1] - The page number of the results. Defaults to 1.
   * @param {number} [options.pageSize=10] - The number of tags per page. Defaults to 10.
   * @returns {Promise<Object>} A promise that resolves to the list of tags.
   */
  async listTags(namespaceName, repositoryName, { page = 1, pageSize = 10 }) {
    const res = await this.axios.get(`${this.baseUrl}/namespaces/${namespaceName}/repositories/${repositoryName}/tags`, {
      params: {
        page: page,
        page_size: pageSize
      }
    })
    return res.data;
  }

  /**
   * Retrieves all tags for a given namespace and repository.
   * 
   * @param {string} namespaceName - The name of the namespace.
   * @param {string} repositoryName - The name of the repository.
   * @returns {Promise<Array>} A promise that resolves to an array of tags.
   */
  async listAllTags(namespaceName, repositoryName) {
    const tags = [];
    const page = 1;
    const pageSize = 100;
    let url = `${this.baseUrl}/namespaces/${namespaceName}/repositories/${repositoryName}/tags?page=${page}&page_size=${pageSize}`;
    while (url) {
      // const res = await this.callGet(url);
      const res = await this.axios.get(url);
      if (res && res.data && res.data.results) {
        tags.push(...res.data.results);
      }
      url = res.next;
    }

    return tags;
  }

  /**
   * Deletes a tag from a given namespace and repository.
   * 
   * @param {string} namespaceName - The name of the namespace.
   * @param {string} repositoryName - The name of the repository.
   * @param {string} tagName - The name of the tag to delete.
   * @returns {Promise} A promise that resolves when the tag is successfully deleted.
   */
  async deleteTag(namespaceName, repositoryName, tagName) {
    return this.axios.delete(`${this.baseUrl}/repositories/${namespaceName}/${repositoryName}/tags/${tagName}`);
  }

}

module.exports = DockerApi;
