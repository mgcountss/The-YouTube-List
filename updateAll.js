import db from "./functions/db.js";
import updateUser from "./functions/updateUser.js";
let channels = await db.getall()
updateUser(null, channels.map(channel => channel.id))
process.exit(0)