import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect('mongodb://' + (process.env.MONGO_URL ? process.env.MONGO_URL : process.argv[2]), {
  useNewUrlParser: true,
  authSource: 'admin',
  user: process.env.MONGO_USER ? process.env.MONGO_USER : process.argv[3],
  pass: process.env.MONGO_PASSWORD ? process.env.MONGO_PASSWORD : process.argv[4]
})
  .then(() => console.log('Connected!')).catch(err => console.log(err));

let userSchema = new mongoose.Schema({
  id: String,
  created: Number,
  updated: Number,
  deleted: Object,
  user: Object,
  stats: Object,
  history: Object,
  gains: Object
});

let User = mongoose.model('users', userSchema);

const add = async (json) => {
  try {
    let user = await User.findOne({ id: json.id })
    if (user) {
      await User.updateOne({ id: json.id }, { $set: json });
    } else {
      let newUser = new User(json);
      await newUser.save();
    }
  } catch (error) {
    console.log(error)
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

//remove all duplicates
const removeDuplicates = async () => {
  try {
    let users = await User.find();
    let ids = [];
    for (let user of users) {
      if (ids.includes(user.id)) {
        await User.deleteOne({ id: user.id });
      } else {
        ids.push(user.id);
      }
    }
  } catch (error) { }
};

removeDuplicates()

const getall2 = async (options) => {
  try {
    if (options.sort1 === "subscribers24") {
      options.sort1 = "gains.subscribers.daily";
    } else if (options.sort1 === "subscribers7") {
      options.sort1 = "gains.subscribers.weekly";
    } else if (options.sort1 === "subscribers30") {
      options.sort1 = "gains.subscribers.monthly";
    } else if (options.sort1 === "views24") {
      options.sort1 = "gains.views.daily";
    } else if (options.sort1 === "views7") {
      options.sort1 = "gains.views.weekly";
    } else if (options.sort1 === "views30") {
      options.sort1 = "gains.views.monthly";
    } else if (options.sort1 === "videos24") {
      options.sort1 = "gains.videos.daily";
    } else if (options.sort1 === "videos7") {
      options.sort1 = "gains.videos.weekly";
    } else if (options.sort1 === "videos30") {
      options.sort1 = "gains.videos.monthly";
    } else {
      options.sort1 = options.sort1 === "views" || options.sort1 === "subscribers" || options.sort1 === "videos" ? `stats.${options.sort1}` : `user.${options.sort1}`;
    }
    if (options.sort2 === "subscribers24") {
      options.sort2 = "gains.subscribers.daily";
    } else if (options.sort2 === "subscribers7") {
      options.sort2 = "gains.subscribers.weekly";
    } else if (options.sort2 === "subscribers30") {
      options.sort2 = "gains.subscribers.monthly";
    } else if (options.sort2 === "views24") {
      options.sort2 = "gains.views.daily";
    } else if (options.sort2 === "views7") {
      options.sort2 = "gains.views.weekly";
    } else if (options.sort2 === "views30") {
      options.sort2 = "gains.views.monthly";
    } else if (options.sort2 === "videos24") {
      options.sort2 = "gains.videos.daily";
    } else if (options.sort2 === "videos7") {
      options.sort2 = "gains.videos.weekly";
    } else if (options.sort2 === "videos30") {
      options.sort2 = "gains.videos.monthly";
    } else {
      options.sort2 = options.sort2 === "views" || options.sort2 === "subscribers" || options.sort2 === "videos" ? `stats.${options.sort2}` : `user.${options.sort2}`;
    }
    let documents = await User.find({
      $or: [
        { "user.name": { $regex: options.search, $options: "i" } },
        { "id": { $regex: options.search, $options: "i" } },
        { "user.description": { $regex: options.search, $options: "i" } },
        { "user.name": { $regex: options.search, $options: "i" } },
        { "id": { $regex: options.search, $options: "i" } },
        { "user.description": { $regex: options.search, $options: "i" } }
      ],
    })
      .sort({
        [options.sort1]: options.order1 === "asc" ? 1 : -1,
        [options.sort2]: options.order2 === "asc" ? 1 : -1,
      }).limit(options.limit).skip(options.offset);
    documents = JSON.parse(JSON.stringify(documents));
    documents = documents.map((document) => {
      delete document.history;
      return document;
    })
    return documents;
  } catch (error) { }
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
    const totalSubscribers = await User.aggregate([{ $group: { _id: null, total: { $sum: "$stats.subscribers" } } }]);
    const totalViews = await User.aggregate([{ $group: { _id: null, total: { $sum: "$stats.views" } } }]);
    const totalVideos = await User.aggregate([{ $group: { _id: null, total: { $sum: "$stats.videos" } } }]);
    return {
      totalChannels: totalChannels,
      totalSubscribers: totalSubscribers[0].total,
      totalViews: totalViews[0].total,
      totalVideos: totalVideos[0].total
    };
  } catch (error) { }
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
};