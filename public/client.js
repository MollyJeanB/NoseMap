//global variable for map (via google maps Javascript API)
let map;
//global variable for user's geolocated position (or hardcoded position for demo data)
let myPosition;
let demoId = 10;
let isDemo = false;

//geolocate user's location. If successful, call initSmellMap to initialize the map
function initMap() {
  navigator.geolocation.getCurrentPosition(initSmellMap, error => {
    console.log("Error", error);
  });
}

//display map
function initSmellMap(position) {
  myPosition = {
    lat: position.coords.latitude,
    lng: position.coords.longitude
  };
  if (isDemo) {
    myPosition = {
      lat: 45.5300958,
      lng: -122.6169967
    };
  }
  console.log(myPosition);
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

//get all data from API
function getSmells(callback) {
  if (isDemo) {
    displayMapData(MOCK_SMELLS.mySmells);
  } else {
    const url = "/smells";
    $.getJSON(url, callback);
  }
}

//iterate through response data and calls setNewMarker to place marker for each data object
function displayMapData(response) {
  console.log(response);
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
        <h2 class="smell-title">${smellTitle}</h2>
        <p>${smellDescription}</p>
        <p>${smellCategory}</p>
        <p>${smellCreated}</p>
        <button onclick="listenEdit('${smellId}')"
class="edit-smell">Edit Smell</button>
        <button onclick="listenDelete('${smellId}')"
class="delete-smell">Delete Smell</button>
        </div>`;

  const infowindow = new google.maps.InfoWindow({
    content: smellText
  });
  const markerImage = "https://i.imgur.com/FVQb1CP.png";

  const marker = new google.maps.Marker({
    id: smellId,
    position: smellPosition,
    map: map,
    title: smellTitle,
    icon: markerImage
  });

  marker.setMap(map);

  marker.addListener("click", function() {
    infowindow.open(map, marker);
  });
}

//listen for when smell form is submitted and sends passes data to postSmell
function listenNewSmell() {
  $(".smell-form").on("submit", event => {
    event.preventDefault();
    console.log("new smell submitted");

    let mapCenter = map.getCenter();
    let smellPosition = {
      lat: mapCenter.lat(),
      lng: mapCenter.lng()
    };

    console.log(smellPosition);
    const smellData = {
      id: $(".id-input").val(),
      title: $(".smell-title").val(),
      description: $(".smell-description").val(),
      category: $("input[name=category]:checked", "#smellsubmit").val(),
      smellLocation: smellPosition
    };
    console.log("128 data sent for update", smellData);
    if (smellData.id) {
      putSmell(smellData);
    } else {
      postSmell(smellData);
    }
    hideForm();
    hideBullseye();
    document.getElementById("showform").disabled = false;
  });
}

//makes POST request to add or update data in the database
function postSmell(newSmellData) {
  console.log(newSmellData);
  if (isDemo) {
  } else {
    $.ajax({
      url: "/smells",
      method: "POST",
      data: JSON.stringify(newSmellData),
      crossDomain: true,
      contentType: "application/json",
      success: setNewMarker
    });
  }
}

//listens for when "Edit Smell" is clicked and calls getSmellbyId to get data for that smell
function listenEdit(smellId) {
  console.log("edit requested", smellId);
  document.getElementById("showform").disabled = true;
  getSmellbyId(smellId);
}

//get smell data with specific ID from database
function getSmellbyId(id) {
  const url = `/smells/${id}`;
  $.getJSON(url, formRepop);
}

function putSmell(updatedSmellData) {
  console.log(updatedSmellData);
  const id = updatedSmellData.id;
  $.ajax({
    url: `/smells/${id}`,
    method: "PUT",
    data: JSON.stringify(updatedSmellData),
    crossDomain: true,
    contentType: "application/json",
    success: response => {
      updateSmellWindow(response);
    }
  });
}

//repopulates smell form with data for that smell
function formRepop(response) {
  const smellTitle = response.title;
  const smellDescription = response.description;
  const smellCategory = response.category;
  const smellId = response.id;
  showForm();
  $(".smell-title").val(smellTitle);
  $(".smell-description").val(smellDescription);
  $(".id-input").val(smellId);
  document.forms["smellsubmit"][smellCategory].checked = true;
}

//update infowindow with updated smell data
function updateSmellWindow(data) {
  let smellId = data._id;
  let smellTitle = data.title;
  let smellDescription = data.description;
  let smellCategory = data.category;
  let smellCreated = data.publishedAt;
  let smellPosition = data.smellLocation;

  let smellText = `
        <h2 class="smell-title">${smellTitle}</h2>
        <p>${smellDescription}</p>
        <p>${smellCategory}</p>
        <p>${smellCreated}</p>
        <button onclick="listenEdit('${smellId}')"
class="edit-smell">Edit Smell</button>
        <button onclick="listenDelete('${smellId}')"
class="delete-smell">Delete Smell</button>
        `;
  document.getElementById("content-" + smellId).innerHTML = smellText;
}

// listen for when user clicks "Delete Smell" and makes DELETE REQUEST
function listenDelete(smellId) {
  console.log("delete requested", smellId);
  $.ajax({
    url: `/smells/${smellId}`,
    method: "DELETE",
    // data: JSON.stringify(newSmellData),
    crossDomain: true,
    contentType: "application/json",
    success: initMap
  });
}

function listenShowMap() {
  $(".demo-button").on("click", event => {
    isDemo = true;
    console.log("demo data requested");
    $("#landing").addClass("hidden");
    $("#main-content").removeClass("hidden");
    initMap();
  });
}

//callback function for when the page loads
function handleApp() {
  listenShowMap();
  listenShowNewSmell();
  listenInfoX();
  listenNewSmell();
  showLoginForm();
}

//when page loads, call handleApp
$(handleApp);
