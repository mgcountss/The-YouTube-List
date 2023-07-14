let offset = 0;
let end = false;
let searching = false;
let sort1 = 'subscribers';
let sort2 = 'subscribers';
let order1 = 'desc';
let order2 = 'desc';
async function getChannels() {
    fetch('/api/channels', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ offset: offset, sort1: sort1, sort2: sort2, search: document.getElementById('search').value, order1: order1, order2: order2 })
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById('loader').style.display = "none";
            if (!data.error) {
                if (data.length == 0) {
                    end = true;
                } else {
                    searching = false;
                    data.forEach((channel) => {
                        if (ids.includes(channel.user.id)) return;
                        let card = document.createElement('div');
                        card.classList.add('card');
                        card.innerHTML = `
                    <div class="banner" style="background-image: url('${channel.user.banner}')">
                        <img src="${channel.user.logo}" class="logo" alt="${channel.user.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}'s logo" onerror="imgError('logo', this)">
                    </div>
                    <div class="card-body">
                        <h3 class="name">${channel.user.name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
                        <div class="stats">
                            <div>
                                <h4 class="subscribers">${channel.stats.subscribers.toLocaleString()}</h4>
                                <h5>Subscribers</h5>
                            </div>
                            <div>
                                <h4 class="views">${channel.stats.views.toLocaleString()}</h4>
                                <h5>Views</h5>
                            </div>
                            <div>
                                <h4 class="videos">${channel.stats.videos.toLocaleString()}</h4>
                                <h5>Videos</h5>
                            </div>
                            <div>
                                <h4 class="country">${channel.user.country}</h4>
                                <h5>Country</h5>
                            </div>
                            <div>
                                <h4 class="country">${new Date(channel.user.joined).toString().split('GMT')[0]}</h4>
                                <h5>Joined</h5>
                            </div>
                        </div>
                    </div><hr>
                    <textarea class="description">${channel.user.description}</textarea>`;
                        document.querySelector('.channels').appendChild(card);
                    });
                }
            }
        }).catch(err => console.error(err));
}

function search() {
    offset = 0;
    end = false;
    document.querySelector('.channels').innerHTML = '';
    sort1 = document.getElementById('sort1').value;
    sort2 = document.getElementById('sort2').value;
    order1 = document.getElementById('order1').value;
    order2 = document.getElementById('order2').value;
    document.getElementById('loader').style.display = "block";
    searching = true;
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
    if (type === 'avatar') {
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
        if (searching) return;
        offset += 5;
        searching = true;
        getChannels();
    }
});

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