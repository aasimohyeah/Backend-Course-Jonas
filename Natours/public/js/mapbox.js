/* eslint-disable */
//this file is linked via base.pug file (located at bottom of script)

//JSON.parse converts string to json
//'map' is html id tag
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiYWFzaW1vaHllYWgiLCJhIjoiY200ZnR3MjgzMTRyMjJscjZiZnhkM3hydSJ9.lsNQ9Ev0dtjafWnm0DpcTw';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 9, // starting zoom
});
//pk.eyJ1IjoiYWFzaW1vaHllYWgiLCJhIjoiY200ZmgxbmpzMDhsdzJrcXJlbGg0aXZ2eSJ9.blKBmufJFeW7Vkw24yepLw
