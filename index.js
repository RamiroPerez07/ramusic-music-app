//variables
const container = document.getElementById("artist-card-container")
const nextBtn = document.getElementById("next-page-btn")
const previousBtn = document.getElementById("previous-page-btn")
const backBtn = document.getElementById("back-btn")
const loadingSpinner = document.getElementById("loading-spinner")
const nPage = document.getElementById("n-page")
let from = 8;
let page = 1;
// API https://developer.prod.napster.com/api/v2.2#images-apis
const key = "Y2I1Njg4NDktNThjYS00OTg5LTk2NjgtMjFhOTVjMzY0NTVh"
const url = "https://api.napster.com/v2.2/artists/top?apikey="

async function getArtists(from, n_artists= 8){
    try{
        showLoadAnimation();
        if (from >= 16 && from <= 1000){
            showBtnEnable(previousBtn)
        }else{
            showBtnDisable(previousBtn)
        }
        if (from >= 992){
            showBtnDisable(nextBtn)
        }else{
            showBtnEnable(nextBtn)
        }
        const queryParameters = `&limit=${n_artists}&offset=${from}`
        const res = await fetch(url+key+queryParameters)
        const data = await res.json()
        const arrArtistsFull = data.artists
        console.log( arrArtistsFull)   //=>obtengo todas las caracteristicas de la consulta
        const arrObjArtistsTrim = arrArtistsFull.map(artist => {  // => recorto los resultados, y traigo solo lo que me interesa
            return{
                id : artist.id,
                name: artist.name,
                img : artist.links.images.href.toString().slice(28)+"/356x237.jpg",
                genres : artist.links.genres.href,
                topTracks: artist.links.topTracks.href
            }
        })
        //console.log(arrObjArtistsTrim)
        showArtists(arrObjArtistsTrim)
        hideLoadAnimation();
    }catch(err){
        console.log(err)
    }
}

function showLoadAnimation(){
    loadingSpinner.classList.add("show")
}

function hideLoadAnimation(){
    loadingSpinner.classList.remove("show")
}

function createCard(objArtist){
    return `
    <div class="card" data-id=${objArtist.id}>
        <h2 class="artist-name">${objArtist.name}</h2>
        <div class="card-artist-img" style="background-image: url('https://api.napster.com/imageserver/v2${objArtist.img}')"></div>
    </div>
    `
}

function showArtists(objArtistList){
    const html = objArtistList.map(objArtist =>{
        return createCard(objArtist);
    }).join("");
    container.innerHTML = html;
}

function updatePageNumber(page){
    nPage.textContent = page
}

async function showNextPage(){
    from = from + 8;
    page = page + 1;
    updatePageNumber(page);
    await getArtists(from).catch(err =>{
        console.log(err)
    })
}

async function showPreviousPage(){
    if (from==8 || page<=1) return
    from = from - 8
    page = page - 1;
    updatePageNumber(page)
    await getArtists(from).catch(err =>{
        console.log(err)
    })
}

function showBtnDisable(button){
    if (button.classList.contains("navigation-btn")){
        button.classList.remove("navigation-btn");  
        button.classList.add("btn-disabled")
    } 
}

function showBtnEnable(button){
    if (button.classList.contains("btn-disabled")){
        button.classList.remove("btn-disabled");  
        button.classList.add("navigation-btn")
    } 
}

async function getInfoAboutArtist(idArtist){
    try {
        showLoadAnimation()
        showBtnEnable(backBtn)
        const res = await fetch(`https://api.napster.com/v2.2/artists/${idArtist}/tracks/top?apikey=${key}&range=life&limit=10`);
        const data = await res.json();
        console.log(data) //muestra el contenido de todo el track
        const arrTrackInfo = data.tracks.map((track,index) => {
            return {
                id: index +1,
                name : track.name,
                album : track.albumName,
                audio : track.previewURL,
                artist : track.artistName,
            }
        })
        hideLoadAnimation()
        return arrTrackInfo;
        //console.log(arrTrackInfo) //muestro solo la info que me interesa
    }catch(err){
        console.log(err)
    }
}

function createHtmlTrackList(track){
    return `
    <div class="track-card">
        <p class="track-description pos-txt"><span class="highlight-text">#</span> ${track.id}</p>
        <p class="track-description song-txt"><span class="highlight-text">Canción:</span> ${track.name}</p>
        <p class="track-description alb-txt"><span class="highlight-text">Album:</span> ${track.album}</p>
        <audio controls>${track.audio}</audio>
    </div>
    `
}

function renderArtistTracks(arrTrackInfo){
    const header = `<h3 class="h3-titles">Disfrutá los mejores 10 temas de ${arrTrackInfo[0].artist}</h3>`
    const contentHtml = arrTrackInfo.map(track => {
        return createHtmlTrackList(track);
    }).join("")
    container.innerHTML = header + contentHtml;
}

function showInfoAboutArtist(event){
    if(!event.target.parentElement.classList.contains("card")) return
    showBtnDisable(nextBtn);
    showBtnDisable(previousBtn);
    clearContainer();
    container.classList.add("list-container");
    getInfoAboutArtist(event.target.parentElement.dataset.id)
    .then(arrTrackInfo => {
        renderArtistTracks(arrTrackInfo);
    })
}

function returnToCardContainer(){
    try{
        showLoadAnimation();
        clearContainer();
        showBtnDisable(backBtn)
        container.classList.remove("list-container");
        getArtists(from);
        hideLoadAnimation();
    }catch(err){
        console.log(err)
    }
}

function clearContainer(){
    container.innerHTML = ""
}


function init(){
    showBtnDisable(backBtn)
    getArtists(from) //Me traigo 8 artistas, desde el artista numero 0
    nextBtn.addEventListener("click", showNextPage)
    previousBtn.addEventListener("click", showPreviousPage)
    container.addEventListener("click", showInfoAboutArtist)
    backBtn.addEventListener("click", returnToCardContainer)
}

init()