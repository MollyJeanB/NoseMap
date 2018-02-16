//global variable for map (via google maps Javascript API)
let map;
//global variable for user's geolocated position (or hardcoded position for demo data)
let myPosition;
//id to increment for demo data array. Registered users interact with the REST API and save their data to the database, while demo account users see how the app behaves with an array of pre-loaded data. They may add, update, and delete data from the array, but their changes will not be saved when the page reloads
let demoId = 19;
let isDemo = false;

function showMap() {
  $("#landing").addClass("hidden");
  $("#main-content").removeClass("hidden");
  $(".contain").removeClass("background");
  initMap();
}

//geolocate user's location via browser. If successful, call initSmellMap to initialize the map
function initMap() {
  navigator.geolocation.getCurrentPosition(initSmellMap, error => {
    console.log("Error", error);
  });
}

//display map
function initSmellMap(position) {
  if (isDemo) {
    //if map accessed through demo account, hardcode center of map to Portland
    myPosition = {
      lat: 45.5300958,
      lng: -122.6169967
    };
    //if authenticated user, center map on their location
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

function getSmells(callback) {
  //if demo account, get data from sample data array
  if (isDemo) {
    displayMapData(MOCK_SMELLS.mySmells);
    //if authenticated user, get all data from API
  } else {
    const url = "/smells";
    $.getJSON(url, callback);
  }
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

  const infowindow = new google.maps.InfoWindow({
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
    infowindow.open(map, marker);
  });
}

//listen for when smell form is submitted
function listenNewSmell() {
  $(".smell-form").on("submit", event => {
    event.preventDefault();

    let mapCenter = map.getCenter();
    let smellPosition = {
      lat: mapCenter.lat(),
      lng: mapCenter.lng()
    };

    const smellData = {
      id: $(".id-input").val(),
      title: $(".smell-title").val(),
      description: $(".smell-description").val(),
      category: $("input[name=category]:checked", "#smellsubmit").val(),
      smellLocation: smellPosition
    };

    if (isDemo) {
      //if demo account AND the data is being updated
      if (smellData.id) {
        smellData.publishedAt = moment(new Date()).format(
          "dddd, MMMM Do YYYY, h:mm:ss a"
        );
        updateSmellWindow(smellData);
        updateDataInArray(smellData);
        //if demo account and the data is new
      } else {
        const smellData = {
          id: demoId++,
          title: $(".smell-title").val(),
          description: $(".smell-description").val(),
          category: $("input[name=category]:checked", "#smellsubmit").val(),
          publishedAt: moment(new Date()).format(
            "dddd, MMMM Do YYYY, h:mm:ss a"
          ),
          smellLocation: smellPosition
        };
        setNewMarker(smellData);
        MOCK_SMELLS.mySmells.push(smellData);
      }
    } else {
      if (smellData.id) {
        putSmell(smellData);
      } else {
        postSmell(smellData);
      }
    }
    hideForm();
    hideBullseye();
    document.getElementById("showform").disabled = false;
  });
}

//makes POST request to add or update data in the database
function postSmell(newSmellData) {
  $.ajax({
    url: "/smells",
    method: "POST",
    data: JSON.stringify(newSmellData),
    crossDomain: true,
    contentType: "application/json",
    success: setNewMarker
  });
}

//listens for when "Edit Smell" is clicked and calls getSmellbyId to get data for that smell
function listenEdit(smellId) {
  document.getElementById("showform").disabled = true;
  if (isDemo) {
    let currentSmell = findIndexArray(smellId);
    formRepop(currentSmell);
  } else {
    getSmellbyId(smellId);
  }
}

//get smell data with specific ID from database
function getSmellbyId(id) {
  const url = `/smells/${id}`;
  $.getJSON(url, formRepop);
}

//makes put reqest with updated data
function putSmell(updatedSmellData) {
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

function findIndexArray(someId) {
  return MOCK_SMELLS.mySmells.find(element => {
    return element.id === parseInt(someId);
  });
}

function updateDataInArray(updatedSmellData) {
  let dataId = updatedSmellData.id;
  let dataIndex = findIndexArray(dataId);
  dataIndex = updatedSmellData;
}

//update infowindow with updated smell data
function updateSmellWindow(data) {
  let smellId;
  if (isDemo) {
    smellId = data.id;
  } else {
    smellId = data._id;
  }
  let smellTitle = data.title;
  let smellDescription = data.description;
  let smellCategory = data.category;
  let smellCreated = data.publishedAt;
  let smellPosition = data.smellLocation;

  let smellText = `
        <h3 class="smell-title">${smellTitle}</h3>
        <p>${smellDescription}</p>
        <p class="smelltext-category"><i>${smellCategory}</i></p>
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
  if (isDemo) {
    MOCK_SMELLS.mySmells.splice(parseInt(smellId) - 1, 1);
    initMap();
  } else {
    $.ajax({
      url: `/smells/${smellId}`,
      method: "DELETE",
      crossDomain: true,
      contentType: "application/json",
      success: initMap
    });
  }
}

function listenMapStartDemo() {
  $(".demo-button").on("click", event => {
    isDemo = true;
    showMap();
  });
}

function listenSignup() {
  $(".signup-form").on("submit", event => {
    event.preventDefault();
    let newUserCreds = {
      firstName: $(".firstname").val(),
      lastName: $(".lastname").val(),
      username: $(".username-new").val(),
      password: $(".password-new").val()
    };
    createUser(newUserCreds);
  });
}

function createUser(newUserCreds) {
  let userCreds = {
    username: newUserCreds.username,
    password: newUserCreds.password
  };
  $.ajax({
    url: "smells/users",
    method: "POST",
    data: JSON.stringify(newUserCreds),
    crossDomain: true,
    contentType: "application/json",
    success: login(userCreds)
  });
}

function listenLogin() {
  $(".login-form").on("submit", event => {
    event.preventDefault();
    let userCreds = {
      username: $(".username").val(),
      password: $(".password").val()
    };
    login(userCreds);
  });
}

function login(userCreds) {
  $.ajax({
    url: "auth/login",
    method: "POST",
    data: JSON.stringify(userCreds),
    crossDomain: true,
    contentType: "application/json",
    success: addTokenToLocalStorage
  });
}

function addTokenToLocalStorage(response) {
  localStorage.setItem("TOKEN", response.authToken);
}

//callback function for when the page loads
function handleApp() {
  $.ajaxSetup({
    dataType: "json",
    contentType: "application/json",
    headers: {
      Authorization: "JWT " + localStorage.getItem("TOKEN")
    }
  });

  listenMapStartDemo();
  listenShowNewSmell();
  listenInfoX();
  listenSignupX();
  listenLoginX();
  listenNewSmell();
  listenShowSignup();
  listenShowLogin();
  listenShowLoginFromSignup();
  listenLogin();
  listenSignup();
  listenRecenter();
}

//when page loads, call handleApp
$(handleApp);
