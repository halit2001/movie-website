const global = {
    currentPage: window.location.pathname,
    api_endpoint: {
        api_url: 'https://api.themoviedb.org/3/',
        api_key: '?api_key=e39feea8a219fe59d180ba3ef91f319a'
    },
    search : {
        search_term : '',
        page : 1 ,
        total_page : 1,
        totalResults : 0
    }
};

// This display movie which has chosen
async function displayMovieDetails() {
    const movieID = window.location.search.split('=')[1];
    const movie = await fetchDataFromApi(`movie/${movieID}`);
    const movieDetails = document.querySelector('#movie-details');
    const divTop = document.createElement('div');
    const divBottom = document.createElement('div');
    divTop.classList.add('details-top');
    divBottom.classList.add('details-bottom');
    divTop.innerHTML =
    `
        <div class="img-wrapper">
        ${movie.poster_path
        ?
        `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="img-card-top">
        `:
        `<img src="no-image.jpg" alt="${movie.title}" class="img-card-top">`
        }
        </div>
        <div class="movie-explanation">
        <h2>${movie.title}</h2>
        <p>${movie.overview}</p>
        <h3>Genres</h3>
        <ul>
            ${movie.genres.map(genre => `<li>${genre.name}</li>`).join('')}
        </ul>
        </div>
    `;
    
    divBottom.innerHTML = 
    `
    <h2>Movie Info</h2>
    <ul>
      <li><span class="yellow">Budget : $${numberWithCommas(movie.budget)}</span></li>
      <li><span class="yellow">Revenue : $${numberWithCommas(movie.revenue)}</span></li>
      <li><span class="yellow">Runtime : ${movie.runtime}</span></li>
      <li><span class="yellow">Status : ${movie.status}</span></li>
    </ul>
    <h4>Production Companies</h4>
    <div class="list-group">
      ${movie.production_companies.map(company => `<span>${company.name}</span>`).join(' , ')}
    </div>
    `;
    movieDetails.appendChild(divTop);
    movieDetails.appendChild(divBottom);
}

// This is used to display now playing movie datas by waiting asynchronously.
async function displayNowPlayingMovies() {
    const { results } = await fetchDataFromApi('movie/now_playing');
    results.forEach(movie => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML =
            `
        <a href="movie-details.html?id=${movie.id}">
        ${movie.poster_path
                ?
                `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="img-card-top">
            `:
                `<img src="no-image.jpg" alt="${movie.title}" class="img-card-top">`
            }
        </a>
        <div class="card-body">
            <h3>${movie.title}</h3>
        </div>
        `;
        document.querySelector('#now-playing-movies-wrapper').appendChild(div);
    });
}

// This is used to check whether spesific movie is there or not . if it isn't , it gives us an error. 
async function search(){
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    global.search.search_term = urlParams.get('search-term');
    if(global.search.search_term !== '' && global.search.search_term !== null){
        const { results , page , total_pages , total_results} = await searchDataFromApi();
        global.search.page = page;
        global.search.totalResults = total_results;
        global.search.total_page = total_pages;
        if(results.length === 0){
            showAlert('Please enter a valid search term');
            document.querySelector('#search-movies').style.display = 'none';
            return;
        } else {
            displaySearchResults(results);
            document.querySelector('#search-term').value = '';
        }
    } else {
        showAlert('Please enter a valid search term');
        document.querySelector('#search-movies').style.display = 'none';
    }
}

function displaySearchResults(movies){
    // Remove older results
    document.querySelector('#search-results-heading').innerHTML = '';
    document.querySelector('#search-results').innerHTML = '';
    document.querySelector('#pagination').innerHTML = '';
    movies.forEach((movie) => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML =
        `
        <a href="movie-details.html?id=${movie.id}">
            ${movie.poster_path
            ?
            `
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="img-card-top">
            `:
            `<img src="no-image.jpg" alt="${movie.title}" class="img-card-top">`
            }
        </a>
        <div class="card-body">
            <h3>${movie.title}</h3>
        </div> 
        `;
        document.querySelector('#search-results-heading').innerHTML = `<h2>${movies.length} of ${global.search.totalResults} for ${upperCaseFirstLetter(global.search.search_term)}</h2>`;
        document.querySelector('#search-results').appendChild(div);
    });
    displayPagination();
}

function upperCaseFirstLetter(str){
    const word = str.slice(1);
    return(str.charAt(0).toUpperCase() + word);
}

// This provide pagination our movie website
function displayPagination() {
    const div = document.createElement('div');
    div.classList.add('pagination');
    div.innerHTML = 
    `
    <button class="btn-search btn-secondary" id="prev">Prev</button>
    <button class="btn-search btn-secondary" id="next">Next</button>
    <div class="page-counter">Page ${global.search.page} of ${global.search.total_page}</div>   
    `;
    document.querySelector('#pagination').appendChild(div);

    if(global.search.page === 1){
        document.querySelector('#prev').disabled = true;
    } 
    if(global.search.page === global.search.total_page){
        document.querySelector('#next').disabled = true;
    }

    //Display next page
    document.querySelector('#next').addEventListener('click', async() => {
        global.search.page++;
        const { results } = await searchDataFromApi();
        displaySearchResults(results);
    });

    //Display prev page
    document.querySelector('#prev').addEventListener('click', async() => {
        global.search.page--;
        const { results } = await searchDataFromApi();
        displaySearchResults(results);
    });
}

// This is used to fetch a spesific movie data which we want to display
async function searchDataFromApi(){
    const API_KEY = global.api_endpoint.api_key;
    const API_URL = global.api_endpoint.api_url;
    const response = await fetch(`${API_URL}search/movie${API_KEY}&query=${global.search.search_term}&page=${global.search.page}`);
    const data = await response.json();
    return data;
}

function showAlert(str){
    const divAlert = document.createElement('div');
    divAlert.classList.add('alert');
    divAlert.appendChild(document.createTextNode(str));
    document.querySelector('.error').appendChild(divAlert);
    setTimeout(() => {
        divAlert.remove();
    },2000)
}

// this is used to fetch movie data by using Tmdb Api
async function fetchDataFromApi(endpoint) {
    const API_URL = global.api_endpoint.api_url;
    const API_KEY = global.api_endpoint.api_key;
    const response = await fetch(`${API_URL}${endpoint}${API_KEY}&language=en-US`)
    const data = await response.json();
    return data;
}

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

function init() {
    switch (global.currentPage) {
        case '/index.html':
            displayNowPlayingMovies();
            break;
        case '/movie-details.html':
            displayMovieDetails();
            break;
        case '/search.html':
            search();
            break;
    }
}
document.addEventListener('DOMContentLoaded', init);