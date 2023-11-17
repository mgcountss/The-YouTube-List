let offset = 0;
let end = false;
let searching = false;
let sort1 = 'subscribers';
let sort2 = 'subscribers';
let order1 = 'desc';
let order2 = 'desc';
let filters = [];
let listValues = ['logo', 'name', 'subscribers', 'views', 'videos', 'country', 'joined'];
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
                if (data.channels.length == 0) {
                    end = true;
                } else {
                    searching = false;
                    document.getElementById('loaded').innerHTML = "Loaded From Search: " + (data.offset + data.limit).toLocaleString('en-US') + "/" + data.total.toLocaleString('en-US');
                    if (localStorage.getItem('mode') == 'list') {
                        data.channels.forEach((channel) => {
                            if (ids.includes(channel.id)) return;
                            ids.push(channel.id);
                            channels.push(channel);
                            let tds = []
                            listValues.forEach(value => {
                                if (value == 'logo') {
                                    tds.push(`<td><img src="${channel.user.logo}" class="logo" alt="${channel.user.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}'s logo" onerror="imgError('logo', this)"></td>`)
                                } else if ((value == 'name') || (value == 'description')) {
                                    tds.push(`<td><h4 class="${value}">${channel.user[value].replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h4></td>`)
                                } else if (value == 'subscribers' || value == 'views' || value == 'videos') {
                                    tds.push(`<td><h4 class="${value}">${channel.stats[value].toLocaleString("en-US")}</h4></td>`)
                                } else if (value == 'country') {
                                    tds.push(`<td><h4 class="country">${channel.user.country ? channel.user.country : 'N/A'}</h4></td>`)
                                } else if (value == 'joined') {
                                    tds.push(`<td><h4 class="joined">${new Date(channel.user.joined).toString().split('GMT')[0]}</h4></td>`)
                                } else if ((value == 'Subscribers (24H Gain)') || (value == 'Views (24H Gain)') || (value == 'Videos (24H Gain)')) {
                                    tds.push(`<td><h4 class="gain24">${channel.gains[(value.split(' (24')[0]).toLowerCase()].daily.toLocaleString("en-US")}</h4></td>`)
                                } else if ((value == 'Subscribers (7D Gain)') || (value == 'Views (7D Gain)') || (value == 'Videos (7D Gain)')) {
                                    tds.push(`<td><h4 class="gain7">${channel.gains[(value.split(' (7')[0]).toLowerCase()].weekly.toLocaleString("en-US")}</h4></td>`)
                                } else if ((value == 'Subscribers (30D Gain)') || (value == 'Views (30D Gain)') || (value == 'Videos (30D Gain)')) {
                                    tds.push(`<td><h4 class="gain30">${channel.gains[(value.split(' (30')[0]).toLowerCase()].monthly.toLocaleString("en-US")}</h4></td>`)
                                } else {
                                    console.log(value)
                                }
                            })
                            document.getElementById('table').innerHTML += `<tr onclick="openMenu('${channel.id}')">
                            ${tds.map(td => td).join('')}
                            </tr>`
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
                        <img src="${channel.user.logo}" class="logo" alt="${channel.user.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}'s logo" onerror="imgError('avatar', this)">
                    </div>
                    <div class="card-body"><h3 class="name">${channel.user.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
                        <hr>
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
                        </div>
                        <div class="misc">
                            <div>
                                <h4 class="country">${channel.user.country ? channel.user.country : 'N/A'}</h4>
                                <h5>Country</h5>
                            </div>
                            <div>
                                <h4 class="joined">${new Date(channel.user.joined).toString().split('GMT')[0]}</h4>
                                <h5>Joined</h5>
                            </div>
                        </div>
                        <hr>
                        <div class="gains">
                            <div>
                                <h4 class="gain24">${channel.gains.subscribers.daily.toLocaleString("en-US")}</h4>
                                <h5>Subscribers (24 Hours)</h5>
                            </div>
                            <div>
                                <h4 class="gain24">${channel.gains.views.daily.toLocaleString("en-US")}</h4>
                                <h5>Views (24 Hours)</h5>
                            </div>
                            <div>
                                <h4 class="gain24">${channel.gains.videos.daily.toLocaleString("en-US")}</h4>
                                <h5>Videos (24 Hours)</h5>
                            </div>
                        </div>
                    </div>
                    <hr>
                    <textarea class="description">${channel.user.description}</textarea>`
                            /*<div>
                                        <h4 class="gain7">${channel.gains.subscribers.weekly.toLocaleString("en-US")}</h4>
                                        <h5>Subscribers (7 Days)</h5>
                                    </div>
                                    <div>
                                        <h4 class="gain7">${channel.gains.views.weekly.toLocaleString("en-US")}</h4>
                                        <h5>Views (7 Days)</h5>
                                    </div>
                                    <div>
                                        <h4 class="gain7">${channel.gains.videos.weekly.toLocaleString("en-US")}</h4>
                                        <h5>Videos (7 Days)</h5>
                                    </div>
                                    <div>
                                        <h4 class="gain30">${channel.gains.subscribers.monthly.toLocaleString("en-US")}</h4>
                                        <h5>Subscribers (30 Days)</h5>
                                        </div>
                                    <div>
                                        <h4 class="gain30">${channel.gains.views.monthly.toLocaleString("en-US")}</h4>
                                        <h5>Views (30 Days)</h5>
                                    </div>
                                    <div>
                                        <h4 class="gain30">${channel.gains.videos.monthly.toLocaleString("en-US")}</h4>
                                        <h5>Videos (30 Days)</h5>
                                    </div>
                                </div>*/
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
        let table = document.getElementById('table');
        let headers = table.rows[0].cells;
        listValues = [];
        for (let q = 0; q < headers.length; q++) {
            if ((headers[q].innerText == "Subscribers (30D Gain)") || (headers[q].innerText == "Views (30D Gain)") || (headers[q].innerText == "Videos (30D Gain)")) {
                listValues.push(headers[q].innerText);
            } else if ((headers[q].innerText == "Subscribers (7D Gain)") || (headers[q].innerText == "Views (7D Gain)") || (headers[q].innerText == "Videos (7D Gain)")) {
                listValues.push(headers[q].innerText);
            } else if ((headers[q].innerText == "Subscribers (24H Gain)") || (headers[q].innerText == "Views (24H Gain)") || (headers[q].innerText == "Videos (24H Gain)")) {
                listValues.push(headers[q].innerText);
            } else {
                listValues.push(headers[q].innerText.toLowerCase());
            }
        }
        document.getElementById('channels').innerHTML = `<table class="table" id="table">
        <tr>
        ${listValues.map(value => `<th>${value.charAt(0).toUpperCase() + value.slice(1)}</th>`).join('')}
        </tr>
        </table>`
    } else {
        document.querySelector('.channels').innerHTML = '';
    }
    sort1 = document.getElementById('sort1').value;
    sort2 = document.getElementById('sort2').value;
    order1 = document.getElementById('order1').value;
    order2 = document.getElementById('order2').value;
    filters = [];
    let filter = document.querySelectorAll('.filter');
    for (let q = 0; q < filter.length; q++) {
        let type = filter[q].querySelector('.filterType').value;
        let operator = filter[q].querySelector('.filterOperator').value;
        let value = filter[q].querySelector('.filterValue').value;
        if (operator == '=') {
            filters.push(type + " " + operator + " " + value);
        } else if (operator == '>') {
            filters[type] = { $gt: value };
        } else if (operator == '<') {
            filters[type] = { $lt: value };
        } else if (operator == '>=') {
            filters[type] = { $gte: value };
        } else if (operator == '<=') {
            filters[type] = { $lte: value };
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
        body: JSON.stringify({ id: (handle ? handle : document.getElementById('name2').value) })
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
                    that.disabled = true;
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
    var theme = localStorage.getItem('theme');
    if (!theme) {
        localStorage.setItem('theme', 'dark');
    } else {
        if (!a) {
            theme = (theme === 'light') ? 'dark' : 'light';
            localStorage.setItem('theme', theme);
        }
        document.getElementById('themeLink').href = '/css/' + theme + '.css?update=fa300b6e1f62';
        document.getElementById('theme').innerHTML = (theme === 'light') ? 'Dark Mode' : 'Light Mode';
    }
}


function changeMode(a) {
    if (a) {
        if (localStorage.getItem('mode') == 'list') {
            if (localStorage.getItem('listValues')) {
                listValues = localStorage.getItem('listValues').split(',');
            }
            document.getElementById('mode').innerHTML = 'Grid View';
            offset = 0;
            ids = [];
            channels = [];
            document.querySelector('.channels').style.gridTemplateColumns = '1fr';
            for (let q = 0; q < listValues.length; q++) {
                let value = listValues[q];
                if ((value == "subscribers30") || (value == "views30") || (value == "videos30")) {
                    value = value.slice(0, -2) + " (30D Gain)"
                }
                if ((value == "subscribers7") || (value == "views7") || (value == "videos7")) {
                    value = value.slice(0, -1) + " (7D Gain)"
                }
                if ((value == "subscribers24") || (value == "views24") || (value == "videos24")) {
                    value = value.slice(0, -2) + " (24H Gain)"
                }
                listValues[q] = value;
            }
            document.getElementById('channels').innerHTML = `<table class="table" id="table">
            <tr>
            ${listValues.map(value => `<th>${value.charAt(0).toUpperCase() + value.slice(1)}</th>`).join('')}
            </tr>
            </table>`
            for (let q = 0; q < listValues.length; q++) {
                let value = listValues[q];
                if ((value == "subscribers (7D Gain)") || (value == "views (7D Gain)") || (value == "videos (7D Gain)") || (value == "subscribers (24H Gain)") || (value == "views (24H Gain)") || (value == "videos (24H Gain)") || (value == "subscribers (30D Gain)") || (value == "views (30D Gain)") || (value == "videos (30D Gain)")) {
                    value = value.charAt(0).toUpperCase() + value.slice(1);
                }
                listValues[q] = value;
            }
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
function openMenu(id, channel) {
    currentID = id;
    document.getElementById('menu').style.display = 'flex';
    if (!channel) {
        channel = channels.find(channel => channel.id == id);
    }
    document.getElementById('id').innerHTML = "Channel ID: <input type='text' value='" + channel.id + "' readonly style='width: 40%'>";
    document.getElementById('added').innerHTML = "Added: " + new Date(channel.created).toString().split('GMT')[0];
    document.getElementById('updated').innerHTML = "Updated: " + new Date(channel.updated).toString().split('GMT')[0];
    document.getElementById('logo').src = channel.user.logo;
    document.getElementById('banner').style.backgroundImage = `url('${channel.user.banner}')`;
    document.getElementById('name').innerHTML = channel.user.name;
    document.getElementById('description').innerHTML = channel.user.description;
    document.getElementById('subscribers').innerHTML = channel.stats.subscribers.toLocaleString("en-US");
    document.getElementById('views').innerHTML = channel.stats.views.toLocaleString("en-US");
    document.getElementById('videos').innerHTML = channel.stats.videos.toLocaleString("en-US");
    document.getElementById('country').innerHTML = channel.user.country ? channel.user.country : 'N/A';
    document.getElementById('joined').innerHTML = new Date(channel.user.joined).toString().split('GMT')[0];
    document.getElementById('subscribers24').innerHTML = channel.gains.subscribers.daily.toLocaleString("en-US");
    document.getElementById('views24').innerHTML = channel.gains.views.daily.toLocaleString("en-US");
    document.getElementById('videos24').innerHTML = channel.gains.videos.daily.toLocaleString("en-US");
    //document.getElementById('subscribers7').innerHTML = channel.gains.subscribers.weekly.toLocaleString("en-US");
    //document.getElementById('views7').innerHTML = channel.gains.views.weekly.toLocaleString("en-US");
    //document.getElementById('videos7').innerHTML = channel.gains.videos.weekly.toLocaleString("en-US");
    //document.getElementById('subscribers30').innerHTML = channel.gains.subscribers.monthly.toLocaleString("en-US");
    //document.getElementById('views30').innerHTML = channel.gains.views.monthly.toLocaleString("en-US");
    //document.getElementById('videos30').innerHTML = channel.gains.videos.monthly.toLocaleString("en-US");
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
    <option value="subscribers7">Subscribers (7D Gain)</option>
    <option value="views7">Views (7D Gain)</option>
    <option value="videos7">Videos (7D Gain)</option>
    <option value="subscribers30">Subscribers (30D Gain)</option>
    <option value="views30">Views (30D Gain)</option>
    <option value="videos30">Videos (30D Gain)</option>
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

function addSelection() {
    let selection = document.createElement('div');
    selection.classList.add('selection');
    selection.innerHTML = `<select class="selectionType">
    <option value="logo">Logo</option>
    <option value="name">Name</option>
    <option value="description">Description</option>
    <option value="subscribers">Subscribers</option>
    <option value="views">Views</option>
    <option value="videos">Videos</option>
    <option value="country">Country</option>
    <option value="joined">Joined</option>
    <option value="subscribers24">Subscribers (24H Gain)</option>
    <option value="views24">Views (24H Gain)</option>
    <option value="videos24">Videos (24H Gain)</option>
    <option value="subscribers7">Subscribers (7D Gain)</option>
    <option value="views7">Views (7D Gain)</option>
    <option value="videos7">Videos (7D Gain)</option>
    <option value="subscribers30">Subscribers (30D Gain)</option>
    <option value="views30">Views (30D Gain)</option>
    <option value="videos30">Videos (30D Gain)</option>
</select>
<button class="removeFilter" onclick="removeFilter(this)">X</button>`
    document.querySelector('.selections').appendChild(selection);
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

function reloadSavedListValues() {
    let list = ""
    document.querySelectorAll('.selectionType').forEach(value => {
        list += value.value + ','
    })
    localStorage.setItem('listValues', list.slice(0, -1))
    location.reload()
}

function checkSavedListValues() {
    if (localStorage.getItem('listValues')) {
        let list = localStorage.getItem('listValues').split(',')
        list.forEach(value => {
            document.querySelector('.selections').innerHTML += `<div class="selection">
            <select class="selectionType" onchange="changeFilter(this)">
                <option value="logo" ${value == 'logo' ? 'selected' : ''}>Logo</option>
                <option value="name" ${value == 'name' ? 'selected' : ''}>Name</option>
                <option value="description" ${value == 'description' ? 'selected' : ''}>Description</option>
                <option value="subscribers" ${value == 'subscribers' ? 'selected' : ''}>Subscribers</option>
                <option value="views" ${value == 'views' ? 'selected' : ''}>Views</option>
                <option value="videos" ${value == 'videos' ? 'selected' : ''}>Videos</option>
                <option value="country" ${value == 'country' ? 'selected' : ''}>Country</option>
                <option value="joined" ${value == 'joined' ? 'selected' : ''}>Joined</option>
                <option value="subscribers24" ${value == 'subscribers24' ? 'selected' : ''}>Subscribers (24H Gain)</option>
                <option value="views24" ${value == 'views24' ? 'selected' : ''}>Views (24H Gain)</option>
                <option value="videos24" ${value == 'videos24' ? 'selected' : ''}>Videos (24H Gain)</option>
                <option value="subscribers7" ${value == 'subscribers7' ? 'selected' : ''}>Subscribers (7D Gain)</option>
                <option value="views7" ${value == 'views7' ? 'selected' : ''}>Views (7D Gain)</option>
                <option value="videos7" ${value == 'videos7' ? 'selected' : ''}>Videos (7D Gain)</option>
                <option value="subscribers30" ${value == 'subscribers30' ? 'selected' : ''}>Subscribers (30D Gain)</option>
                <option value="views30" ${value == 'views30' ? 'selected' : ''}>Views (30D Gain)</option>
                <option value="videos30" ${value == 'videos30' ? 'selected' : ''}>Videos (30D Gain)</option>
            </select>
            <button class="removeFilter" onclick="removeFilter(this)">X</button>
        </div>`
        })
    }
}

function randomChannel() {
    fetch('/api/random')
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                alert(data.message);
            } else {
                openMenu(data.id, data);
            }
        }).catch(err => console.error(err));
}

changeTheme('init')
changeMode('init')
checkSavedListValues()