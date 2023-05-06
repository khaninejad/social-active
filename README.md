[![cov](https://khaninejad.github.io/social-active/badges/coverage.svg)](https://github.com/khaninejad/social-active/actions)
# Social-Active

Social-Active is a backend package for a social media application built using the NestJS framework. It includes various functionalities such as feed extraction, scheduling, and API integrations with Twitter, WordPress and OpenAI GPT-3.
Please note that this package is not production-ready and is still in development.

## Installation

Before installing this package, make sure you have Node.js and npm installed on your system.

1. Clone this repository or download the source code.
2. Open a terminal and navigate to the root directory of the package.
3. Run the command `npm install` to install all the dependencies.


### MongoDB Container

The Social-Active package requires a running instance of MongoDB to store data. To start a MongoDB container, run the following command:

```
docker-compose up -d
```

This will start a MongoDB container in the background. You can stop the container by running the following command:

```
docker-compose down
```

### Environment Variables

The package requires several environment variables to be set before it can be used. You can set these environment variables in a .env file in the root directory of the package. Here are the required environment variables:

```
PORT=3000
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
TWITTER_CLIENT_CALLBACK=
LOGIN_URL=
MONGODB_CONNECTION_STRING=mongodb://mongoadmin:secret@localhost:27017/social-active?authSource=admin
WORDPRESS_ENDPOINT=
WORDPRESS_USERNAME=
WORDPRESS_PASSWORD=
OPENAI_API_KEY=
OPENAI_MAX_TOKEN=
```

You will need to update these environment variables with your own values before using the package.

## Usage

Social-Active provides various scripts that can be executed using the npm command. Here are some of the most common scripts:

- `npm run build`: Compiles the TypeScript code into JavaScript.
- `npm run format`: Formats the code using Prettier.
- `npm start`: Starts the application in production mode.
- `npm run start:dev`: Starts the application in development mode with live-reload.
- `npm run start:debug`: Starts the application in debug mode with live-reload.
- `npm run lint`: Lints the code using ESLint.
- `npm run fix`: Fixes the linting errors automatically.
- `npm test`: Runs the tests using Jest.
- `npm run test:watch`: Runs the tests in watch mode.
- `npm run test:cov`: Runs the tests and generates a coverage report.
- `npm run test:e2e`: Runs the end-to-end tests using Jest.

## Dependencies

Here is a list of the main dependencies used in this package:

- [@nestjs/common](https://www.npmjs.com/package/@nestjs/common): A collection of utilities and classes used across the NestJS framework.
- [@nestjs/config](https://www.npmjs.com/package/@nestjs/config): A module that provides a clean and easy way to load configuration files.
- [@nestjs/core](https://www.npmjs.com/package/@nestjs/core): The core module of the NestJS framework.
- [@nestjs/event-emitter](https://www.npmjs.com/package/@nestjs/event-emitter): A module that provides an event emitter for the NestJS framework.
- [@nestjs/mongoose](https://www.npmjs.com/package/@nestjs/mongoose): A module that integrates the Mongoose library with the NestJS framework.
- [@nestjs/platform-express](https://www.npmjs.com/package/@nestjs/platform-express): A module that provides the ExpressJS adapter for the NestJS framework.
- [@nestjs/schedule](https://www.npmjs.com/package/@nestjs/schedule): A module that provides a clean and easy way to schedule tasks in the NestJS framework.
- [@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger): A module that provides automatic generation of OpenAPI (Swagger) documentation for the NestJS framework.
- [axios](https://www.npmjs.com/package/axios): A promise-based HTTP client for Node.js.
- [cheerio](https://www.npmjs.com/package/cheerio): A jQuery-like tool for parsing and manipulating HTML.
- [dotenv](https://www.npmjs.com/package/dotenv): A module that loads environment variables from a .env file.
- [mongoose](https://www.npmjs.com/package/mongoose): A MongoDB object modeling tool designed to work in an asynchronous environment.
- [openai](https://www.npmjs.com/package/openai): A module that provides an interface for the OpenAI GPT-3 API.
- [rxjs](https://www.npmjs.com/package/rxjs): A library for reactive programming using Observables.
- [twitter-api-sdk](https://www.npmjs.com/package/twitter): Twitter official api