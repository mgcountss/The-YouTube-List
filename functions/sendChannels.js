import db from './db.js';
const sendChannels = async (options) => {
    let channels = await db.getall2(options);
    channels.forEach(channel => {
        if (!channel.gains) {
            channel.gains = {
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
    })
    return channels;
};

export default sendChannels;