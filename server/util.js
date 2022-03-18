import pino from 'pino';

const log = pino({
    enabled: (!!process.env.LOG_DIABLED),
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
});

export const logger = log
