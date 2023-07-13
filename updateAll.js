import db from "./functions/db.js";
import updateUser from "./functions/updateUser.js";
let channels = await db.getall()
let index = 0
updateUserManager()
async function updateUserManager() {
    try {
        if (index < channels.length) {
            await updateUser(channels[index].id)
            index++
            updateUserManager()
        } else {
            console.log("Done")
            process.exit()
        }
    } catch (e) {
        index++
        updateUserManager()
    }
}