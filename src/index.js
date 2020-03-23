import * as uuid from 'uuid';
import * as joi from 'joi';
import { createServer } from 'http';
import { Server as WsServer } from 'ws';
import { createReadStream } from 'fs';
import { join } from 'path';
import { logger } from './lib/logger';
import configs from './configs';
import { validate } from './lib/validate';

const resolveRequirements = path =>
  path === '/'
    ? createReadStream(join(__dirname, '../static/index.html'))
    : path === 'main.css'
    ? createReadStream(join(__dirname, '../static/main.css'))
    : createReadStream(join(__dirname, '../static/main.js'));

const server = createServer(({ url }, res) =>
  resolveRequirements(url).pipe(res),
);

const schema = joi.object({
  x: joi.number().required(),
  y: joi.number().required(),
});

const wss = new WsServer({ server });

wss.on('connection', ws => {
  ws.id = uuid.v4();

  const wrapper = cb => {
    return data => {
      try {
        cb(JSON.parse(data), data);
      } catch (error) {
        ws.close();
      }
    };
  };

  ws.on(
    'message',
    wrapper(async (msg, data) => {
      await validate(msg, schema);

      logger.info(`Msg received from: ${ws.id}`);
      wss.clients.forEach(c => c.send(data));
    }),
  );

  ws.on('close', () => logger.info(`Conn closed: ${ws.id}`));
});

server.listen(configs.port, () =>
  logger.info(`Conns are accepted on ${configs.port}`),
);

const logErr = e => logger.error(e);

process.on('uncaughtException', logErr).on('unhandledRejection', logErr);
