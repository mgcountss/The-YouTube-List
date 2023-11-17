import searcher from './search.js';
import db from './db.js';

const searchChannel = async (search) => {
    return searcher.GetListByKeyword(search, true, 15, [{ type: "channel" }])
        .then(async (response) => {
            let ids = response.items.map((item) => item.id);
            if (ids.length == 0) return { error: true, message: 'No channel found', channels: [] };
            let channels = await db.removeDuplicates(ids);
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