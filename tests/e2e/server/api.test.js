import {
    jest,
    expect,
    describe,
    it,
    beforeEach
} from '@jest/globals';

import Server from '../../../server/server.js';
import superTest from 'supertest';
import portfinder from 'portfinder';
import { Transform } from 'stream';
import { setTimeout  } from 'timers/promises';

const RETENTION_DATA_PERIOD = 200;

const getAvaliablePort = portfinder.getPortPromise;
const getSuperTest = port => superTest(`http://localhost:${port}`);

const DEFAULT_EXECUTION_SUCCEED_RESULT = JSON.stringify({
    result: 'ok'
});

describe('API E2E Suite Test', () => {
    const possible_commands = {
        start: 'start',
        stop: 'stop'
    }
    function pipeAndReadStreamData(stream, onChunck)
    {
        const transform = new Transform({
            transform(chunck, enc, cb)
            {
                onChunck(chunck);
                cb(null, chunck);
            }
        });

        return stream.pipe(transform);
    }

    describe('client workflow', () => {

        async function getTestServer()
        {
            const port = await getAvaliablePort();
            return new Promise((resolve, reject) =>
            {
                const server = Server.listen(port).once('listening', () =>
                {
                    const testServer = getSuperTest(port);
                    const response = {
                        testServer,
                        kill() {
                            server.close();
                            server.unref();
                        }
                    };

                    return resolve(response);
                })
                .once('error', reject);
            });
        }

        function commandSender(test_server) {
            return {
                async send(command) {
                    const response = await test_server.post('/controller')
                    .send({
                        command
                    });
                    expect(response.text).toStrictEqual(DEFAULT_EXECUTION_SUCCEED_RESULT);
                }
            }
        }

        it('it should not receive data stream if the process is not playing', async () =>{
            const server = await getTestServer();
            const onChunck = jest.fn();
            pipeAndReadStreamData(
                server.testServer.get('/stream'),
                onChunck
            );

            await setTimeout(RETENTION_DATA_PERIOD);

            server.kill();

            expect(onChunck).not.toHaveBeenCalled();
        });

        it('should receive data stream if the process is not playing', async () => {
            const server = await getTestServer();
            const onChunck = jest.fn();
            const { send } = commandSender(server.testServer)
            pipeAndReadStreamData(
                server.testServer.get('/stream'),
                onChunck
            );
            await send(possible_commands.start);
            await setTimeout(RETENTION_DATA_PERIOD);
            await send(possible_commands.stop);
            const [[buffer]] = onChunck.mock.calls;
            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.length).toBeGreaterThan(1000);
            server.kill();

        });
    });

});
