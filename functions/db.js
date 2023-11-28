import fs, { stat } from 'fs';
let db = {};

if (!fs.existsSync("./db.json")) {
  fs.writeFileSync("./db.json", JSON.stringify(db, {}));
} else {
  db = fs.readFileSync("./db.json", "utf8");
  db = JSON.parse(db);
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
    data.totalSubscribers += db[key].stats ? db[key].stats.subscribers : 0;
    data.totalViews += db[key].stats ? db[key].stats.views : 0;
    data.totalVideos += db[key].stats ? db[key].stats.videos : 0;
  });
  return data;
};

const sortMap = {
  subscribers24: "gains.subscribers.daily",
  subscribers7: "gains.subscribers.weekly",
  subscribers30: "gains.subscribers.monthly",
  views24: "gains.views.daily",
  views7: "gains.views.weekly",
  views30: "gains.views.monthly",
  videos24: "gains.videos.daily",
  videos7: "gains.videos.weekly",
  videos30: "gains.videos.monthly"
};

/*const getall = async (options) => {
  let query;
  try {
    let { sort, order, limit, offset, search, filters } = options;
    search = injectionFixer(search)
    query = `SELECT COUNT(*) FROM users WHERE (name LIKE '%${search}%' OR id LIKE '%${search}%' OR description LIKE '%${search}%')`;
    if (search == '') {
      query = 'SELECT COUNT(*) FROM users';
      if (filters) {
        let thing = 'WHERE';
        for (var filter in filters) {
          if (filters[filter] != '') {
            query += ` ${thing} ${filters[filter]}`;
            thing = 'AND';
          }
        }
      }
    }
    if (filters) {
      for (var filter in filters) {
        if (filters[filter] != '') {
          query += ` AND ${filters[filter]}`;
        }
      }
    }
    query += ` ORDER BY ${getMappedSort(sort)} ${order === "asc" ? "ASC" : "DESC"}, ${getMappedSort(sort)} ${order === "asc" ? "ASC" : "DESC"}`
    const connection = await pool.getConnection();
    const [rows2] = await connection.execute(query);
    query += ` LIMIT ${limit} OFFSET ${offset}`;
    query = query.replace('COUNT(*)', '*');
    const [rows] = await connection.execute(query);
    connection.release();
    return {
      documents: rows,
      total: rows2[0]['COUNT(*)'],
      limit: limit,
      offset: offset
    };
  } catch (error) {
    console.log(error);
    return {
      documents: [],
      total: 0,
      limit: 0,
      offset: 0
    };
  }
};*/

const getall = async (options) => {
  try {
    let { sort, order, limit, offset, search, filters } = options;
    let selected;
    if (search == '') {
      selected = { ...db };
    } else {
      selected = Object.values({ ...db });
      if ((search.startsWith("UC")) && (search.length == 24) && (!search.includes(" "))) {
        for (var channel in db) {
          if (channel == search) {
            selected = [db[channel]];
            break;
          }
        }
      } else {
        selected = Object.values({ ...db });
        selected = selected.filter(channel => {
          return ((channel.user.name.toLowerCase().includes(search.toLowerCase())) || (channel.id.toLowerCase().includes(search.toLowerCase())) || (channel.user.description.toLowerCase().includes(search.toLowerCase())));
        });
      }
    }
    selected = Object.values(selected);
    if (filters) {
      console.log(filters);
      for (var filter2 in filters) {
        if (filters[filter2] != '') {
          let filter = filters[filter2];
          if (filter.includes("=")) {
            if ((filter.split(" = ")[0] == "stats.subscribers") || (filter.split(" = ")[0] == "stats.views") || (filter.split(" = ")[0] == "stats.videos")) {
              selected = selected.filter(channel => {
                return parseInt(channel[(filter.split(" = ")[0]).split(".")[0]][(filter.split(" = ")[0]).split(".")[1]]) == parseInt(filter.split(" = ")[1].replace(/"/g, ''));
              });
            } else {
              selected = selected.filter(channel => {
                return channel[(filter.split(" = ")[0]).split(".")[0]][(filter.split(" = ")[0]).split(".")[1]] == filter.split(" = ")[1].replace(/"/g, '');
              });
            }
          } else if (filter.includes(" > ")) {
            selected = selected.filter(channel => {
              return parseInt(channel[(filter.split(" > ")[0]).split(".")[0]][(filter.split(" > ")[0]).split(".")[1]]) > parseInt(filter.split(" > ")[1].replace(/"/g, ''));
            });
          } else if (filter.includes(" < ")) {
            console.log(filter);
            selected = selected.filter(channel => {
              return parseInt(channel[(filter.split(" < ")[0]).split(".")[0]][(filter.split(" < ")[0]).split(".")[1]]) < parseInt(filter.split(" < ")[1].replace(/"/g, ''));
            });
          } else if (filter.includes(" >= ")) {
            selected = selected.filter(channel => {
              return parseInt(channel[(filter.split(" >= ")[0]).split(".")[0]][(filter.split(" >= ")[0]).split(".")[1]]) >= parseInt(filter.split(" >= ")[1].replace(/"/g, ''));
            });
          } else if (filter.includes(" <= ")) {
            selected = selected.filter(channel => {
              return parseInt(channel[(filter.split(" <= ")[0]).split(".")[0]][(filter.split(" <= ")[0]).split(".")[1]]) <= parseInt(filter.split(" <= ")[1].replace(/"/g, ''));
            });
          } else if (filter.includes(" != ")) {
            if ((filter.split(" != ")[0] == "stats.subscribers") || (filter.split(" != ")[0] == "stats.views") || (filter.split(" != ")[0] == "stats.videos")) {
              selected = selected.filter(channel => {
                return parseInt(channel[(filter.split(" != ")[0]).split(".")[0]][(filter.split(" != ")[0]).split(".")[1]]) != parseInt(filter.split(" != ")[1].replace(/"/g, ''));
              });
            } else {
              selected = selected.filter(channel => {
                return channel[(filter.split(" != ")[0]).split(".")[0]][(filter.split(" != ")[0]).split(".")[1]] != filter.split(" != ")[1].replace(/"/g, '');
              });
            }
          }
        }
      }
    }
    if (sort != "") {
      selected = selected.sort((a, b) => {
        if ((sort == "stats.subscribers") || (sort == "stats.views") || (sort == "stats.videos") || (sort == "user.joined")) {
          return parseInt(a[sort.split(".")[0]][sort.split(".")[1]]) - parseInt(b[sort.split(".")[0]][sort.split(".")[1]]);
        } else {
          return a[sort.split(".")[0]][sort.split(".")[1]] - b[sort.split(".")[0]][sort.split(".")[1]];
        }
      });
      if (order == "desc") {
        selected = selected.reverse();
      }
    }
    selected = selected.slice(offset, offset + limit);
    return {
      documents: selected,
      total: selected.length,
      limit: limit,
      offset: offset
    }
  } catch (error) {
    console.log(error);
    return {
      documents: [],
      total: 0,
      limit: 5,
      offset: 0
    };
  }
}

setInterval(() => {
  fs.writeFileSync("./db.json", JSON.stringify(db, {}));
}, 120000);

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