import config from "./config.js";
import { Controller } from "./controller.js";
import logger from "./util.js";


const {
    location,
    pages,
    constants: {
        CONTENT_TYPE
    }
} = config;

import { once } from 'events';

const controller = new Controller()

async function routes(request, response) {
    const { method } = request;
    if (method === 'GET')
    {
        return await _get(request, response)
    }
    if (method === 'POST')
    {
        return await _post(request, response)
    }
    response.writeHead(404)
    return response.end();
}


function handleError(error, response)
{
    if ( error.message.includes('ENOENT'))
    {
        logger.warn(`asset not found ${error.stack}`)
        response.writeHead(404)
    }
    else
    {
        logger.error(`caught API error ${error.stack}`)
        response.writeHead(500)
    }
    return response.end()
}

async function _post(request, response) {
    const { url } = request;
    if (url === '/controller')
    {
        const data = await once(request, 'data');
        const item = JSON.parse(data);
        const result = await controller.handleCommand(item);
        return response.end(JSON.stringify(result));
    }
}

async function _get(request, response)
{
    const { url } = request;

    if (url === '/')
    {
        response.writeHead(302, {
            'Location': location.home
        });
        return response.end()
    }

    if (url === '/home')
    {
        const {
            stream
        } = await controller.getFileStream(pages.homeHTML)

        // response.writeHead(200, {
        //     'Content-Type': 'text/html'
        // });

        return stream.pipe(response)
    }

    if (url === '/controller')
    {
        const {
            stream
        } = await controller.getFileStream(pages.controllerHTML)

        // response.writeHead(200, {
        //     'Content-Type': 'text/html'
        // });

        return stream.pipe(response)
    }

    if (url.includes('/stream'))
    {
        const { stream, onDisconnection } = controller.createClientStream();

        request.once('close', onDisconnection);
        response.writeHead(200, {
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Accept-Ranges': 'bytes'
        });

        return stream.pipe(response);
    }
    /**
     * fallback
     * request for files
     */
    const {
        stream,
        type
    } = await controller.getFileStream(url);

    const content_type = CONTENT_TYPE[type];
    if (content_type)
        response.writeHead(200, {
            'Content-Type': content_type
        });
    return stream.pipe(response);
}


export function handler(request, response)
{
    return routes(request, response)
        .catch(error => handleError(error, response));
}
