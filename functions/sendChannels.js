import db from './db.js';
const sendChannels = async (options) => {
    return db.getall2(options);
};

export default sendChannels;