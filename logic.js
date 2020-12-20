// Store API endpoints in variables
var quakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var platesUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the quake and plates URLs and store as variables
d3.json(quakeUrl, function(data) {
  let earthquakeData = data.features

  d3.json(platesUrl, function(data) {
    let platesData = data.features

    // Call createMap function and pass both JSON response objects
    createMap(earthquakeData,platesData)
  })
})

// Function to Create Map 
function createMap(earthquakeData,platesData) {

    // Create Markers for each earthquakeData feature
    let earthquakeMarkers = earthquakeData.map((feature) =>
      // Make circleMarker and bind Popup for each earthquakeData feature
      L.circleMarker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]],{
          radius: getRadius(feature.geometry.coordinates[2]), 
          stroke: true,
          color: 'black',
          opacity: 1,
          weight: 0.5,
          fill: true,
          fillColor: magColor(feature.properties.mag), 
          fillOpacity: 0.8   
      })
      .bindPopup("<h1> Magnitude : " + feature.properties.mag +
      "</h1><hr><h3>" + feature.properties.place + 
      "</h1><hr><h3> Depth in kilometers : " + feature.geometry.coordinates[2] +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
    )

    // Create layerGroup for earthquakeMarkers
    let earthquakes = L.layerGroup(earthquakeMarkers);


    function makePolyline(feature){
      L.polyline(feature.geometry.coordinates);
    }
    
    let plates = L.geoJSON(platesData, {
      onEachFeature: makePolyline,
        style: {
          color: 'red',
          opacity: 0.9
        }
    })

  
 // Define satellite, streetmap, and darkmap layers
  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    maxZoom: 18,
    id: "satellite-streets-v11",
    accessToken: API_KEY
  });
  
  var streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    maxZoom: 18,
    id: "streets-v11",
    accessToken: API_KEY
  });

  var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satellite,
    "Street Map": streetMap,
    "Dark Map": darkMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Plates : plates
  };

  // Create our map, giving it the streetmap, earthquakes, and plates layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [darkMap, earthquakes, plates]
  });

  //Create a layer control
  //Pass in our baseMaps and overlayMaps
  //Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

// Add a legend to the map
var legend = L.control({ position: "bottomright" });

legend.onAdd = function(){
    var div = L.DomUtil.create("div","info legend");
    var magRange = [1, 2, 3, 4 , 5];
    var colors = ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"];

    for (var i = 0; i<magRange.length; i++) {
      div.innerHTML +=
      "<i style='background: " + colors[i] + "'></i> " +
      magRange[i] + (magRange[i + 1] ? "&ndash;" + magRange[i + 1] + "<br>" : "+");
    }
    return div;

  }; 

legend.addTo(myMap);

};

// Define a function to assign a color to the magnitude of the earthquake.
     function magColor(mag) {
      var color = "";
      if (mag <= 2) { color = "#ffffb2"; }
      else if (mag <= 3) {color = "#fecc5c"; }
      else if (mag <= 4) { color = "#fd8d3c"; }
      else if (mag <= 5) {color = "#f03b20"; }
      else { color = "#bd0026"; }
    
    return color;
    
    };
// Function to determine the radius of the circle depending on the depth of the earthquake.
function getRadius(depth) {
  return depth * 0.5;
  
};