import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
let caches = {};
const MONGO_URL = process.env.MONGO_URL || process.argv[2];
const MONGO_USER = process.env.MONGO_USER || process.argv[3];
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || process.argv[4];

mongoose.connect(`mongodb://${MONGO_URL}`, {
  useNewUrlParser: true,
  authSource: 'admin',
  user: MONGO_USER,
  pass: MONGO_PASSWORD,
})
  .then(() => console.log('Connected!'))
  .catch(err => console.log(err));

let userSchema = new mongoose.Schema({
  id: String,
  created: Number,
  updated: Number,
  deleted: Object,
  user: {
    name: String,
    logo: String,
    banner: String,
    country: String,
    joined: String,
    description: String,
  },
  stats: {
    subscribers: Number,
    views: Number,
    videos: Number
  },
  history: Object,
  gains: {
    subscribers: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      yearly: Number
    },
    views: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      yearly: Number
    },
    videos: {
      daily: Number,
      weekly: Number,
      monthly: Number,
      yearly: Number
    }
  }
});

let User = mongoose.model('users', userSchema);

const add = async (json) => {
  try {
    await User.findOneAndUpdate({ id: json.id }, { $set: json }, { upsert: true });
  } catch (error) {
    console.log(error);
  }
};

const update = async (id, value) => {
  try {
    await User.updateOne({ id: id }, { $set: value });
  } catch (error) { }
}

const find = async (type, value) => {
  try {
    const document = await User.findOne({ [type]: value });
    if (document) return document;
    return null;
  } catch (error) { }
};

const getallDocuments = async () => {
  try {
    const documents = await User.find({}, { id: 1, _id: 1 });
    return documents;
  } catch (error) { }
};

const removeDuplicates = async () => {
  try {
    const users = await User.find({}, { id: 1 }).sort({ _id: 1 });
    const ids = [];
    const duplicatesToDelete = [];
    for (const user of users) {
      if (ids.includes(user.id)) {
        duplicatesToDelete.push(user.id);
      } else {
        ids.push(user.id);
      }
    }
    if (duplicatesToDelete.length > 0) {
      await User.deleteMany({ id: { $in: duplicatesToDelete } });
    }
  } catch (error) {
    console.log(error);
  }
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
  videos30: "gains.videos.monthly",
  nameLength: "nameLength",
  descriptionLength: "descriptionLength",
};

const getMappedSort = (sortOption) => {
  return sortMap[sortOption] || (sortOption === "views" || sortOption === "subscribers" || sortOption === "videos" ? `stats.${sortOption}` : `user.${sortOption}`);
};

const getall = async (options) => {
  try {
    const { sort1, order1, sort2, order2, limit, offset, search, filters } = options;
    const regexOptions = "i";
    const searchConditions = {
      $or: [
        { "user.name": { $regex: search, $options: regexOptions } },
        { "id": { $regex: search, $options: regexOptions } },
        { "user.description": { $regex: search, $options: regexOptions } }
      ],
      ...filters
    };
    const [documents, total] = await Promise.all([
      User.find(searchConditions, { history: 0 })
        .sort({
          [getMappedSort(sort1)]: order1 === "asc" ? 1 : -1,
          [getMappedSort(sort2)]: order2 === "asc" ? 1 : -1
        })
        .limit(limit)
        .skip(offset),
      User.countDocuments(searchConditions)
    ]);
    return {
      documents: documents,
      total: total,
      limit: limit,
      offset: offset
    };
  } catch (error) {
    console.log(error);
  }
};

const find2 = async (json) => {
  try {
    const documents = await User.find(json);
    return documents;
  } catch (error) { }
};

const getTotalDocuments = async () => {
  try {
    const totalChannels = await User.countDocuments();
    const [totalSubscribers, totalViews, totalVideos] = await Promise.all([
      User.aggregate([{ $group: { _id: null, total: { $sum: "$stats.subscribers" } } }]),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$stats.views" } } }]),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$stats.videos" } } }])
    ]);
    return {
      totalChannels: totalChannels,
      totalSubscribers: totalSubscribers[0].total || 0,
      totalViews: totalViews[0].total || 0,
      totalVideos: totalVideos[0].total || 0
    };
  } catch (error) {
    console.log(error);
  }
};

const checkIds = async (ids) => {
  try {
    let users = await User.find({ id: { $in: ids } }, { id: 1, _id: 0 });
    let ids2 = [];
    for (let user of users) {
      ids2.push(user.id);
    }
    return ids.filter(id => !ids2.includes(id));
  } catch (error) { }
};

const getRandomChannel = async () => {
  try {
    const total = await User.countDocuments();
    const random = Math.floor(Math.random() * total);
    return await User.findOne({}, { history: 0 }).skip(random);
  } catch (error) { }
};

export default {
  add,
  find,
  find2,
  getallDocuments,
  update,
  getall,
  getTotalDocuments,
  checkIds,
  getRandomChannel
};