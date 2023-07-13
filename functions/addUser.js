import db from './db.js';
import axios from 'axios';
import getKey from './getKey.js';
import searchChannel from './searchChannel.js';
import updateUser from './updateUser.js';

const addUser = async (userId) => {
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
                    console.log(error);
                    return {
                        error: true,
                        message: 'Error while adding user, this error was not your fault!'
                    }
                });
        }
        if (await db.find('id', userId)) {
            updateUser(userId);
            return {
                error: true,
                message: 'User already exists'
            }
        }
        return axios.get(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${userId}&key=${getKey()}`)
            .then(async (response) => {
                if (response.data.error) {
                    console.log(response.data.error);
                    return {
                        error: true,
                        message: 'Error while adding user, this error was not your fault!'
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
                            views: parseInt(response.data.items[0].statistics.viewCount),
                            subscribers: parseInt(response.data.items[0].statistics.subscriberCount),
                            videos: parseInt(response.data.items[0].statistics.videoCount)
                        }
                    });
                    return {
                        error: false,
                        message: 'User added successfully'
                    }
                }

            })
            .catch((error) => {
                console.error(error);
                return {
                    error: true,
                    message: 'Error while updating user, this error was not your fault!'
                }
            });
    }
};

export default addUser;