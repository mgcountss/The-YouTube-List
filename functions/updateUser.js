import db from './db.js';
import axios from 'axios';
import getKey from './getKey.js';

const updateUser = async (userId, ids) => {
    if (userId) {
        let user = await db.find('id', userId)
        if (user) {
            await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${userId}&key=${getKey()}`)
                .then(async (response) => {
                    if (!response.data.error) {
                        if (response.data.items) {
                            user.history[new Date().toString().split(' ').slice(0, 4).join('_')] = {
                                views: parseInt(response.data.items[0].statistics.viewCount),
                                subscribers: parseInt(response.data.items[0].statistics.subscriberCount),
                                videos: parseInt(response.data.items[0].statistics.videoCount),
                                name: response.data.items[0].snippet.title
                            }
                            let historyKeys = Object.keys(user.history);
                            user = {
                                id: response.data.items[0].id,
                                created: user.created,
                                updated: Date.now(),
                                deleted: user.deleted,
                                user: {
                                    name: response.data.items[0].snippet.title,
                                    logo: response.data.items[0].snippet.thumbnails.default.url,
                                    banner: response.data.items[0].brandingSettings.image ? response.data.items[0].brandingSettings.image.bannerExternalUrl : response.data.items[0].snippet.thumbnails.default.url,
                                    country: response.data.items[0].brandingSettings.channel.country,
                                    joined: response.data.items[0].snippet.publishedAt,
                                    description: response.data.items[0].snippet.description
                                },
                                stats: {
                                    views: parseInt(response.data.items[0].statistics.viewCount ? response.data.items[0].statistics.viewCount : 0),
                                    subscribers: parseInt(response.data.items[0].statistics.subscriberCount ? response.data.items[0].statistics.subscriberCount : 0),
                                    videos: parseInt(response.data.items[0].statistics.videoCount ? response.data.items[0].statistics.videoCount : 0),
                                },
                                history: user.history,
                                gains: {
                                    subscribers: {
                                        daily: historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 2]].subscribers : 0,
                                        weekly: historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 8]].subscribers : 0,
                                        monthly: historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 31]].subscribers : 0,
                                        yearly: historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 366]].subscribers : 0
                                    },
                                    views: {
                                        daily: historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 2]].views : 0,
                                        weekly: historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 8]].views : 0,
                                        monthly: historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 31]].views : 0,
                                        yearly: historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 366]].views : 0
                                    },
                                    videos: {
                                        daily: historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 2]].videos : 0,
                                        weekly: historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 8]].videos : 0,
                                        monthly: historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 31]].videos : 0,
                                        yearly: historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 366]].videos : 0
                                    }
                                }
                            }
                            db.update(userId, user);
                        }
                    } else if (response.data.error.code == 403) {
                        updateUser(userId);
                    } else {
                        return {
                            error: true,
                            message: 'Error while updating user, this error was not your fault!'
                        }
                    }
                })
                .catch((error) => {
                    if (error.response.status == 403) {
                        updateUser(userId);
                    }
                });
            return {
                error: false,
                message: 'Updating user'
            }
        }
        return {
            error: true,
            message: 'Unable to find user'
        }
    } else {
        let groups = [];
        for (let i = 0; i < ids.length; i += 50) {
            groups.push(ids.slice(i, i + 50));
        }
        for (let i = 0; i < groups.length; i++) {
            console.log(`fetched`)
            try {
                await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${groups[i].join(',')}&key=${getKey()}`)
                    .then(async (response) => {
                        if (!response.data.error) {
                            if (response.data.items) {
                                for (let j = 0; j < response.data.items.length; j++) {
                                    if (response.data.items[j].id) {
                                        let user = await db.find('id', response.data.items[j].id);
                                        if (user) {
                                            if (!user.history) user.history = {}
                                            user.history[new Date().toString().split(' ').slice(0, 4).join('_')] = {
                                                views: parseInt(response.data.items[j].statistics.viewCount),
                                                subscribers: parseInt(response.data.items[j].statistics.subscriberCount),
                                                videos: parseInt(response.data.items[j].statistics.videoCount),
                                                name: response.data.items[j].snippet.title
                                            }
                                            let historyKeys = Object.keys(user.history);
                                            user = {
                                                id: response.data.items[j].id,
                                                created: user.created,
                                                updated: Date.now(),
                                                deleted: user.deleted,
                                                user: {
                                                    name: response.data.items[j].snippet.title,
                                                    logo: response.data.items[j].snippet.thumbnails.default.url,
                                                    banner: response.data.items[j].brandingSettings.image ? response.data.items[j].brandingSettings.image.bannerExternalUrl : response.data.items[j].snippet.thumbnails.default.url,
                                                    country: response.data.items[j].brandingSettings.channel.country,
                                                    joined: response.data.items[j].snippet.publishedAt,
                                                    description: response.data.items[j].snippet.description
                                                },
                                                stats: {
                                                    views: parseInt(response.data.items[j].statistics.viewCount ? response.data.items[j].statistics.viewCount : 0),
                                                    subscribers: parseInt(response.data.items[j].statistics.subscriberCount ? response.data.items[j].statistics.subscriberCount : 0),
                                                    videos: parseInt(response.data.items[j].statistics.videoCount ? response.data.items[j].statistics.videoCount : 0),
                                                },
                                                history: user.history,
                                                gains: {
                                                    subscribers: {
                                                        daily: historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 2]].subscribers : 0,
                                                        weekly: historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 8]].subscribers : 0,
                                                        monthly: historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 31]].subscribers : 0,
                                                        yearly: historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 366]].subscribers : 0
                                                    },
                                                    views: {
                                                        daily: historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 2]].views : 0,
                                                        weekly: historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 8]].views : 0,
                                                        monthly: historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 31]].views : 0,
                                                        yearly: historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 366]].views : 0
                                                    },
                                                    videos: {
                                                        daily: historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 2]].videos : 0,
                                                        weekly: historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 8]].videos : 0,
                                                        monthly: historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 31]].videos : 0,
                                                        yearly: historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 366]].videos : 0
                                                    }
                                                }
                                            }
                                            db.update(response.data.items[j].id, user);
                                        }
                                    }
                                }
                            } else {
                                console.log('as')
                            }
                        } else if (response.data.error.code == 403) {
                            console.log('e')
                            updateUser(null, groups[i]);
                        }
                    })
                    .catch((error) => {
                        if (error.response.status == 403) {
                            updateUser(null, groups[i]);
                        }
                    });
            } catch (error) {
                console.log(error)
            }
        }
        return {
            error: false,
            message: 'Users updated successfully'
        }
    }
};

export default updateUser;