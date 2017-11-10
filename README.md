# ripple.fm Core API ![badge](https://travis-ci.org/ripplefm/api.svg?branch=master)

### Prerequisites

The following steps are required for development and to run tests:

1. Make sure you have the following software installed:
   * docker
   * docker-compose

1. After prerequisites are installed, take a look at the variables and their descriptions in
[.env.example](/.env.example). If you wish to override these variables copy [.env.example](/.env.example) to a new file `.env`
and set your desired values in the new file.

1. Load your environment variables:

   ```bash
    source .env.example
   ```
   or
   ```bash
    source .env
   ```

### Running for development

After prerequisites, run:
```bash
  docker-compose up
```
When first ran, service images will be pulled from docker hub and the api image will be built.
Once ready, the api will start and be accessible via `http://localhost:3000`

### Running tests

After prerequisites, run:
```
  docker-compose run api npm run test
```
