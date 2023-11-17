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
        channel.stats = {
            subscribers: channel.subscribers,
            views: channel.views,
            videos: channel.videos
        }
        channel.user = {
            name: channel.name,
            description: channel.description,
            logo: channel.logo,
            banner: channel.banner,
            country: channel.country,
            joined: channel.joined
        }
        delete channel.subscribers;
        delete channel.views;
        delete channel.videos;
        delete channel.name;
        delete channel.description;
        delete channel.logo;
        delete channel.banner;
        delete channel.country;
        delete channel.joined;
    })
    return {
        channels: response.documents,
        total: response.total,
        limit: response.limit,
        offset: response.offset
    };
};

export default sendChannels;