let currsong = new Audio()
let songs = []
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

function updateSongTime() {
  const currentTime = Math.floor(currsong.currentTime);
  const duration = Math.floor(currsong.duration);

  // Check if duration is 0 before division
  if (duration === 0) {
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    return;
  }

  const formattedCurrentTime = secondsToMinutesSeconds(currentTime);
  const formattedDuration = secondsToMinutesSeconds(duration);

  document.querySelector(".songtime").innerHTML = 
    `${formattedCurrentTime} / ${formattedDuration}`;
  document.querySelector(".circle").style.left = (currsong.currentTime / duration) * 100 + "%"
}

async function getSongs(folder) {
    songs = []
    currfolder = folder
    let a = await fetch(`http://127.0.0.1:3000/spotify_clone/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    for (let index = 0; index < as.length; index++) {
      const element = as[index];
      if (element.href.endsWith(".mp4")) {
        songs.push(element.href.split(`/${folder}/`)[1]);
      }
    }
  
    // Show all the songs in the playlist
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";
    for (const song of songs) {
      songUL.innerHTML += `<li><img class="invert" width="34" src="img/music.svg" alt="">
        <div class="info">
          <div> ${song.replaceAll("%20"," ")} </div>
          <div>Sabyaschi Biswal</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="img/play.svg" alt="">
        </div> </li>`;
    }
  
    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
      e.addEventListener("click", () => {
        playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
      });
    });

    return songs;
}  
  
const playmusic = (track,pause = false) => {
  currsong.src = `/spotify_clone/${currfolder}/${track}`;

    if(!pause){
      currsong.play();
      play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20"," ")
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
    currsong.addEventListener("timeupdate", updateSongTime);
}

async function displayAlbums(){
    let a = await fetch("/spotify_clone/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      if(e.href.includes("/songs")){

        let folder = e.href.split("/").slice(-2)[0]
        let a = await fetch(`/spotify_clone/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response)
      let cardcontainer = document.querySelector(".cardcontainer")
      cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class="card">
              <div class="play">
              <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              color="#000000"
              fill="#000"
              >
              <path
              d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linejoin="round"
              />
              </svg>
              </div>
              <img
              src="/spotify_clone/songs/${folder}/cover.jpg"
              alt=""
              />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
              </div>`
            }

            Array.from(document.getElementsByClassName("card")).forEach(e => {
              e.addEventListener("click",async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playmusic(songs[0])
              })
            })
    }
}

async function main(){
  await getSongs("songs/ncs")
  displayAlbums()
  
  document.querySelector(".seekbar").addEventListener("click", (e) => {
  // Get click position relative to seekbar
  let offsetX = e.offsetX;
  let seekbarWidth = e.target.getBoundingClientRect().width;
  
  // Clamp click position between 0 and seekbar width
  offsetX = Math.max(0, Math.min(offsetX, seekbarWidth));
  
  // Calculate percentage (avoid division by zero)
  let percent = (offsetX / seekbarWidth) * 100;
  if (currsong.duration > 0) {
    currsong.currentTime = ((currsong.duration) * percent) / 100;
  } else {
    console.warn("Audio duration unavailable (cannot seek)");
  }
  document.querySelector(".circle").style.left = percent + "%";
  e.stopPropagation();
});


document.querySelector(".hamburger").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "0"
    e.stopPropagation();
  })

  document.querySelector(".close").addEventListener("click", (e) => {
    document.querySelector(".left").style.left = "-120%"
    e.stopPropagation();
  })
  
  play.addEventListener("click",(e) => {
    if(currsong.paused){
      currsong.play()
      play.src = "img/pause.svg"
    }
    else{
      currsong.pause()
      play.src = "img/play.svg"
    }
    e.stopPropagation();
  })

previous.addEventListener("click", (e) => {
  let index = songs.indexOf(currsong.src.split("/").slice(-1)[0])
  if(index > 0){
    playmusic(songs[index-1])
  }
  e.stopPropagation();
})

next.addEventListener("click", (e) => {
  let index = songs.indexOf(currsong.src.split("/").slice(-1)[0])
  if(index < songs.length-1){
    playmusic(songs[index+1])
  }
  e.stopPropagation();
})

document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
  currsong.volume = e.target.value/100
  if(currsong.volume > 0){
    document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg","volume.svg")
  }
  e.stopPropagation()
})

document.querySelector(".volume>img").addEventListener("click", (e) => {
  if(e.target.src.includes("volume.svg")){
    e.target.src = e.target.src.replace("volume.svg","mute.svg")
    currsong.volume = 0
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0
  }
  else{
    e.target.src = e.target.src.replace("mute.svg","volume.svg")
    currsong.volume = 0.1
    document.querySelector(".range").getElementsByTagName("input")[0].value = 10
  }
  e.stopPropagation()
})

}

main()

