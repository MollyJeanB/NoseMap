let map;
let myPosition;

function getSmells(callback) {
  const url = "/smells";
  $.getJSON(url, callback);
}

function getCurrentPositionSuccess(position) {
  myPosition = {
    // lat: position.coords.latitude,
    // lng: position.coords.longitude
    lat: 45.5300958,
    lng: -122.6169967
  };
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

  getSmells(displayMapData);
}

function initMap() {
  console.log("called initMap");
  navigator.geolocation.getCurrentPosition(getCurrentPositionSuccess, error => {
    console.log("Error", error);
  });
}

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

function setNewMarker(data) {
  let thisSmellId = data.id;
  let smellTitle = data.title;
  let smellDescription = data.description;
  let smellCategory = data.category;
  let smellCreated = data.publishedAt;
  let smellPosition = data.smellLocation;

  let smellText = `<div id="content" class="smell-box">
        <h2 class="smell-title">${smellTitle}</h2>
        <p>${smellDescription}</p>
        <p>${smellCategory}</p>
        <p>${smellCreated}</p>
        <button class="edit-button">Edit Smell</button>
        <button onclick="listenEdit(${thisSmellId})"
class="edit-smell">Edit Smell old</button>
        <button onclick="listenDelete(${thisSmellId})"
class="delete-smell">Delete Smell</button>
        </div>`;

  const infowindow = new google.maps.InfoWindow({
    content: smellText
  });
  const markerImage = "https://i.imgur.com/FVQb1CP.png";

  const marker = new google.maps.Marker({
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

function displayMapData(response) {
  console.log(response);
  for (var i = 0; i < response.length; i++) {
    setNewMarker(response[i]);
  }
}

function listenNewEdit() {
  $(".edit-button").on("click", event => {
    event.preventDefault();
    console.log(event.currentTarget);
  });
}
//
// function updateMapData(newDataforId) {
//   let thisDataId = newDataforId.id;
//   let thisDataIndex = findIndexArray(thisDataId);
//   MOCK_SMELLS.mySmells.splice(thisDataIndex, 1);
//   MOCK_SMELLS.mySmells.push(newDataforId);
// }
//
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
      title: $(".smell-title").val(),
      description: $(".smell-description").val(),
      category: $("input[name=category]:checked", "#smellsubmit").val(),
      smellLocation: smellPosition
    };
    console.log(smellData);
    postSmell(smellData);
    toggleForm();
    document.getElementById("showform").disabled = false;
    // $(".location").addClass("hidden");
    toggleBullseye();
  });
}

// function listenUpdateButton(updatedSmell) {
//   $(".update-smell-button").on("click", event => {
//     event.preventDefault();
//     console.log("smell update submitted");
//     let sameDate = updatedSmell.publishedAt;
//     let sameLocation = updatedSmell.smellLocation;
//     let sameId = updatedSmell.id;
//     const updatedSmellData = {
//       id: sameId,
//       title: $(".smell-title").val(),
//       description: $(".smell-description").val(),
//       category: $("input[name=category]:checked", "#smellsubmit").val(),
//       publishedAt: sameDate,
//       smellLocation: sameLocation
//     };
//     updateMapData(updatedSmellData);
//     initMap();
//     $(".new-smell").addClass("hidden");
//     document.getElementById("showform").disabled = false;
//     $(".location").addClass("hidden");
//   });
// }
//
// function findInArray(someId) {
//   return MOCK_SMELLS.mySmells.find(element => {
//     return element.id == someId;
//   });
// }
//
// function findIndexArray(someId) {
//   return MOCK_SMELLS.mySmells.find(element => {
//     return element.id == someId;
//   });
// }
//
function listenEdit(thisSmellId) {
  console.log("edit requested");
  console.log(thisSmellId);
  // let thisSmell = findIndexArray(thisSmellId);
  // console.log(thisSmell);
  // const thisTitle = thisSmell.title;
  // const thisDescription = thisSmell.description;
  // const thisCategory = thisSmell.category;
  // $(".new-smell").removeClass("hidden");
  // $(".smell-title").val(thisTitle);
  // $(".smell-description").val(thisDescription);
  // document.forms["smellsubmit"][thisCategory].checked = true;
  // document.getElementById("updatebutton").disabled = false;
  // document.getElementById("createbutton").disabled = true;
  // listenUpdateButton(thisSmell);
}
//
// function listenDelete(thisSmellId) {
//   console.log(thisSmellId);
//   let thisSmellIndex = findIndexArray(thisSmellId);
//   console.log(thisSmellIndex);
//   MOCK_SMELLS.mySmells.splice(thisSmellIndex, 1);
//   initMap();
// }
//
function listenShowNewSmell() {
  $(".show-new-smell-form").on("click", event => {
    console.log("new smell form requested");
    toggleForm();
    map.addListener("dragend", event => {
      console.log(event);
    });
    document.getElementById("smellsubmit").reset();
    document.getElementById("showform").disabled = true;
    // $(".location").removeClass("hidden");
    toggleBullseye();
  });
}

function toggleForm() {
  $(".new-smell").toggleClass("slide-out");
}

function toggleBullseye() {
  $(".bullseye").toggleClass("fade-in-bullseye");
  $(".location-explain").toggleClass("fade-in");
}

function listenInfoX() {
  $(".close").on("click", event => {
    toggleForm();
    document.getElementById("showform").disabled = false;
    // $(".location").addClass("hidden");
    toggleBullseye();
  });
}

function handleApp() {
  initMap();
  listenShowNewSmell();
  listenInfoX();
  listenNewSmell();
  listenNewEdit();
}

$(handleApp);
