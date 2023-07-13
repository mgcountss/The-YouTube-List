import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect('mongodb://'+process.env.MONGO_URL, {
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
    let newUser = new User(json);
    await newUser.save();
  } catch (error) {}
};

const update = async (id, value) => {
  try {
    await User.updateOne({ id: id }, { $set: value });
  } catch (error) {}
}

const find = async (type, value) => {
  try {
    const document = await User.findOne({ [type]: value });
    if (document) return document;
    return null;
  } catch (error) {}
};

const getall = async () => {
  try {
    const documents = await User.find({}, { id: 1, _id: 1 });
    return documents;
  } catch (error) {}
};

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
  } catch (error) {}
};

const find2 = async (json) => {
  try {
    const documents = await User.find(json);
    return documents;
  } catch (error) {}
};

const getTotalDocuments = async () => {
  try {
    const count = await User.countDocuments();
    return count;
  } catch (error) {}
};

export default {
  add,
  find,
  find2,
  getall,
  update,
  getall2,
  getTotalDocuments
};