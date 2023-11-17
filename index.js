import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { dirname } from 'path';
import addUser from './functions/addUser.js';
import searchChannel from './functions/searchChannel.js';
import updateUser from './functions/updateUser.js';
import sendChannels from './functions/sendChannels.js';
import { fork } from 'child_process';
import db from './functions/db.js';
const app = express();
app.use(cors());
app.set('view engine', 'ejs');
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import bodyParser from 'body-parser';
app.use(bodyParser({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let cache = JSON.parse(fs.readFileSync('./caches/index.json'));
let totals = JSON.parse(fs.readFileSync('./caches/totals.json'));

app.get('/', async (req, res) => {
    let ids = cache.channels.map(user => user.id);
    res.render('index', { users: cache.channels, ids: ids, limit: cache.limit, total: cache.total, offset: cache.offset, totals: totals });
    cache = await sendChannels({ sort1: 'subscribers', sort2: 'name', order1: 'desc', order2: 'desc', limit: 5, offset: 0, search: '' })
});
app.post('/api/totals', async (req, res) => {
    res.send(totals);
});
app.get('/favicons/*', (req, res) => {
    res.sendFile(__dirname + req.path);
});
app.get('/js/*', (req, res) => {
    res.sendFile(__dirname + req.path);
});
app.get('/css/*', (req, res) => {
    res.sendFile(__dirname + req.path);
});
app.get('/images/*', (req, res) => {
    res.sendFile(__dirname + req.path);
});
app.post('/api/add', async (req, res) => {
    if (!req.body.id) {
        res.send({
            error: true,
            message: 'No Parameters Provided'
        });
    } else {
        if ((req.body.id.startsWith('@')) || ((req.body.id.startsWith('UC')) && (req.body.id.length == 24))) {
            res.send(await addUser(req.body.id));
        } else {
            res.send(await searchChannel2(req.body.id));
        }
    }
});

app.post('/api/update', async (req, res) => {
    if (!req.body.id) {
        res.send({
            error: true,
            message: 'No Parameters Provided'
        });
    } else {
        if ((req.body.id.startsWith('UC')) && (req.body.id.length == 24)) {
            res.send(await updateUser(req.body.id));
        } else {
            res.send({
                error: true,
                message: 'Invalid Channel ID'
            });
        }
    }
});

app.get('/api/random', async (req, res) => {
    let channel = await db.getRandomChannel();
    res.send({
        "id": channel.id,
        "created": channel.created,
        "updated": channel.updated,
        "user": {
            "name": channel.name,
            "description": channel.description,
            "logo": channel.logo,
            "banner": channel.banner,
            "country": channel.country,
            "joined": channel.joined
        },
        "stats": {
            "subscribers": channel.subscribers,
            "views": channel.views,
            "videos": channel.videos
        },
        "gains": {
            "subscribers": {
                "daily": 0,
                "weekly": 0,
                "monthly": 0,
                "yearly": 0
            },
            "views": {
                "daily": 0,
                "weekly": 0,
                "monthly": 0,
                "yearly": 0
            },
            "videos": {
                "daily": 0,
                "weekly": 0,
                "monthly": 0,
                "yearly": 0
            }
        }
    })
})

app.post('/api/channels', async (req, res) => {
    let sort1 = req.body.sort1 ? req.body.sort1 : 'subscribers';
    let sort2 = req.body.sort2 ? req.body.sort2 : 'name';
    let options = {
        sort1: sort1,
        sort2: sort2,
        order1: req.body.order1 ? req.body.order1 : 'desc',
        order2: req.body.order2 ? req.body.order2 : 'desc',
        limit: 5,
        offset: req.body.offset ? req.body.offset : 0,
        search: req.body.search ? req.body.search : '',
        filters: req.body.filters ? req.body.filters : []
    }
    res.send(await sendChannels(options));
})

app.post('/api/addBulk', async (req, res) => {
    let ids = req.body.ids;
    for (let i = 0; i < ids.length; i++) {
        if (!ids[i].startsWith('UC')) {
            ids.splice(i, 1);
            i -= 1;
        } else if (ids[i].length != 24) {
            ids.splice(i, 1);
            i -= 1;
        }
    }
    ids = new Set(ids);
    ids = Array.from(ids);
    addUser(null, ids);
    res.send({
        error: false,
        message: 'Adding channels'
    });
})

async function searchChannel2(term) {
    return await searchChannel(term);
}

let lastHour = new Date().getHours();
setInterval(() => {
    if (new Date().getHours() != lastHour) {
        lastHour = new Date().getHours();
        if (lastHour === 0 || lastHour === 12) {
            console.log('Updating all channels');
            fork('./updateAll.js', [process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DATABASE, process.env.YOUTUBE_API_KEYS]);
        }
    }
}, 60000);

setInterval(async () => {
    totals = await db.initalLoad();
    fs.writeFileSync('./caches/totals.json', JSON.stringify(totals));
}, 30000);

app.listen(3002, () => {
    console.log('Server running on port 3002');
})

cache = await sendChannels({ sort1: 'subscribers', sort2: 'name', order1: 'desc', order2: 'desc', limit: 5, offset: 0, search: '' })
totals = await db.initalLoad();
fs.writeFileSync('./caches/totals.json', JSON.stringify(totals));
fs.writeFileSync('./caches/index.json', JSON.stringify(cache));