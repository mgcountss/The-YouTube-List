let offset = 0;
let end = false;
let searching = false;
let sort1 = 'subscribers';
let sort2 = 'subscribers';
let order1 = 'desc';
let order2 = 'desc';
let filters = {};
async function getChannels() {
    fetch('/api/channels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ offset: offset, sort1: sort1, sort2: sort2, search: document.getElementById('search').value, order1: order1, order2: order2, filters: filters })
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById('loader').style.display = "none";
            if (!data.error) {
                if (data.length == 0) {
                    end = true;
                } else {
                    searching = false;
                    if (localStorage.getItem('mode') == 'list') {
                        data.channels.forEach((channel) => {
                            if (ids.includes(channel.id)) return;
                            ids.push(channel.id);
                            channels.push(channel);
                            document.getElementById('table').innerHTML += `<tr onclick="openMenu('${channel.id}')">
                    <td><img src="${channel.user.logo}" class="logo" alt="${channel.user.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}'s logo" onerror="imgError('logo', this)"></td>
                    <td><h3 class="name">${channel.user.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3></td>
                    <td><h4 class="subscribers">${channel.stats.subscribers.toLocaleString("en-US")}</h4></td>
                    <td><h4 class="views">${channel.stats.views.toLocaleString("en-US")}</h4></td>
                    <td><h4 class="videos">${channel.stats.videos.toLocaleString("en-US")}</h4></td>
                    <td><h4 class="country">${channel.user.country}</h4></td>
                    <td><h4 class="time">${new Date(channel.user.joined).toString().split('GMT')[0]}</h4></td>
                    <td><h4 class="gain24">${channel.gains.subscribers.daily.toLocaleString("en-US")}</h4></td>
                    <td><h4 class="gain24">${channel.gains.views.daily.toLocaleString("en-US")}</h4></td>
                    <td><h4 class="gain24">${channel.gains.videos.daily.toLocaleString("en-US")}</h4></td></tr>`
                            //`<td><textarea class="description">${channel.user.description}</textarea></td>`;
                        })
                    } else {
                        data.channels.forEach((channel) => {
                            if (ids.includes(channel.id)) return;
                            ids.push(channel.id);
                            channels.push(channel)
                            let card = document.createElement('div');
                            card.classList.add('card');
                            card.onclick = "openMenu('" + channel.id + "')";
                            document.querySelector('.channels').innerHTML += `<div class="card" onclick="openMenu('${channel.id}')">
                    <div class="banner" style="background-image: url('${channel.user.banner}')">
                        <img src="${channel.user.logo}" class="logo" alt="${channel.user.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}'s logo" onerror="imgError('logo', this)">
                    </div>
                    <div class="card-body">
                        <h3 class="name">${channel.user.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
                        <div class="stats">
                            <div>
                                <h4 class="subscribers">${channel.stats.subscribers.toLocaleString("en-US")}</h4>
                                <h5>Subscribers</h5>
                            </div>
                            <div>
                                <h4 class="views">${channel.stats.views.toLocaleString("en-US")}</h4>
                                <h5>Views</h5>
                            </div>
                            <div>
                                <h4 class="videos">${channel.stats.videos.toLocaleString("en-US")}</h4>
                                <h5>Videos</h5>
                            </div>
                            <div>
                                <h4 class="country">${channel.user.country}</h4>
                                <h5>Country</h5>
                            </div>
                            <div>
                                <h4 class="time">${new Date(channel.user.joined).toString().split('GMT')[0]}</h4>
                                <h5>Joined</h5>
                            </div>
                            <div>
                                <h4 class="gain24">${channel.gains.subscribers.daily.toLocaleString("en-US")}</h4>
                                <h5>Subscribers (24H Gain)</h5>
                            </div>
                            <div>
                                <h4 class="gain24">${channel.gains.views.daily.toLocaleString("en-US")}</h4>
                                <h5>Views (24H Gain)</h5>
                            </div>
                            <div>
                                <h4 class="gain24">${channel.gains.videos.daily.toLocaleString("en-US")}</h4>
                                <h5>Videos (24H Gain)</h5>
                            </div>
                        </div>
                    </div><hr>
                    <textarea class="description">${channel.user.description}</textarea>
                    </div>`;
                        });
                    }
                    if (document.getElementById('loadMore')) {
                        document.getElementById('loadMore').remove();
                    }
                    document.querySelector('.channels').innerHTML += "<button class='loadMore' id='loadMore' onclick='getChannels2()'>Load More</button>"
                }
            }
        }).catch(err => console.error(err));
}

function search() {
    offset = 0;
    ids = [];
    channels = [];
    end = false;
    if (localStorage.getItem('mode') == 'list') {
        document.getElementById('table').innerHTML = `<tr>
        <th>Logo</th>
        <th>Name</th>
        <th>Subscribers</th>
        <th>Views</th>
        <th>Videos</th>
        <th>Country</th>
        <th>Joined</th>
        <th>Subscribers (24H Gain)</th>
        <th>Views (24H Gain)</th>
        <th>Videos (24H Gain)</th>
    </tr>`;
    } else {
        document.querySelector('.channels').innerHTML = '';
    }
    sort1 = document.getElementById('sort1').value;
    sort2 = document.getElementById('sort2').value;
    order1 = document.getElementById('order1').value;
    order2 = document.getElementById('order2').value;
    filters = {};
    let filter = document.querySelectorAll('.filter');
    for (let q = 0; q < filter.length; q++) {
        let type = filter[q].querySelector('.filterType').value;
        let operator = filter[q].querySelector('.filterOperator').value;
        let value = filter[q].querySelector('.filterValue').value;
        if (type == 'subscribers' || type == 'views' || type == 'videos' || type == 'subscribers24' || type == 'views24' || type == 'videos24') {
            value = parseInt(value);
            type = 'stats.' + type;
        } else if (type == 'joined' || type == 'country') {
            type = 'user.' + type;
        } else {
            type = 'gains.' + type;
        }
        if (type == 'stats.subscribers' || type == 'stats.views' || type == 'stats.videos' || type == 'gains.subscribers24' || type == 'gains.views24' || type == 'gains.videos24' || type == 'user.joined' || type == 'user.country') {
            if (operator == '=') {
                filters[type] = value;
            } else if (operator == '>') {
                filters[type] = { $gt: value };
            } else if (operator == '<') {
                filters[type] = { $lt: value };
            } else if (operator == '>=') {
                filters[type] = { $gte: value };
            } else if (operator == '<=') {
                filters[type] = { $lte: value };
            }
        } else if (type == 'country') {
            filters[type] = value;
        }
    }     
    document.getElementById('loader').style.display = "block";
    searching = true;
    ids = [];
    channels = [];
    getChannels();
}

function addChannel() {
    document.querySelector('.popup').style.display = 'flex';
}

function closePopup() {
    document.querySelector('.popup').style.display = 'none';
    document.getElementById('popup-content').style.display = 'block';
    document.getElementById('popup-content2').style.display = 'none';
}

let searchPage = 1;
let searchResults = [];
function searchChannel(handle, that) {
    fetch('/api/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: (handle ? handle : document.getElementById('name').value) })
    })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.message);
            } else if (data.channels) {
                searchResults = data.channels;
                searchPage = 1;
                document.getElementById('results').innerHTML = '';
                for (let q = 0; q < (data.channels.length > 5 ? 5 : data.channels.length); q++) {
                    loadSearch(data.channels[q]);
                }
                let pages = `<center><div class="pages">
                <button class="page" onclick="prevPage()"><</button>
                <h3 class="page">${searchPage}/${Math.ceil(data.channels.length / 5)}</h3>
                <button class="page" onclick="nextPage()">></button></div></center>`;
                document.getElementById('results').innerHTML += pages;
            } else {
                if (that) {
                    that.innerHTML = 'Added';
                }
                alert(data.message);
            }
        })
        .catch(err => console.error(err));
}

async function loadSearch(user) {
    let card = document.createElement('div');
    card.classList.add('card');
    let unadded = `<button class="search_button" onclick="searchChannel('${user.id}', this)">Add</button>`
    let added = `<button class="search_button" disabled>Added</button>`
    let http = user.image.startsWith('https') ? '' : 'https:';
    card.innerHTML = `
    <img class="search_avatar" src="${http}${user.image}" alt="avatar" onerror="imgError('avatar', this)">
    <div class="search_info">
        <h3 class="search_name">${user.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
        <h3 class="search_handle">${user.handle}</h3>
        <h3 class="search_stats">${fix(user.subscribers)}</h3>
        ${user.added ? added : unadded}
    </div>`
    document.getElementById('results').appendChild(card);
}

function nextPage() {
    if (searchPage < Math.ceil(searchResults.length / 5)) {
        searchPage++;
        document.getElementById('results').innerHTML = '';
        for (let q = (searchPage - 1) * 5; q < (searchPage * 5 > searchResults.length ? searchResults.length : searchPage * 5); q++) {
            loadSearch(searchResults[q]);
        }
        let pages = `<center><div class="pages">
        <button class="page" onclick="prevPage()"><</button>
        <h3 class="page">${searchPage}/${Math.ceil(searchResults.length / 5)}</h3>
        <button class="page" onclick="nextPage()">></button></div></center>`;
        document.getElementById('results').innerHTML += pages;
        document.getElementById('results').scrollIntoView();
    }
}

function prevPage() {
    if (searchPage > 1) {
        searchPage--;
        document.getElementById('results').innerHTML = '';
        for (let q = (searchPage - 1) * 5; q < (searchPage * 5 > searchResults.length ? searchResults.length : searchPage * 5); q++) {
            loadSearch(searchResults[q]);
        }
        let pages = `<center><div class="pages">
        <button class="page" onclick="prevPage()"><</button>
        <h3 class="page">${searchPage}/${Math.ceil(searchResults.length / 5)}</h3>
        <button class="page" onclick="nextPage()">></button></div></center>`;
        document.getElementById('results').innerHTML += pages;
        document.getElementById('results').scrollIntoView();
    }
}

function imgError(type, img) {
    if (type === 'avatar' || type === 'logo') {
        img.src = '/images/avatar.png';
    } else {
        img.src = '/images/banner.png';
    }
}

function isAtBottom() {
    if (end || searching) return false;
    return (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
}

window.addEventListener('scroll', () => {
    if (isAtBottom()) {
        offset += 5;
        searching = true;
        getChannels();
    }
});

function getChannels2() {
    offset += 5;
    searching = true;
    getChannels();
}

function addBulk() {
    document.getElementById('popup-content').style.display = 'none';
    document.getElementById('popup-content2').style.display = 'block';
}

function searchBulk() {
    if (document.getElementById('bulk').value.length > 0) {
        let bulk = document.getElementById('bulk').value
        bulk = bulk.replace(/\n/g, ',');
        bulk = bulk.split(',');
        console.log(bulk);
        for (let i = 0; i < bulk.length; i++) {
            bulk[i] = bulk[i].replace(/ /g, '');
            if (!bulk[i].startsWith('UC')) {
                bulk.splice(i, 1);
                i -= 1;
            } else if (bulk[i].length != 24) {
                bulk.splice(i, 1);
                i -= 1;
            } else if (ids.includes(bulk[i])) {
                bulk.splice(i, 1);
                i -= 1;
            } else if (bulk[i] == '') {
                bulk.splice(i, 1);
                i -= 1;
            }
        }
        document.getElementById('popup-content2').style.display = 'none';
        document.getElementById('popup-content').style.display = 'block';
        fetch('/api/addBulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: bulk })
        }).then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert(data.message);
                } else {
                    document.getElementById('bulk').value = '';
                    alert('Adding channels... this may take a while so you may close this tab.');
                }
            }).catch(err => console.error(err));
    } else {
        alert('Please enter a list of channel IDs!')
        document.getElementById('popup-content2').style.display = 'none';
        document.getElementById('popup-content').style.display = 'block';
    }
}

function settings() {
    document.getElementById('settings').style.display = 'flex';
}

function closePopup2() {
    document.getElementById('settings').style.display = 'none';
}

function closePopup3() {
    document.getElementById('menu').style.display = 'none';
}

function changeTheme(a) {
    if (a) {
        if (localStorage.getItem('theme') == 'dark') {
            document.getElementById('themeLink').href = '/css/dark.css?update=a7a679042-e1ae-4bf6-8ee4-e5541f50a4c0';
            document.getElementById('theme').innerHTML = 'Light Mode';
        }
    } else {
        if (localStorage.getItem('theme') == 'dark') {
            localStorage.setItem('theme', 'light');
            document.getElementById('themeLink').href = '/css/style.css?update=a7a679042-e1ae-4bf6-8ee4-e5541f50a4c0';
            document.getElementById('theme').innerHTML = 'Dark Mode';
        } else {
            localStorage.setItem('theme', 'dark');
            document.getElementById('themeLink').href = '/css/dark.css?update=a7a679042-e1ae-4bf6-8ee4-e5541f50a4c0';
            document.getElementById('theme').innerHTML = 'Light Mode';
        }
    }
}

function changeMode(a) {
    if (a) {
        if (localStorage.getItem('mode') == 'list') {
            document.getElementById('mode').innerHTML = 'Grid View';
            offset = 0;
            ids = [];
            channels = [];
            document.querySelector('.channels').style.gridTemplateColumns = '1fr';
            document.getElementById('channels').innerHTML = `<table class="table" id="table">
            <tr>
                <th>Logo</th>
                <th>Name</th>
                <th>Subscribers</th>
                <th>Views</th>
                <th>Videos</th>
                <th>Country</th>
                <th>Joined</th>
                <th>Subscribers (24H Gain)</th>
                <th>Views (24H Gain)</th>
                <th>Videos (24H Gain)</th>
            </tr>
            </table>`
            getChannels();
        } else {
            document.getElementById('mode').innerHTML = 'List View';
        }
    } else {
        if (!localStorage.getItem('mode')) {
            localStorage.setItem('mode', 'list')
            document.getElementById('mode').innerHTML = 'Grid View';
            location.reload();
        } else if (localStorage.getItem('mode') == 'grid') {
            localStorage.setItem('mode', 'list');
            document.getElementById('mode').innerHTML = 'Grid View';
            location.reload();
        } else {
            localStorage.setItem('mode', 'grid');
            document.getElementById('mode').innerHTML = 'Grid View';
            location.reload();
        }
    }
}

let currentID = '';
function openMenu(id) {
    currentID = id;
    document.getElementById('menu').style.display = 'flex';
    let channel = channels.find(channel => channel.id == id);
    document.getElementById('id').innerHTML = channel.id;
    document.getElementById('visit').onclick = () => {
        window.open(`https://youtube.com/channel/${channel.id}`);
    }
}

function updateUser() {
    if (currentID == '') return;
    fetch('/api/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: currentID })
    }).then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.message);
            } else {
                alert('Updating channel...');
            }
        }).catch(err => console.error(err));
}

function addFilter() {
    let filter = document.createElement('div');
    filter.classList.add('filter');
    filter.innerHTML = `<select class="filterType" onchange="changeFilter(this)">
    <option value="subscribers">Subscribers</option>
    <option value="views">Views</option>
    <option value="videos">Videos</option>
    <option value="country">Country</option>
    <option value="joined">Joined (year, month, day)</option>
    <option value="subscribers24">Subscribers (24H Gain)</option>
    <option value="views24">Views (24H Gain)</option>
    <option value="videos24">Videos (24H Gain)</option>
</select>
<select class="filterOperator">
    <option value="=">=</option>
    <option value=">">></option>
    <option value="<"><</option>
    <option value=">=">>=</option>
    <option value="<="><=</option>
</select>
<input type="text" class="filterValue" placeholder="Value">
<button class="removeFilter" onclick="removeFilter(this)">X</button>`
    document.querySelector('.filters').appendChild(filter);
}

function removeFilter(that) {
    that.parentElement.remove();
}

setInterval(() => {
    fetch('/api/totals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
        .then(data => {
            document.getElementById('totalChannels').innerHTML = data.totalChannels
            document.getElementById('totalSubscribers').innerHTML = data.totalSubscribers
            document.getElementById('totalViews').innerHTML = data.totalViews
            document.getElementById('totalVideos').innerHTML = data.totalVideos
        }).catch(err => console.error(err));
}, 5000)

changeTheme('init')
changeMode('init')