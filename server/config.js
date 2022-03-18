import { join, dirname } from 'path'
import { fileURLToPath } from 'url'


const cwd = dirname(fileURLToPath(import.meta.url))

const root = join(cwd, '../')
const audio_dir = join(root, 'audio');
const public_dir = join(root, 'public');

export default {
    port: process.env.PORT || 3000,
    dir: {
        root,
        publicDirectory: public_dir,
        audioDirectory: audio_dir,
        songsDirectory: join(audio_dir, 'songs'),
        fxDirectory: join(audio_dir, 'fx')
    },
    pages: {
        homeHTML: 'home/index.html',
        controllerHTML: 'controller/index.html'
    },
    location: {
        home: '/home',
    },
    constants: {
        CONTENT_TYPE: {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
        }
    }
}
