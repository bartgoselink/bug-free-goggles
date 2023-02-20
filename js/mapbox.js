mapboxgl.accessToken = 'pk.eyJ1IjoiYWNzdHVkaW9zIiwiYSI6ImNsOHlwZWlkNDBpMjAzd3BuYmxubGp4YnoifQ.JCHAuTCD2ZLsvjEbWk70ng';

const devMode = false; 
let geoJSONParse = [];
let youtube = document.querySelector("iframe");
let currentSet = 0;
let currentCoordinates = [sets[currentSet].longitude, sets[currentSet].latitude];
const staticCenter = [2, 41];
const flyHighBtn = document.getElementById("btn__fly-high");
const toSetBtn = document.getElementById("btn__to-set");
const allSetsBtn = document.getElementById("btn__all-sets");
const cinemaModeBtn = document.getElementById("btn__cinema-mode");
const setContainer = document.getElementById("set__container-scroll");
const secondsPerRevolution = 320;
const maxSpinZoom = 5;
const slowSpinZoom = 3;
let userInteracting = false;
let spinEnabled = true;
const startDelay = 8000;
const durationOfAnimation = 2400;
// let screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
// let screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;

function drawVideoPlayer(num) {
  let videoPlayer = {
    "video": {
      "value": "<iframe title='" + sets[num].title + "' type=\"text/html\" width='100%' height='100%' src='https://www.youtube.com/embed/" + sets[num].embedId + "?autoplay=1' frameborder='0'  allowFullScreen allow='autoplay' allowfullscreen='allowfullscreen' mozallowfullscreen='mozallowfullscreen'  msallowfullscreen='msallowfullscreen' oallowfullscreen='oallowfullscreen' webkitallowfullscreen='webkitallowfullscreen' modestbranding picture-in-picture allow='accelerometer'></iframe>"
    }
  }
  document.getElementById("set-player").innerHTML += videoPlayer.video.value;
  document.getElementById("set-title").innerHTML = sets[num].title;
  document.getElementById("set-location").innerHTML = sets[num].location + ", " + sets[num].country;
  document.getElementById("set-latlon").innerHTML = sets[num].latitude + ", " + sets[num].longitude;
  document.getElementById("set-description").innerHTML = nl2br(sets[num].description);
}

function updateVideoPlayer(num) {
  let video = document.querySelector("iframe");
  video.setAttribute("src", "http://www.youtube.com/embed/" + sets[num].embedId + "?autoplay=1")
  document.getElementById("set-title").innerHTML = sets[num].title;
  document.getElementById("set-location").innerHTML = sets[num].location + ", " + sets[num].country;
  document.getElementById("set-latlon").innerHTML = sets[num].latitude + ", " + sets[num].longitude;
  document.getElementById("set-description").innerHTML = sets[num].description;
}

function updateMap(sets) {
  sets.forEach(function (value, index) {
    console.log(value);
    console.log(index);
    geoJSONParse.push(JSON.parse('\
      {\
        "type": "Feature", \
        "properties": { \
          "id": "'+ index + '", \
          "embedId": "'+ value.embedId + '", \
          "title": "'+ value.title + '", \
          "marker-color": "#ff0000" \
        }, \
        "geometry": { \
          "type": "Point", \
          "coordinates": ['+ value.longitude + ',' + value.latitude + '] \
        } \
      }'));
  });
}
updateMap(sets);

const map = new mapboxgl.Map({
  container: 'map',
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/streets-v11',
  center: staticCenter,
  zoom: 0,
  projection: 'globe',
  bearing: 27,
  pitch: 10,
  essential: true
});

// map.addControl(new mapboxgl.FullscreenControl());

map.on('style.load', () => {
  map.setFog({
    // 'color': 'rgb(255, 255, 255)', // Pink fog / lower atmosphere
    'high-color': 'rgb(36, 92, 223)', // Blue sky / upper atmosphere
    'horizon-blend': 0.1 // Exaggerate atmosphere (default is .1)
  });

  map.addSource('mapbox-dem', {
    'type': 'raster-dem',
    'url': 'mapbox://mapbox.terrain-rgb'
  });

  map.setTerrain({
    'source': 'mapbox-dem',
    'exaggeration': 1.5
  });
});

map.on('load', () => {
  map.addSource('places', {
    'type': 'geojson',
    'data': {
      'type': 'FeatureCollection',
      'features': geoJSONParse
    }
  });

  if (!devMode) {
    map.flyTo({
      center: [sets[currentSet].longitude, sets[currentSet].latitude],
      zoom: 3,
      curve: 3,
      duration: startDelay,
      essential: true
    });
  }



  // Add a layer showing the places.
  map.addLayer({
    'id': 'places',
    'type': 'circle',
    'source': 'places',
    'paint': {
      'circle-color': '#4264fb',
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });

  // Create a popup, but don't add it to the map yet.
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  map.on('zoomstart', (e) => {
    userInteracting = true;
  });

  map.on('zoomend', (e) => {
    setTimeout(startSpinning, 500);
  });

  map.on('mousedown', () => {
    userInteracting = true;
  });

  map.on('mousemove', () => {
    userInteracting = true;
  });

  map.on('touchstart', () => {
    userInteracting = true;
  });

  map.on('mouseup', () => {
    // startSpinning();
  });

  map.on('dragend', () => {
    // startSpinning();
  });

  map.on('pitchend', () => {
    startSpinning();
  });
  map.on('rotateend', () => {
    startSpinning();
  });

  map.on('moveend', () => {
    spinGlobe();
  });

  map.on('mouseenter', 'places', (e) => {
    map.getCanvas().style.cursor = 'pointer';
    console.log(e);
    showPopUp(e);
  });

  map.on('touchmove', () => {
    document.getElementById("set__container-scroll").children[0].style.top = "124vw";
    // map.setPadding({ left: 0, bottom: 50 });
  });

  map.on('mouseleave', 'places', () => {
    map.getCanvas().style.cursor = '';
    popup.remove();
  });

  map.on('click', 'places', (e) => {
    // updateVideoPlayer(e)
    currentSet = e.features[0].properties.id;
    currentCoordinates = [sets[currentSet].longitude, sets[currentSet].latitude];
    console.log("change set" + currentSet); 
    updateVideoPlayer(currentSet);
    toSet(e.features[0].geometry.coordinates);
    // setTimeout(function() {
    //   document.getElementById("set__container").style.left = "0px";
    // }, durationOfAnimation);
  });

  function showPopUp(e) {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const title = e.features[0].properties.title;
    const embedId = e.features[0].properties.embedId;

    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    popup.setLngLat(coordinates).setHTML('<img src="https://i3.ytimg.com/vi/' + embedId + '/mqdefault.jpg" alt="' + title + '"> <div>' + title + '</div>').addTo(map);
  }
});

window.onresize = function () {
  setGlobePosition();
}

function startSpinning() {
  userInteracting = false;
  spinGlobe();
}

function showGlobe() {
  map.flyTo({
    // center: staticCenter,
    zoom: 1,
    curve: 9,
    duration: 12000,
    essential: true,
    bearing: 0,
    pitch: 0
  });
}

function toSet(coordinates) {
  console.log([sets[currentSet].longitude, sets[currentSet].latitude]);
  map.flyTo({
    center: coordinates,
    essential: true,
    zoom: 6,
    duration: 12000,
    curve: 2,
    bearing: 0,
    pitch: 0
  });
}

function setCinemaMode() {
  console.log('i am groot');
  if (setContainer.classList.contains('normal-width')) {
    setContainer.classList.remove('normal-width');
    setContainer.classList.add('cinema-width');
    setContainer.addEventListener('click', setCinemaMode);
    document.onkeydown = function (evt) {
      evt = evt || window.event;
      var isEscape = false;
      if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
      } else {
        isEscape = (evt.keyCode === 27);
      }
      if (isEscape) {
        setCinemaMode();
      }
    };
  } else {
    setContainer.classList.add('normal-width');
    setContainer.classList.remove('cinema-width');
  }
}

function spinGlobe() {
  const zoom = map.getZoom();
  if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
    let distancePerSecond = 360 / secondsPerRevolution;
    if (zoom > slowSpinZoom) {
      // Slow spinning at higher zooms
      const zoomDif =
        (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
      distancePerSecond *= zoomDif;
    }
    const center = map.getCenter();
    center.lng -= distancePerSecond;
    // Smoothly animate the map over one second.
    // When this animation is complete, it calls a 'moveend' event.
    map.easeTo({ center, duration: 1000, easing: (n) => n });
  } else {
    // setTimeout(startSpinning, 1200);
  }
}

function setGlobePosition() {
  var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  console.log(screenWidth);
  if (screenWidth > 768) {
    map.setPadding({ left: 0, bottom: 0 });
  } else {
    map.setPadding({ left: 0, bottom: 300 });
  }
}

setTimeout(function() {
  document.getElementById("set__container").style.left = "0px";
}, durationOfAnimation);

drawVideoPlayer(currentSet);
setGlobePosition();
spinGlobe();

flyHighBtn.addEventListener('click', showGlobe);
toSetBtn.addEventListener('click', () => { toSet(currentCoordinates); }, false);
allSetsBtn.addEventListener('click', function () { window.open("./sets.html", "_blank") });
cinemaModeBtn.addEventListener('click', setCinemaMode);
// flyhigh.addEventListener('click', function() { alert("hoi") });


function nl2br (str, is_xhtml) {   
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}