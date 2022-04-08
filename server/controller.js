import { Service } from "./service.js";
import logger from "./util.js";


export class Controller {

    constructor() {
        this.service = new Service()
    }

    async getFileStream(file_name) {
        return this.service.getFileStream(file_name)
    }

    async handleCommand({ command })
    {
        logger.info(`executing command: ${command}`);
        const result = {
            result: 'ok'
        };
        const cmd = command.toLowerCase();
        if (cmd.includes('start'))
            this.service.startStreamming();
        else if (cmd.includes('stop'))
            this.service.stopStreamming();
        else {
            const chosenFx = await this.service.readFxByName(cmd);
            logger.info(`merging ${chosenFx} effect to the stream!`);
            this.service.appendFxToStream(chosenFx);
        }
        return result;
    }

    createClientStream() {
        const { id, clientStream } = this.service.createClientStream();
        logger.info(`client ${id} connected`);
        const onDisconnection = () => {
            logger.info(`client ${id} disconnected`);
            this.service.removeClientStream(id);
        }

        return {
            stream: clientStream,
            onDisconnection
        };
    }
}
