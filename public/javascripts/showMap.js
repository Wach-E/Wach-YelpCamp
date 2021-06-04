const camp = JSON.parse(campground);
// Create a map
mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/navigation-preview-day-v4', // style URL
    center: camp.geometry.coordinates, // starting position [lng, lat]
    zoom: 5 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

// Create a marker and add it to the map.
new mapboxgl.Marker()
    .setLngLat(camp.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h4>${camp.title}</h4><p>${camp.location}</p>`
            )
    )
    .addTo(map);