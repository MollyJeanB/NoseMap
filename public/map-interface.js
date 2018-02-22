"use strict";

//this file contains functions for initiating and updating the map interface and markers

//global variable for map (via google maps Javascript API)
let map;
//global variable for user's geolocated position (or hardcoded position for demo data)
let myPosition;

let prev_infowindow = false;

//geolocate user's location via browser. If successful, call initSmellMap to initialize the map
function initMap() {
  if (isDemo) {
    //if map accessed through demo account, hardcode center of map to Portland
    myPosition = {
      lat: 45.5300958,
      lng: -122.6169967
    };
    initSmellMap(myPosition);
    //if authenticated user, center map on their location
  } else {
    navigator.geolocation.getCurrentPosition(initSmellMap, error => {
      alert(
        "Browser does not support geolocation. To access demo account, click log out"
      );
    });
  }
}

//display map
function initSmellMap(position) {
  if (isDemo) {
    let position = myPosition;
  } else
    myPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: myPosition,
    styles: mapStyle,
    fullscreenControl: false,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  });
  //call get function to get data from API and display on the map
  getSmells(displayMapData);
}

//iterate through response data and calls setNewMarker to place marker for each data object
function displayMapData(response) {
  for (var i = 0; i < response.length; i++) {
    setNewMarker(response[i]);
  }
}

//sets clickable markers and infowindows with title, description, category, date created, and location
function setNewMarker(data) {
  let smellId = data.id;
  let smellTitle = data.title;
  let smellDescription = data.description;
  let smellCategory = data.category;
  let smellCreated = data.publishedAt;
  let smellPosition = data.smellLocation;

  let smellText = `<div id="content-${smellId}" class="smell-box">
        <h3 class="smell-title">${smellTitle}</h3>
        <p>${smellDescription}</p>
        <p class="smelltext-category"><i>${smellCategory}</i></p>
        <p>${smellCreated}</p>
        <button onclick="listenEdit('${smellId}')"
class="edit-smell">Edit Smell</button>
        <button onclick="listenDelete('${smellId}')"
class="delete-smell">Delete Smell</button>
        </div>`;

  let infowindow = new google.maps.InfoWindow({
    content: smellText
  });
  const markerImage = "/images/littlenose.png";

  const marker = new google.maps.Marker({
    id: smellId,
    position: smellPosition,
    map: map,
    title: smellTitle,
    icon: markerImage
  });

  marker.setMap(map);

  marker.addListener("click", function() {
    if (prev_infowindow) {
      prev_infowindow.close();
    }
    prev_infowindow = infowindow;
    infowindow.open(map, marker);
  });
}
