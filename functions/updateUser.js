import db from './db.js';
import axios from 'axios';
import getKey from './getKey.js';

const updateUser = async (userId, ids) => {
    if (userId) {
        let user = await db.find('id', userId)
        if (user) {
            return await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${userId}&key=${getKey()}`)
                .then(async (response) => {
                    if (!response.data.error) {
                        if (response.data.items) {
                            if (response.data.items.length === 0) {
                                return {
                                    error: true,
                                    message: 'Unable to find user'
                                }
                            }
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
                                    views: parseInt(response.data.items[0].statistics.viewCount),
                                    subscribers: parseInt(response.data.items[0].statistics.subscriberCount),
                                    videos: parseInt(response.data.items[0].statistics.videoCount)
                                }
                            }
                            db.update(userId, user);
                            return {
                                error: false,
                                message: 'User updated successfully'
                            }
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
                    return {
                        error: true,
                        message: 'Error while updating user, this error was not your fault!'
                    }
                });
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
            await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${groups[i].join(',')}&key=${getKey()}`)
                .then(async (response) => {
                    if (!response.data.error) {
                        if (response.data.items) {
                            for (let j = 0; j < response.data.items.length; j++) {
                                if (response.data.items[j].id) {
                                    let user = await db.find('id', response.data.items[j].id);
                                    if (user) {
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
                                                views: parseInt(response.data.items[j].statistics.viewCount),
                                                subscribers: parseInt(response.data.items[j].statistics.subscriberCount),
                                                videos: parseInt(response.data.items[j].statistics.videoCount)
                                            }
                                        }
                                        db.update(response.data.items[j].id, user);
                                    }
                                }
                            }
                        }
                    } else if (response.data.error.code == 403) {
                        updateUser(null, groups[i]);
                    }
                })
                .catch((error) => {
                    if (error.response.status == 403) {
                        updateUser(null, groups[i]);
                    }
                });
        }
    }
};

export default updateUser;