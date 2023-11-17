import db from './db.js';
import axios from 'axios';
import getKey from './getKey.js';

const updateUser = async (userId, ids, failed) => {
    if (userId) {
        let user = await db.find(userId);
        if (user) {
            let link = `https://yt.lemnoslife.com/noKey/channels?part=snippet,statistics,brandingSettings&id=${userId}`;
            if (!failed) {
                link = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${userId}&key=${getKey()}`;
            }
            try {
                const response = await axios.get(link);
                if (!response.data.error) {
                    if (response.data.items && response.data.items.length > 0) {
                        const item = response.data.items[0];
                        user.history[new Date().toString().split(' ').slice(0, 4).join('_')] = {
                            views: parseInt(item.statistics.viewCount),
                            subscribers: parseInt(item.statistics.subscriberCount),
                            videos: parseInt(item.statistics.videoCount),
                            name: item.snippet.title,
                        };
                        user.id = item.id;
                        user.updated = Date.now();
                        let country = item.brandingSettings?.channel?.country;
                        if (!country) {
                            country = "";
                        }
                        user.user = {
                            name: item.snippet.title,
                            logo: item.snippet.thumbnails.default.url,
                            banner: item.brandingSettings?.image?.bannerExternalUrl || item.snippet.thumbnails.default.url,
                            country: country,
                            joined: new Date(item.snippet.publishedAt).getTime(),
                            description: item.snippet.description,
                        };
                        user.stats = {
                            views: parseInt(item.statistics.viewCount || 0),
                            subscribers: parseInt(item.statistics.subscriberCount || 0),
                            videos: parseInt(item.statistics.videoCount || 0),
                        };
                        user.history = user.history;
                        db.update(userId, user);
                    }
                } else if (response.data.error.code == 403) {
                    await updateUser(userId);
                } else {
                    return {
                        error: true,
                        message: 'Error while updating user, this error was not your fault!, 3',
                    };
                }
            } catch (error) {
                if (error.response?.status == 403) {
                    await updateUser(userId);
                }
            }
            return {
                error: false,
                message: 'Updating user',
            };
        }
        return {
            error: true,
            message: 'Unable to find user',
        };
    } else {
        let groups = [];
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
                if (!response.data.error) {
                    if (response.data.items && response.data.items.length > 0) {
                        for (const item of response.data.items) {
                            if (item.id) {
                                let user = await db.find(item.id);
                                user.history[new Date().toString().split(' ').slice(0, 4).join('_')] = {
                                    views: parseInt(item.statistics.viewCount),
                                    subscribers: parseInt(item.statistics.subscriberCount),
                                    videos: parseInt(item.statistics.videoCount),
                                    name: item.snippet.title,
                                };
                                user.id = item.id;
                                user.updated = Date.now();
                                let country = item.brandingSettings?.channel?.country;
                                if (!country) {
                                    country = "";
                                }
                                user.user = {
                                    name: item.snippet.title,
                                    logo: item.snippet.thumbnails.default.url,
                                    banner: item.brandingSettings?.image?.bannerExternalUrl || item.snippet.thumbnails.default.url,
                                    country: country,
                                    joined: new Date(item.snippet.publishedAt).getTime(),
                                    description: item.snippet.description,
                                };
                                user.stats = {
                                    views: parseInt(item.statistics.viewCount || 0),
                                    subscribers: parseInt(item.statistics.subscriberCount || 0),
                                    videos: parseInt(item.statistics.videoCount || 0),
                                };
                                user.history = user.history;
                                await db.update(userId, user);
                            }
                        }
                    }
                }
            } catch (error) {
                if (error.response?.status == 403) {
                    await updateUser(null, groups[i]);
                }
            }
        }
    }
    return {
        error: false,
        message: 'Users updated successfully',
    };
}

export default updateUser;
