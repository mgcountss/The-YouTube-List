import fs from 'fs';
let db = {};

if (!fs.existsSync("./db.json")) {
  fs.writeFileSync("./db.json", JSON.stringify(db, {}));
} else {
  db = JSON.parse(fs.readFileSync("./db.json", "utf8"));
}

const add = async (json) => {
  db[json.id] = json;
};

const find = async (id) => {
  return db[id];
};

const findMultiple = async (ids) => {
  return ids.map(id => db[id]);
};

const removeDuplicates = async (ids, remove) => {
  if (remove) {
    ids.forEach(id => {
      delete db[id];
    });
  } else {
    return ids.filter(id => db[id]);
  }
};

const getRandomChannel = async () => {
  const keys = Object.keys(db);
  return db[keys[Math.floor(Math.random() * keys.length)]];
};

const update = async (id, json) => {
  db[id] = json;
  return true;
};

const getAllIds = async () => {
  return Object.keys(db);
};

const initalLoad = async () => {
  let data = {
    totalChannels: 0,
    totalSubscribers: 0,
    totalViews: 0,
    totalVideos: 0
  }
  const keys = Object.keys(db);
  data.totalChannels = keys.length;
  keys.forEach(key => {
    data.totalSubscribers += db[key].stats.subscribers;
    data.totalViews += db[key].stats.views;
    data.totalVideos += db[key].stats.videos;
  });
  return data;
};

const getall = async (options) => {
  let currentChannels = {};
  if (search) {
    if (options.search.length == 24 && options.search.startsWith('UC')) {
      let channel = await find(options.search);
      if (channel) {
        currentChannels.push(channel);
      }
    } else {
      for (let channel in db) {
        if (db[channel].user.name.toLowerCase().includes(options.search.toLowerCase()) || db[channel].user.description.toLowerCase().includes(options.search.toLowerCase())) {
          currentChannels.push(db[channel]);
        }
      }
    }
  } else {
    currentChannels = Object.values(db);
  }
  if (options.filters) {
    for (let filter in options.filters) {
      currentChannels = currentChannels.filter(channel => {
        return channel[filter] == options.filters[filter];
      });
    }
  }
  if (options.sort1) {
    currentChannels.sort((a, b) => {
      if (options.order1 == 'asc') {
        return a[sortMap[options.sort1]] - b[sortMap[options.sort1]];
      } else {
        return b[sortMap[options.sort1]] - a[sortMap[options.sort1]];
      }
    });
  }
  if (options.sort2) {
    currentChannels.sort((a, b) => {
      if (options.order2 == 'asc') {
        return a[sortMap[options.sort2]] - b[sortMap[options.sort2]];
      } else {
        return b[sortMap[options.sort2]] - a[sortMap[options.sort2]];
      }
    });
  }
  return {
    documents: currentChannels.slice(options.offset, options.offset + options.limit),
    total: currentChannels.length,
    limit: options.limit,
    offset: options.offset
  };
};

setInterval(() => {
  fs.writeFileSync("./db.json", JSON.stringify(db, {}));
}, 10000);

export default {
  add,
  find,
  findMultiple,
  removeDuplicates,
  initalLoad,
  getall,
  getRandomChannel,
  update,
  getAllIds
};