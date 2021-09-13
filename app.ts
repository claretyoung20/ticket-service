import express from 'express';
import * as http from 'http';
import dotenv from 'dotenv';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors';
import { UsersRoutes } from './src/users/users.routes.config';
import debug from 'debug';
import { CommonRoutesConfig } from './src/common/common.routes.config';
import { AuthRoutes } from './src/auth/auth.routes.config';
import helmet from 'helmet';
import { TicketsRoutes } from './src/tickets/tickets.routes.config';

const app: express.Application = express();

const dotenvResult = dotenv.config();
if (dotenvResult.error) {
    throw dotenvResult.error;
}
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3003;
const url = `${process.env.URL}:${port}`
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

app.use(helmet());

// here we are adding middleware to parse all incoming requests as JSON 
app.use(express.json());

// here we are adding middleware to allow cross-origin requests
app.use(cors());

// here we are preparing the expressWinston logging middleware configuration,
// which will automatically log all HTTP requests handled by Express.js
const loggerOptions: expressWinston.LoggerOptions = {
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.json(),
        winston.format.prettyPrint(),
        winston.format.colorize({ all: true })
    ),
};

if (!process.env.DEBUG) {
    loggerOptions.meta = false; // when not debugging, make terse
    if (typeof global.it === 'function') {
        loggerOptions.level = 'http';
    }
}

// initialize the logger with the above configuration
app.use(expressWinston.logger(loggerOptions));

routes.push(new AuthRoutes(app)); 

// here we are adding the UserRoutes to our array,
// after sending the Express.js application object to have the routes added to our app!
routes.push(new UsersRoutes(app));

routes.push(new TicketsRoutes(app)); 

// this is a simple route to make sure everything is working properly
const runningMessage = `Server running at ${url}`;
app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage)
});


server.listen(port, () => {
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
    // our only exception to avoiding console.log(), because we
    // always want to know when the server is done starting up
    console.log(runningMessage);
});