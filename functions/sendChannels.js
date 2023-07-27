import db from './db.js';
const sendChannels = async (options) => {
    options.forEach(option => {
        if (!option.gains) {
            option.gains = {
                gains: {
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
                }
            }
        }
    })
    return db.getall2(options);
};

export default sendChannels;