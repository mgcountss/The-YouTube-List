import newDB from './db.js';
import oldDB from './old-db.js';
import fs from 'fs';
let load = await oldDB.initalLoad();
console.log(load);
let soFar = 0;

let oldChannels = await oldDB.getall({
    sort: "subscribers",
    order: 'desc',
    limit: 1000000,
    offset: 0,
    search: '',
    filters: []
});
fs.writeFileSync("./old.json", JSON.stringify(oldChannels, {}));
for (let channel of oldChannels.documents) {
    soFar++;
    newDB.add(channel);
    console.log(`Added ${soFar} of ${oldChannels.total}`);
}