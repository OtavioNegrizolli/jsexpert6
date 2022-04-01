import { jest, expect, describe, beforeEach } from '@jest/globals';


import config from '../../../server/config.js'
import { Controller } from '../../../server/controller.js';
import { handler } from '../../../server/routes.js'
import TestUtil from '../mock/testUtil.js';

const {
    pages,
    location,
    constants: {
        CONTENT_TYPE
    }
} = config;


describe('#Routes - test site api for response', () => {
    beforeEach(() =>{
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    it(`GET / - should redirect to home page!`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET';
        params.request.url = '/';
        await handler(...params.values())
        expect(params.response.writeHead).toHaveBeenCalledWith(302, {
            'Location': location.home
        })
        expect(params.response.end).toHaveBeenCalled()
    });

    it(`GET /home - should respond with ${pages.homeHTML} file stream`, async () => {
        // setup
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET';
        params.request.url = '/home';
        const mockFileStream = TestUtil.genetateReadableStream(['I am the data'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream,
            type: ''
        })
        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        // test
        await handler(...params.values());

        expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(pages.homeHTML);
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    });

    it(`GET /controller - should respond with ${pages.controllerHTML} file stream!`, async () => {
        // setup
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET';
        params.request.url = '/controller';
        const mockFileStream = TestUtil.genetateReadableStream(['I am the data'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream,
            type: ''
        })
        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        // test
        await handler(...params.values());

        expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(pages.controllerHTML);
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    });

    it(`GET /index.html - should respond with file stream!`, async () => {
        // setup
        const params = TestUtil.defaultHandleParams()
        const filename = '/index.html'
        params.request.method = 'GET';
        params.request.url = filename;
        const expectedType = '.html'
        const mockFileStream = TestUtil.genetateReadableStream(['I am the data'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectedType
        })
        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue()

        // test
        await handler(...params.values());

        expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(filename);
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
        expect(params.response.writeHead).toHaveBeenCalledWith(200, {
            'Content-Type': CONTENT_TYPE[expectedType]
        });
    });

    it(`GET /<file>.<ext> - should respond with file stream!`, async () => {
        // setup
        const params = TestUtil.defaultHandleParams()
        const filename = '/file.ext'
        params.request.method = 'GET';
        params.request.url = filename;
        const expectedType = '.ext'
        const mockFileStream = TestUtil.genetateReadableStream(['I am the data'])
        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectedType
        });

        jest.spyOn(
            mockFileStream,
            "pipe"
        ).mockReturnValue();

        // test
        await handler(...params.values());

        expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(filename);
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
        expect(params.response.writeHead).not.toHaveBeenCalled();
    });

    it(`GET /unkown - given an unexistent route should respond with 404!`, async () => {
        // setup
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET';
        params.request.url = '/unknow';

        // test
        await handler(...params.values());
        expect(params.response.writeHead).toHaveBeenCalledWith(404);
        expect(params.response.end).toHaveBeenCalled();
    });

    describe('exceptions', () => {
        it('given inexistente file it should respond with 404!', async () => {
            // setup
            const params = TestUtil.defaultHandleParams()
            params.request.method = 'GET';
            params.request.url = '/index.png';

            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name
            )
            .mockRejectedValue(
                new Error('ENOENT mock error: no such file or other thing!')
            );

            // test
            await handler(...params.values());

            expect(params.response.writeHead).toHaveBeenCalledWith(404);
            expect(params.response.end).toHaveBeenCalled();
        });

        it('given inexistente file it should respond with 500!', async () => {
            // setup
            const params = TestUtil.defaultHandleParams()
            params.request.method = 'GET';
            params.request.url = '/index.png';

            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name
            )
            .mockRejectedValue(
                new Error('Test mock error!')
            );

            // test
            await handler(...params.values());

            expect(params.response.writeHead).toHaveBeenCalledWith(500);
            expect(params.response.end).toHaveBeenCalled();
        })
    })

});
