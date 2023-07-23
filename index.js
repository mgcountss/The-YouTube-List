import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
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

let cache = await sendChannels({ sort1: 'subscribers', sort2: 'name', order1: 'desc', order2: 'desc', limit: 5, offset: 0, search: '' })
let totalCache = await db.getTotalDocuments();
app.get('/', async (req, res) => {
    let ids = cache.map(user => user.id);
    res.render('index', { users: cache, total: totalCache, ids: ids });
    cache = await sendChannels({ sort1: 'subscribers', sort2: 'name', order1: 'desc', order2: 'desc', limit: 5, offset: 0, search: '' })
});

app.post('/api/totals', async (req, res) => {
    res.send(totalCache);
    totalCache = await db.getTotalDocuments();
});
/*let cache3 = []
app.get('/bar', async (req, res) => {
    if (!cache3) {
        res.send('No data yet');
    }
    res.render('bar', { data: cache3 });
    cache3 = await db.getall3();
    for (let q = 0; q < cache3.length; q++) {
        cache3[q] = {
            value: cache3[q].stats.subscribers,
            name: cache3[q].user.name
        }
    }
});*/
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
        if ((!req.body.id.startsWith('@')) && ((req.body.id.startsWith('UC')) || (req.body.id.length == 24))) {
            res.send(await addUser(req.body.id));
        } else if (req.body.id.startsWith('@')) {
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

app.post('/api/channels', async (req, res) => {
    let sort1 = req.body.sort1 ? req.body.sort1 : 'subscribers';
    let sort2 = req.body.sort2 ? req.body.sort2 : 'name';
    if (sort1 == "") {
        sort1 = 'subscribers';
    }
    if (sort2 == "") {
        sort2 = 'name';
    }
    let options = {
        sort1: sort1,
        sort2: sort2,
        order1: req.body.order1 ? req.body.order1 : 'desc',
        order2: req.body.order2 ? req.body.order2 : 'desc',
        limit: 5,
        offset: req.body.offset ? req.body.offset : 0,
        search: req.body.search ? req.body.search : ''
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
            fork('./updateAll.js', [process.env.MONGO_URL, process.env.MONGO_USER, process.env.MONGO_PASSWORD, process.env.YOUTUBE_API_KEYS]);
        }
    }
}, 60000);

app.listen(3002, () => {
    console.log('Server running on port 3002');
})