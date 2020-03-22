import { createServer } from 'http';
import { Server as WsServer } from 'ws';
import { createReadStream } from 'fs';
import { join } from 'path';
import { logger } from './lib/logger';
import configs from './configs';

const resolveRequirements = path =>
  path === '/'
    ? createReadStream(join(__dirname, '../static/index.html'))
    : path === 'main.css'
    ? createReadStream(join(__dirname, '../static/main.css'))
    : createReadStream(join(__dirname, '../static/main.js'));

const server = createServer(({ url }, res) =>
  resolveRequirements(url).pipe(res),
);

const wss = new WsServer({ server });

wss.on('connection', ws => {
  ws.on('message', data => {
    logger.info(`Msg received`, JSON.parse(data));
    wss.clients.forEach(c => c.send(data));
  });
});

server.listen(configs.port, () =>
  logger.info(`Listening on some port <v pizdu>`),
);
