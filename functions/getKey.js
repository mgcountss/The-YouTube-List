import dotenv from 'dotenv';
dotenv.config();
function getKey() {
    let keys = process.env.YOUTUBE_API_KEYS.split(',');
    let key = keys[Math.floor(Math.random() * keys.length)];
    return key;
}
export default getKey;