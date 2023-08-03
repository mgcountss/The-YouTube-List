import db from './db.js';
import axios from 'axios';
import getKey from './getKey.js';
import searchChannel from './searchChannel.js';
import updateUser from './updateUser.js';

const addUser = async (userId, ids, failed) => {
    if (userId) {
        if (((!userId.startsWith('@')) && ((!userId.startsWith('UC')) || (!userId.length == 24)))) {
            let r = await searchChannel(userId);
            return r;
        } else if (await db.find('id', userId)) {
            updateUser(userId);
            return {
                error: true,
                message: 'User already exists'
            }
        } else {
            if (userId.startsWith('@')) {
                userId = await axios.get('https://yt.lemnoslife.com/channels?handle=' + userId)
                    .then(async (response) => {
                        if (response.data.items) {
                            return response.data.items[0].id
                        }
                        return {
                            error: true,
                            message: 'Error while adding user, this error was not your fault!'
                        }
                    })
                    .catch((error) => {
                        return {
                            error: true,
                            message: 'Error while adding user, this error was not your fault!'
                        }
                    });
            }
            if (await db.find('id', userId)) {
                return {
                    error: true,
                    message: 'User already exists'
                }
            }
            let link = `https://yt.sfmg.repl.co/noKey/channels?part=snippet,statistics,brandingSettings&id=${userId}`
            if (!failed) {
                link`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${userId}&key=${getKey()}`
            }
            return axios.get()
                .then(async (response) => {
                    if (response.data.error) {
                        if (response.data.error.code == 403) {
                            addUser(userId);
                        } else {
                            return {
                                error: true,
                                message: 'Error while adding user, this error was not your fault!'
                            }
                        }
                    }
                    if (!response.data.items) {
                        return {
                            error: true,
                            message: 'No channel found with that ID'
                        }
                    } else {
                        db.add({
                            id: response.data.items[0].id,
                            created: Date.now(),
                            updated: Date.now(),
                            deleted: {
                                deleted: false,
                                date: null
                            },
                            user: {
                                name: response.data.items[0].snippet.title,
                                logo: response.data.items[0].snippet.thumbnails.default.url,
                                banner: response.data.items[0].brandingSettings.image ? response.data.items[0].brandingSettings.image.bannerExternalUrl : response.data.items[0].snippet.thumbnails.default.url,
                                country: response.data.items[0].brandingSettings.channel.country,
                                joined: response.data.items[0].snippet.publishedAt,
                                description: response.data.items[0].snippet.description,
                                deleted: {
                                    deleted: false,
                                    date: null
                                }
                            },
                            stats: {
                                views: parseInt(response.data.items[0].statistics.viewCount ? response.data.items[0].statistics.viewCount : 0),
                                subscribers: parseInt(response.data.items[0].statistics.subscriberCount ? response.data.items[0].statistics.subscriberCount : 0),
                                videos: parseInt(response.data.items[0].statistics.videoCount ? response.data.items[0].statistics.videoCount : 0)
                            },
                            history: {
                                [new Date().toString().split(' ').slice(0, 4).join(' ')]: {
                                    views: parseInt(response.data.items[0].statistics.viewCount ? response.data.items[0].statistics.viewCount : 0),
                                    subscribers: parseInt(response.data.items[0].statistics.subscriberCount ? response.data.items[0].statistics.subscriberCount : 0),
                                    videos: parseInt(response.data.items[0].statistics.videoCount ? response.data.items[0].statistics.videoCount : 0),
                                    name: response.data.items[0].snippet.title
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
                        }
                    }
                })
                .catch((error) => {
                    if (error.response.status == 403) {
                        addUser(userId, null, true);
                        return {
                            error: false,
                            message: 'User added successfully',
                            quota: true
                        }
                    } else {
                        return {
                            error: true,
                            message: 'Error while updating user, this error was not your fault!'
                        }
                    }
                });
        }
    } else {
        let groups = [];
        ids = await db.checkIds(ids);
        for (let i = 0; i < ids.length; i += 50) {
            groups.push(ids.slice(i, i + 50));
        }
        for (let i = 0; i < groups.length; i++) {
            console.log(`https://yt.sfmg.repl.co/noKey/channels?part=snippet,statistics,brandingSettings&id=${groups[i]}`);
            try {
                let link = `https://yt.sfmg.repl.co/noKey/channels?part=snippet,statistics,brandingSettings&id=${groups[i]}`
                if (!failed) {
                    link = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${groups[i]}&key=${getKey()}`
                }
                await axios.get(link)
                    .then(async (response) => {
                        if (response.data.error) {
                            if (response.data.error.code == 403) {
                                addUser(null, groups[i].split(','), true);
                            } else {
                                return {
                                    error: true,
                                    message: 'Error while updating user, this error was not your fault!'
                                }
                            }
                        }
                        if (!response.data.items) {
                        } else {
                            for (let i = 0; i < response.data.items.length; i++) {
                                if (await db.find('id', response.data.items[i].id)) {
                                    updateUser(response.data.items[i].id);
                                } else {
                                    let dateString = new Date().toString().split(' ').slice(0, 4).join(' ');
                                    db.add({
                                        id: response.data.items[i].id,
                                        created: Date.now(),
                                        updated: Date.now(),
                                        deleted: {
                                            deleted: false,
                                            date: null
                                        },
                                        user: {
                                            name: response.data.items[i].snippet.title,
                                            logo: response.data.items[i].snippet.thumbnails.default.url,
                                            banner: response.data.items[i].brandingSettings.image ? response.data.items[i].brandingSettings.image.bannerExternalUrl : response.data.items[i].snippet.thumbnails.default.url,
                                            country: response.data.items[i].brandingSettings.channel.country,
                                            joined: response.data.items[i].snippet.publishedAt,
                                            description: response.data.items[i].snippet.description,
                                            deleted: {
                                                deleted: false,
                                                date: null
                                            }
                                        },
                                        stats: {
                                            views: parseInt(response.data.items[i].statistics.viewCount ? response.data.items[i].statistics.viewCount : 0),
                                            subscribers: parseInt(response.data.items[i].statistics.subscriberCount ? response.data.items[i].statistics.subscriberCount : 0),
                                            videos: parseInt(response.data.items[i].statistics.videoCount ? response.data.items[i].statistics.videoCount : 0)
                                        },
                                        history: {
                                            [dateString]: {
                                                views: parseInt(response.data.items[i].statistics.viewCount ? response.data.items[i].statistics.viewCount : 0),
                                                subscribers: parseInt(response.data.items[i].statistics.subscriberCount ? response.data.items[i].statistics.subscriberCount : 0),
                                                videos: parseInt(response.data.items[i].statistics.videoCount ? response.data.items[i].statistics.videoCount : 0),
                                                name: response.data.items[i].snippet.title
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
                    }).catch((error) => {
                        if (error.response.status == 403) {
                            addUser(null, groups[i].split(','), true);
                        }
                    });
            } catch (error) {
                console.error(error);
            }
        }
    }
};

export default addUser;