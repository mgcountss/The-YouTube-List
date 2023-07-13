import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect('mongodb://' + process.env.MONGO_URL, {
  useNewUrlParser: true,
  authSource: 'admin',
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD
})
  .then(() => console.log('Connected!')).catch(err => console.log(err));

let userSchema = new mongoose.Schema({
  id: String,
  created: Number,
  updated: Number,
  deleted: Object,
  user: Object,
  stats: Object
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
    let sort1 = options.sort1 === "views" || options.sort1 === "subscribers" || options.sort1 === "videos" ? `stats.${options.sort1}` : `user.${options.sort1}`;
    let sort2 = options.sort2 === "views" || options.sort2 === "subscribers" || options.sort2 === "videos" ? `stats.${options.sort2}` : `user.${options.sort2}`;
    let documents = await User.find({
      $or: [
        { "user.name": { $regex: options.search, $options: "i" } },
        { "user.id": { $regex: options.search, $options: "i" } },
      ],
    })
      .sort({
        [sort1]: options.order1 === "asc" ? 1 : -1,
        [sort2]: options.order2 === "asc" ? 1 : -1,
      }).limit(options.limit).skip(options.offset);
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
    const count = await User.countDocuments();
    const totalSubscribers = await User.aggregate([{ $group: { _id: null, total: { $sum: "$stats.subscribers" } } }]);
    const totalViews = await User.aggregate([{ $group: { _id: null, total: { $sum: "$stats.views" } } }]);
    const totalVideos = await User.aggregate([{ $group: { _id: null, total: { $sum: "$stats.videos" } } }]);
    return {
      count: count,
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
  checkIds
};