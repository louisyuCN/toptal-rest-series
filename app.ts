import express from 'express';
import * as http from 'http';
import * as bodyparser from 'body-parser';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import cors from 'cors'
import {CommonRoutesConfig} from './common/common.routes.config';
import {UsersRoutes} from './users/users.routes.config';
import debug from 'debug';

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const env: string = String(process.env.NODE_ENV);

const configPath = `./config/${env}`;
let config = null;
try {
    config = require(configPath).default;
} catch (e) {
    console.error('Cannot load config: [%s] %s', env, configPath);
    throw e;
}

const port = Number(config.port);
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

app.use(bodyparser.json());
app.use(cors());

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));

routes.push(new UsersRoutes(app));

app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));


app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(`Server running at http://localhost:${port}`)
});
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
});