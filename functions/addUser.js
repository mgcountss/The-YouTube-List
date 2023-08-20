import db from './db.js';
import axios from 'axios';
import getKey from './getKey.js';
import searchChannel from './searchChannel.js';
import updateUser from './updateUser.js';

const addUser = async (userId, ids, failed) => {
    if (userId) {
        if ((!userId.startsWith('@')) && (!userId.startsWith('UC') || (userId.length !== 24))) {
            let r = await searchChannel(userId);
            return r;
        } else if (await db.find('id', userId)) {
            updateUser(userId);
            return {
                error: true,
                message: 'User already exists'
            };
        } else {
            if (userId.startsWith('@')) {
                try {
                    const response = await axios.get('https://yt.lemnoslife.com/channels?handle=' + userId);
                    if (response.data.items) {
                        userId = response.data.items[0].id;
                    } else {
                        return {
                            error: true,
                            message: 'Error while adding user, this error was not your fault!'
                        };
                    }
                } catch (error) {
                    return {
                        error: true,
                        message: 'Error while adding user, this error was not your fault!'
                    };
                }
            }
            if (await db.find('id', userId)) {
                return {
                    error: true,
                    message: 'User already exists'
                };
            }
            let link = `hhttps://yt.lemnoslife.com/noKey/channels?part=snippet,statistics,brandingSettings&id=${userId}`;
            if (!failed) {
                link = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${userId}&key=${getKey()}`;
            }
            try {
                const response = await axios.get(link);
                if (response.data.error) {
                    if (response.data.error.code === 403) {
                        return {
                            error: false,
                            message: 'User added successfully',
                            quota: true
                        };
                    } else {
                        return {
                            error: true,
                            message: 'Error while adding user, this error was not your fault!'
                        };
                    }
                }
                if (!response.data.items) {
                    return {
                        error: true,
                        message: 'No channel found with that ID'
                    };
                } else {
                    const data = response.data.items[0];
                    const dateString = new Date().toString().split(' ').slice(0, 4).join(' ');
                    db.add({
                        id: data.id,
                        created: Date.now(),
                        updated: Date.now(),
                        deleted: {
                            deleted: false,
                            date: null
                        },
                        user: {
                            name: data.snippet.title,
                            logo: data.snippet.thumbnails.default.url,
                            banner: data.brandingSettings.image ? data.brandingSettings.image.bannerExternalUrl : data.snippet.thumbnails.default.url,
                            country: data.brandingSettings?.channel?.country,
                            joined: data.snippet.publishedAt,
                            description: data.snippet.description,
                            deleted: {
                                deleted: false,
                                date: null
                            }
                        },
                        stats: {
                            views: parseInt(data.statistics.viewCount ? data.statistics.viewCount : 0),
                            subscribers: parseInt(data.statistics.subscriberCount ? data.statistics.subscriberCount : 0),
                            videos: parseInt(data.statistics.videoCount ? data.statistics.videoCount : 0)
                        },
                        history: {
                            [dateString]: {
                                views: parseInt(data.statistics.viewCount ? data.statistics.viewCount : 0),
                                subscribers: parseInt(data.statistics.subscriberCount ? data.statistics.subscriberCount : 0),
                                videos: parseInt(data.statistics.videoCount ? data.statistics.videoCount : 0),
                                name: data.snippet.title
                            }
                        },
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
                    });
                    return {
                        error: false,
                        message: 'User added successfully'
                    };
                }
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    addUser(userId, ids, true);
                    return {
                        error: false,
                        message: 'User added successfully',
                        quota: true
                    };
                } else {
                    return {
                        error: true,
                        message: 'Error while adding user, this error was not your fault!'
                    };
                }
            }
        }
    } else {
        let groups = [];
        ids = await db.checkIds(ids);
        for (let i = 0; i < ids.length; i += 50) {
            groups.push(ids.slice(i, i + 50));
        }
        for (let i = 0; i < groups.length; i++) {
            try {
                let link = `https://yt.lemnoslife.com/noKey/channels?part=snippet,statistics,brandingSettings&id=${groups[i]}`;
                if (!failed) {
                    link = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${groups[i]}&key=${getKey()}`;
                }
                const response = await axios.get(link);
                if (response.data.error) {
                    if (response.data.error.code === 403) {
                        return {
                            error: false,
                            message: 'User added successfully',
                            quota: true
                        };
                    } else {
                        addUser(userId, ids, true);
                        return {
                            error: true,
                            message: 'Error while updating user, this error was not your fault!, 1'
                        };
                    }
                }
                if (!response.data.items) {
                    continue;
                } else {
                    for (let i = 0; i < response.data.items.length; i++) {
                        const data = response.data.items[i];
                        if (await db.find('id', data.id)) {
                            updateUser(data.id);
                        } else {
                            const dateString = new Date().toString().split(' ').slice(0, 4).join(' ');
                            db.add({
                                id: data.id,
                                created: Date.now(),
                                updated: Date.now(),
                                deleted: {
                                    deleted: false,
                                    date: null
                                },
                                user: {
                                    name: data.snippet.title,
                                    logo: data.snippet.thumbnails.default.url,
                                    banner: data.brandingSettings.image ? data.brandingSettings.image.bannerExternalUrl : data.snippet.thumbnails.default.url,
                                    country: data.brandingSettings?.channel?.country,
                                    joined: data.snippet.publishedAt,
                                    description: data.snippet.description,
                                    deleted: {
                                        deleted: false,
                                        date: null
                                    }
                                },
                                stats: {
                                    views: parseInt(data.statistics.viewCount ? data.statistics.viewCount : 0),
                                    subscribers: parseInt(data.statistics.subscriberCount ? data.statistics.subscriberCount : 0),
                                    videos: parseInt(data.statistics.videoCount ? data.statistics.videoCount : 0)
                                },
                                history: {
                                    [dateString]: {
                                        views: parseInt(data.statistics.viewCount ? data.statistics.viewCount : 0),
                                        subscribers: parseInt(data.statistics.subscriberCount ? data.statistics.subscriberCount : 0),
                                        videos: parseInt(data.statistics.videoCount ? data.statistics.videoCount : 0),
                                        name: data.snippet.title
                                    }
                                },
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
                            });
                        }
                    }
                }
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    return {
                        error: false,
                        message: 'User added successfully',
                        quota: true
                    };
                } else {
                    return {
                        error: true,
                        message: 'Error while updating user, this error was not your fault!, 2'
                    };
                }
            }
        }
    }
};

export default addUser;