# gha-docker-prune

This action serves as a straightforward wrapper for the Docker Hub API, aimed at eliminating unnecessary versions.

## Inputs

| Parameter         | Required | Description                                               |
|:------------------|:---------|:----------------------------------------------------------|
| docker_username   | true     | docker's username                                         |
| docker_token      | true     | docker's token                                            |
| docker_api_url    | false    | docker api endpoint. (Default: https://hub.docker.com/v2) |
| docker_namespace  | false    | target namespace                                          |
| docker_repository | false    | target repository                                         |
| keep              | false    | Number of latest tags to retain.                          |
| include_tags      | false    | filter tags by regular expression                         |

## Example Usage

```yaml
- uses: phucuong1112/gha-docker-prune@v1.0.0
  with:
    docker_username: ${{ secrets.DOCKER_USER }}
    docker_token: ${{ secrets.DOCKER_TOKEN }}
    docker_namespace: "your-namespace"
    docker_repository: "your-repository"
    keep: "3"
    include_tags: |-
      ^v[0-9]+\.[0-9]+\.[0-9]+-rc\.[0-9]+$
      ^v[0-9]+\.[0-9]+\.[0-9]+$
```