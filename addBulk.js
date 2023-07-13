import addUser from "./functions/addUser.js";
let ids = process.argv.slice(2);
ids = ids.join(' ').split(' ');
console.log(ids);
for (let i = 0; i < ids.length; i++) {
    if (!ids[i].startsWith('UC')) {
        ids.splice(i, 1);
        i -= 1;
    } else if (ids[i].length != 24) {
        ids.splice(i, 1);
        i -= 1;
    } else {
        addUser(ids[i]);
    }
}
process.exit();