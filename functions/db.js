import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

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
  id: {
    type: String,
    index: true,
    unique: true
  },
  created: Number,
  updated: Number,
  deleted: Object,
  user: {
    name: {
      type: String,
      index: true
    },
    logo: String,
    banner: String,
    country: String,
    joined: String,
    description: {
      type: String,
      index: true
    }
  },
  stats: {
    subscribers: {
      type: Number,
      index: true
    },
    views: Number,
    videos: Number
  },
  history: Object,
  gains: {
    subscribers: {
      daily: {
        type: Number,
        index: true
      },
      weekly: {
        type: Number,
        index: true
      },
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
userSchema.index({ 'user.name': 1, 'user.description': 1, 'id': 1, 'stats.subscribers': 1, 'stats.views': 1, 'gains.subscribers.daily': 1, 'gains.subscribers.weekly': 1 });

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

const getall = async () => {
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

removeDuplicates()

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

const getall2 = async (options) => {
  try {
    options.sort1 = getMappedSort(options.sort1);
    options.sort2 = getMappedSort(options.sort2);
    const documents = await User.find({
      $or: [
        { "user.name": { $regex: options.search, $options: "i" } },
        { "id": { $regex: options.search, $options: "i" } },
        { "user.description": { $regex: options.search, $options: "i" } }
      ],
      ...options.filters
    }, { history: 0 }) // Exclude history field from the result
      .sort({
        [options.sort1]: options.order1 === "asc" ? 1 : -1,
        [options.sort2]: options.order2 === "asc" ? 1 : -1
      }).limit(options.limit).skip(options.offset);
    return documents;
  } catch (error) {
    console.log(error);
  }
};

const getall3 = async () => {
  try {
    let documents = await User.find({}, { "user.name": 1, "stats.subscribers": 1 })
      .sort({
        "stats.subscribers": -1,
        "user.name": 1
      });
    return documents;
  } catch (error) { }
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

const getNewestDocument = async () => {
  try {
    const document = await User.findOne({}, { id: 1, _id: 1 }).sort({ created: -1 });
    if (document) return document;
    return null;
  } catch (error) { }
}

const addGainsIfNotExists = async () => {
  let addGains = {
    subscribers: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    },
    views: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    },
    videos: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    }
  };
  await User.updateMany({ "gains.subscribers": { $exists: false } }, { $set: { "gains": addGains } })
}

export default {
  add,
  find,
  find2,
  getall,
  update,
  getall2,
  getTotalDocuments,
  checkIds,
  getall3,
  addGainsIfNotExists
};