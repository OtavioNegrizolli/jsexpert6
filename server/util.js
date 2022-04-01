import pino from 'pino';

const log = pino({
    enabled: !(!!process.env.LOG_DIABLED),
    level: (!!process.env.LOG_DIABLED? 'silent': 'info'),
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});

const logger = log
export default logger
