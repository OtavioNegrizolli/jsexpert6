import fs from 'fs';
import { extname, join } from 'path';
import fsPromises from 'fs/promises';
import config from './config.js';

const { dir: { publicDirectory } } = config;

export class Service 
{
    createFileStream(file_name) 
    {
        return fs.createReadStream(file_name);
    }

    async getFileInfo(file_name)
    {
        const full_file_path = join(publicDirectory,  file_name);

        await fsPromises.access(full_file_path)
        const file_type = extname(full_file_path)
        return {
            type: file_type,
            name: full_file_path
        };
    }

    async getFileStream(file_name)  {
        const {
            name, type
        } = await this.getFileInfo(file_name);

        return {
            stream: this.createFileStream(name),
            type
        };
    }
}
