import fs from 'fs';
import { extname, join } from 'path';
import fsPromises from 'fs/promises';
import config from './config.js';
import { randomUUID } from 'crypto';
import { PassThrough, Writable } from 'stream';

import streamsPromises from 'stream/promises';

import Throttle from 'throttle';
import childProcess from 'child_process';

import { once } from 'events';

import logger from './util.js';

const { dir: { publicDirectory }, constants: { fallbackBitRate, baseAudio, bitRateFraction } } = config;

export class Service
{
    constructor() {
        this.client_streams = new Map();
        this.current_song = baseAudio;
        this.current_bit_rate = 0;
        this.throttle_transform = { }
        this.current_readable = { }
    }

    async getBitRate(song_uri) {
        try {
            const args = [
                '--i', // info
                '-B', // bit rate
                song_uri
            ];
            const {
                stderr,
                stdout,
                // stdin
            } = this._executeSoxCommand(args);
            // wait cmd execution ends
            await Promise.all([
                once(stdout, 'readable'),
                once(stderr, 'readable')
            ]);
            const [success, errors] = [stdout, stderr].map( s => s.read() )
            if (errors) return await Promise.reject(errors)
            return success.toString().trim().replace('k', '000')
        }
        catch (error)
        {
            logger.error(`cannot get audio bit rate, using fallback! Error: ${error}`)
            return fallbackBitRate
        }
    }

    async startStreamming() {
        logger.info(`starting transmission ${this.current_song}`);
        const bit_rate = this.current_bit_rate = (await this.getBitRate(this.current_song)) / bitRateFraction;
        const throttleTransform = this.throttle_transform = new Throttle(bit_rate);
        const song_readable = this.current_readable = this.createFileStream(this.current_song);
        return streamsPromises.pipeline(
            song_readable,
            throttleTransform,
            this.broadCast()
        );
    }

    stopStreamming() {
        logger.info(`stopping`)
        this.throttle_transform?.end?.()
    }

    async getFileInfo(file_name)
    {
        logger
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

    broadCast() {
        return Writable({
            write: (chunk, enc, cb ) => {
                for ( const [ id, stream ] of this.client_streams) {
                    // if desconnection
                    if (stream.writableEnded)
                        this.client_streams.delete(id);
                    else
                        stream.write(chunk)
                }
                cb();
            }
        })
    }

    createClientStream() {
        const id = randomUUID()
        const clientStream = new PassThrough()
        this.client_streams.set(id, clientStream)
        return {
            id,
            clientStream
        }
    }

    removeClientStream(id) {
        this.client_streams.delete(id)
    }

    createFileStream(file_name)
    {
        return fs.createReadStream(file_name);
    }

    _executeSoxCommand(args) {
        return childProcess.spawn('sox', args);
    }

}
