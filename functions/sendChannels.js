import db from './db.js';
const sendChannels = async (options) => {
    let response = await db.getall(options);
    response.documents.forEach(channel => {
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
    return {
        channels: response.documents,
        total: response.total,
        limit: response.limit,
        offset: response.offset
    };
};

export default sendChannels;