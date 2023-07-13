import youtubesearchapi from 'youtube-search-api'
import db from './db.js';

const searchChannel = async (search) => {
    return youtubesearchapi.GetListByKeyword(search, true, 15, [{ type: "channel" }])
        .then(async (response) => {
            let ids = response.items.map((item) => item.id);
            let channels = await db.find2({ id: { $in: ids } })
            channels = channels.map((channel) => channel.id);
            response.items.forEach((item) => {
                item.added = channels.includes(item.id);
            });
            return {
                error: false,
                message: 'Channel(s) found',
                channels: response.items
            };
        })
        .catch((error) => {
            console.error(error);
            return {
                error: true,
                message: 'No channel found',
                channels: [],
                errorObj: error
            }
        })
};

export default searchChannel;