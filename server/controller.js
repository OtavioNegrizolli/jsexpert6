import { Service } from "./service.js";


export class Controller {

    constructor() {
        this.service = new Service()
    }

    async getFileStream(file_name) {
        return this.service.getFileStream(file_name)
    }
}
