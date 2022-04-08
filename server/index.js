import server from  './server.js'
import logger from './util.js'

import config from './config.js'

server.listen(config.port).on('listening',
    () => logger.info(`Up and running at port ${config.port}!`)
);
// process.on('SIGINT', async () => logger.info(`server start to shutdown on ${Date.now()}`));
// prevent process broke on error
process.on('uncaughtException', (error) => logger.error(`unhadled exception happend ${ error.stack || error }`))
process.on('unhandledRejection', (error) => logger.error(`unhadled rejection happend ${ error.stack || error }`))
