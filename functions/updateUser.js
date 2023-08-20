
import db from './db.js';
import axios from 'axios';
import getKey from './getKey.js';

const updateUser = async (userId, ids, fail) => {
    if (userId) {
        let user = await db.find('id', userId);
        if (user) {
            let link = `https://yt.lemnoslife.com/noKey/channels?part=snippet,statistics,brandingSettings&id=${userId}`;
            if (!fail) {
                link = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${userId}&key=${getKey()}`;
            }
            try {
                const response = await axios.get(link);
                if (!response.data.error) {
                    if (response.data.items && response.data.items.length > 0) {
                        const item = response.data.items[0];
                        const historyKeys = Object.keys(user.history);

                        user.history[new Date().toString().split(' ').slice(0, 4).join('_')] = {
                            views: parseInt(item.statistics.viewCount),
                            subscribers: parseInt(item.statistics.subscriberCount),
                            videos: parseInt(item.statistics.videoCount),
                            name: item.snippet.title,
                        };

                        user.id = item.id;
                        user.updated = Date.now();
                        user.user = {
                            name: item.snippet.title,
                            logo: item.snippet.thumbnails.default.url,
                            banner: item.brandingSettings?.image?.bannerExternalUrl || item.snippet.thumbnails.default.url,
                            country: item.brandingSettings?.channel?.country,
                            joined: item.snippet.publishedAt,
                            description: item.snippet.description,
                        };
                        user.stats = {
                            views: parseInt(item.statistics.viewCount || 0),
                            subscribers: parseInt(item.statistics.subscriberCount || 0),
                            videos: parseInt(item.statistics.videoCount || 0),
                        };
                        user.history = user.history;
                        user.gains = {
                            subscribers: {
                                daily: historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 2]].subscribers : 0,
                                weekly: historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 8]].subscribers : 0,
                                monthly: historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 31]].subscribers : 0,
                                yearly: historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 366]].subscribers : 0,
                            },
                            views: {
                                daily: historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 2]].views : 0,
                                weekly: historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 8]].views : 0,
                                monthly: historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 31]].views : 0,
                                yearly: historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 366]].views : 0,
                            },
                            videos: {
                                daily: historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 2]].videos : 0,
                                weekly: historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 8]].videos : 0,
                                monthly: historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 31]].videos : 0,
                                yearly: historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 366]].videos : 0,
                            },
                        };

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
            console.log(`fetched`);
            try {
                const link = `https://yt.lemnoslife.com/noKey/channels?part=snippet,statistics,brandingSettings&id=${groups[i].join(',')}`;
                if (!fail) {
                    const linkWithKey = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,brandingSettings&id=${groups[i].join(',')}&key=${getKey()}`;
                    const response = await axios.get(linkWithKey);

                    if (!response.data.error) {
                        if (response.data.items && response.data.items.length > 0) {
                            for (const item of response.data.items) {
                                if (item.id) {
                                    let user = await db.find('id', item.id);
                                    if (!user) {
                                        user = {
                                            id: item.id,
                                            created: Date.now(),
                                            user: {
                                                name: item.snippet.title,
                                                logo: item.snippet.thumbnails.default.url,
                                                banner: item.brandingSettings?.image?.bannerExternalUrl || item.snippet.thumbnails.default.url,
                                                country: item.brandingSettings?.channel?.country,
                                                joined: item.snippet.publishedAt,
                                                description: item.snippet.description,
                                            },
                                            stats: {
                                                views: parseInt(item.statistics.viewCount || 0),
                                                subscribers: parseInt(item.statistics.subscriberCount || 0),
                                                videos: parseInt(item.statistics.videoCount || 0),
                                            },
                                            history: {},
                                            gains: {
                                                subscribers: {
                                                    daily: 0,
                                                    weekly: 0,
                                                    monthly: 0,
                                                    yearly: 0,
                                                },
                                                views: {
                                                    daily: 0,
                                                    weekly: 0,
                                                    monthly: 0,
                                                    yearly: 0,
                                                },
                                                videos: {
                                                    daily: 0,
                                                    weekly: 0,
                                                    monthly: 0,
                                                    yearly: 0,
                                                },
                                            },
                                        };
                                    }

                                    if (!user.history) {
                                        user.history = {};
                                    }

                                    user.history[new Date().toString().split(' ').slice(0, 4).join('_')] = {
                                        views: parseInt(item.statistics.viewCount),
                                        subscribers: parseInt(item.statistics.subscriberCount),
                                        videos: parseInt(item.statistics.videoCount),
                                        name: item.snippet.title,
                                    };

                                    const historyKeys = Object.keys(user.history);

                                    user.updated = Date.now();
                                    user.gains.subscribers.daily = historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 2]].subscribers : 0;
                                    user.gains.subscribers.weekly = historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 8]].subscribers : 0;
                                    user.gains.subscribers.monthly = historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 31]].subscribers : 0;
                                    user.gains.subscribers.yearly = historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].subscribers - user.history[historyKeys[historyKeys.length - 366]].subscribers : 0;

                                    user.gains.views.daily = historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 2]].views : 0;
                                    user.gains.views.weekly = historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 8]].views : 0;
                                    user.gains.views.monthly = historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 31]].views : 0;
                                    user.gains.views.yearly = historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].views - user.history[historyKeys[historyKeys.length - 366]].views : 0;

                                    user.gains.videos.daily = historyKeys.length > 1 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 2]].videos : 0;
                                    user.gains.videos.weekly = historyKeys.length > 7 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 8]].videos : 0;
                                    user.gains.videos.monthly = historyKeys.length > 30 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 31]].videos : 0;
                                    user.gains.videos.yearly = historyKeys.length > 365 ? user.history[historyKeys[historyKeys.length - 1]].videos - user.history[historyKeys[historyKeys.length - 366]].videos : 0;

                                    await db.update(item.id, user);
                                }
                            }
                        }
                    } else {
                        console.log('as');
                    }
                } else if (response.data.error.code == 403) {
                    console.log('e');
                    await updateUser(null, groups[i]);
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
