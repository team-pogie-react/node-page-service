### Getting started
1. Install dependencies.
```bash 
npm install
```

2. Set the environment variables in the env.
```bash 
cp .env.example .env
```

3. Run the tests.
```bash 
npm run test:all
```

4. Run locally.
```bash
npm run dev
```

5. Visit `http://localhost:{PORT}/ping` to verify if it's working.


### Production Build
1. Build the `"src"` directory.
```bash 
npm run build
```

2. If you want to run the server on a different port modify the `PORT` env (default is `3000`).
```bash
export PORT=8080
```

3. Run the server.
```bash 
npm run serve
```


### App Structure
- `src/server.js` - The main entry point of the application.
- `src/configs/` - Contains application configurations.
- `src/controllers/` - The handlers for the routes.
- `src/core/` - Contains application classes and libraries.
- `src/errors/` - Custom error classes.
- `src/middlewares/` - Express route middlewares.
- `src/routes/` - The registered api routes are in this folder.
- `src/services/` - This folder contains the service files which the application uses to connect unit files to a single related service.
- `src/transformers/` - API response processors.
- `tests/` - The test files.
- `dist/` - Ignored directory that will contain the production build.


### Stacks Used
- [expressjs](https://github.com/expressjs/express) - Handles http requests.
- [got](https://github.com/sindresorhus/got) - A small HTTP client library.
- [winston](https://github.com/winstonjs/winston) - Logging library.
- [validatorjs](https://github.com/skaterdav85/validatorjs) - A laravel inspired validation library.
- [lodash](https://github.com/lodash/lodash) - Utility library.
- [babel](https://github.com/babel/babel) - Javascript compiler for ES6.
- [eslint](https://github.com/eslint/eslint) - Javascript linting library.
- [mocha](https://github.com/mochajs/mocha) - Test framework.
- [chai](https://github.com/chaijs/chai) - Test assertion library.


### Docker
```bash
docker-compose up -d
```
