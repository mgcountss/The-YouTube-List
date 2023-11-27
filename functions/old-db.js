import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  charset: 'utf8mb4'
});

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

const getMappedSort = (sortOption) => {
  return (sortOption === "views" || sortOption === "subscribers" || sortOption === "videos" ? `${sortOption}` : `${sortOption}`);
};

const getall = async (options) => {
  let query;
  try {
    let { sort1, order1, sort2, order2, limit, offset, search, filters } = options;
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
    query += ` ORDER BY ${getMappedSort(sort1)} ${order1 === "asc" ? "ASC" : "DESC"}, ${getMappedSort(sort2)} ${order2 === "asc" ? "ASC" : "DESC"}`
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
};

const initalLoad = async () => {
  let data = {
    totalChannels: 0,
    totalSubscribers: 0,
    totalViews: 0,
    totalVideos: 0
  }
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT SUM(subscribers) as subscribers FROM users');
    data.totalSubscribers = rows[0].subscribers;
    const [rows2] = await connection.execute('SELECT SUM(views) as views FROM users');
    data.totalViews = rows2[0].views;
    const [rows3] = await connection.execute('SELECT SUM(videos) as videos FROM users');
    data.totalVideos = rows3[0].videos;
    const [rows4] = await connection.execute('SELECT COUNT(*) as total FROM users');
    data.totalChannels = rows4[0].total;
    connection.release();
  } catch (error) {
    console.log(error);
  };
  return data;
};

const add = async (json) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      `INSERT INTO users 
        (id, created, updated, deleted, name, description, logo, banner, country, joined, subscribers, views, videos, history) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        json.id,
        json.created,
        json.updated,
        json.deleted,
        json.user.name,
        json.user.description,
        json.user.logo,
        json.user.banner,
        json.user.country,
        json.user.joined,
        json.stats.subscribers,
        json.stats.views,
        json.stats.videos,
        JSON.stringify(json.history)
      ]
    );
    connection.release();
  } catch (error) {
    console.log(error);
  }
};

const findMultiple = async (ids) => {
  try {
    const connection = await pool.getConnection();
    if (ids.length > 0) {
      const [rows] = await connection.execute(`SELECT id FROM users WHERE id IN (?)`, [ids]);
      connection.release();
      return rows;
    } else {
      return [];
    }
  } catch (error) {
    console.log(error);
  }
};

const find = async (id) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`SELECT * FROM users WHERE id = ?`, [id]);
    connection.release();
    return rows[0];
  } catch (error) {
    console.log(error);
  }
};

const removeDuplicates = async (ids, remove) => {
  try {
    if (ids.length === 0) return ids;
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`SELECT id FROM users WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
    connection.release();
    if (remove) {
      rows.forEach(async (row) => {
        ids.splice(ids.indexOf(row.id), 1);
      });
      return ids;
    } else {
      return rows;
    }
  } catch (error) {
    console.error("Error in removeDuplicates:", error);
    throw error;
  }
};

const getRandomChannel = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`SELECT * FROM users ORDER BY RAND() LIMIT 1`);
    connection.release();
    return rows[0];
  } catch (error) {
    console.log(error);
  }
};

const update = async (id, json) => {
  try {
    const connection = await pool.getConnection();
    await connection.execute(
      `UPDATE users SET 
        updated = ?, 
        deleted = ?, 
        name = ?, 
        description = ?, 
        logo = ?, 
        banner = ?, 
        country = ?, 
        joined = ?, 
        subscribers = ?, 
        views = ?, 
        videos = ?, 
        history = ? 
        WHERE id = ?`,
      [
        json.updated,
        json.deleted,
        json.user.name,
        json.user.description,
        json.user.logo,
        json.user.banner,
        json.user.country,
        json.user.joined,
        json.stats.subscribers,
        json.stats.views,
        json.stats.videos,
        JSON.stringify(json.history),
        id
      ]
    );
    connection.release();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const getAllIds = async () => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`SELECT id FROM users`);
    connection.release();
    return rows;
  } catch (error) {
    console.log(error);
  }
};

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