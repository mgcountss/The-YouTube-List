import db from './db.js';
import axios from 'axios';
import getKey from './getKey.js';

const updateUser = async (userId) => {
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
                }
                return {
                    error: true,
                    message: 'Error while updating user, this error was not your fault!'
                }
            })
            .catch((error) => {
                console.log(error);
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
};

export default updateUser;