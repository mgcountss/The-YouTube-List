import db from "./functions/db.js";
import updateUser from "./functions/updateUser.js";
let channels = await db.getAllIds()
await updateUser(null, channels.map(channel => channel.id))
console.log('done')
process.exit(0)