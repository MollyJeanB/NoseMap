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
  console.log(newSmellData);
  if (newSmellData.id) {
    $.ajax({
      url: "/smells",
      method: "POST",
      data: JSON.stringify(newSmellData),
      crossDomain: true,
      contentType: "application/json",
      success: response => {
        console.log(response, "line 48 response");
        updateSmellWindow(response);
      }
    });
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

function updateSmellWindow(data) {
  let thisSmellId = data._id;
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
        <button onclick="listenEdit('${thisSmellId}')"
class="edit-smell">Edit Smell</button>
        <button onclick="listenDelete(${thisSmellId})"
class="delete-smell">Delete Smell</button>
        `;
  // document.getElementById("content-" + thisSmellId).html(smellText);
  // const addText = $("#content-" + thisSmellId);
  document.getElementById("content-" + thisSmellId).innerHTML = smellText;
  console.log(data, thisSmellId);
  console.log(document.getElementById("content-" + thisSmellId));
}

function setNewMarker(data) {
  console.log("marker data sent", data);
  let thisSmellId = data.id;
  let smellTitle = data.title;
  let smellDescription = data.description;
  let smellCategory = data.category;
  let smellCreated = data.publishedAt;
  let smellPosition = data.smellLocation;

  let smellText = `<div id="content-${thisSmellId}" class="smell-box">
        <h2 class="smell-title">${smellTitle}</h2>
        <p>${smellDescription}</p>
        <p>${smellCategory}</p>
        <p>${smellCreated}</p>
        <button onclick="listenEdit('${thisSmellId}')"
class="edit-smell">Edit Smell</button>
        <button onclick="listenDelete(${thisSmellId})"
class="delete-smell">Delete Smell</button>
        </div>`;

  const infowindow = new google.maps.InfoWindow({
    content: smellText
  });
  const markerImage = "https://i.imgur.com/FVQb1CP.png";

  const marker = new google.maps.Marker({
    id: thisSmellId,
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
      id: $(".id-input").val(),
      title: $(".smell-title").val(),
      description: $(".smell-description").val(),
      category: $("input[name=category]:checked", "#smellsubmit").val(),
      smellLocation: smellPosition
    };
    console.log("128 data sent for update", smellData);
    postSmell(smellData);
    hideForm();
    hideBullseye();
    document.getElementById("showform").disabled = false;
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
  document.getElementById("showform").disabled = true;
  getSmellbyId(thisSmellId);
}

function getSmellbyId(id) {
  const url = `/smells/${id}`;
  $.getJSON(url, formRepop);
}

function formRepop(response) {
  const thisTitle = response.title;
  const thisDescription = response.description;
  const thisCategory = response.category;
  const thisId = response.id;
  showForm();
  $(".smell-title").val(thisTitle);
  $(".smell-description").val(thisDescription);
  $(".id-input").val(thisId);
  document.forms["smellsubmit"][thisCategory].checked = true;
  // document.getElementById("updatebutton").disabled = false;
  // document.getElementById("createbutton").disabled = true;
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
    showForm();
    showBullseye();
    map.addListener("dragend", event => {
      console.log(event);
    });
    document.getElementById("smellsubmit").reset();
    document.getElementById("showform").disabled = true;
  });
}

function showForm() {
  $(".new-smell").addClass("slide-out");
  $(".icon-explain").addClass("icon-disappear");
}

function hideForm() {
  $(".new-smell").removeClass("slide-out");
  $(".icon-explain").removeClass("icon-disappear");
}

function showBullseye() {
  $(".bullseye").addClass("fade-in-bullseye");
  $(".location-explain").addClass("fade-in");
}

function hideBullseye() {
  $(".bullseye").removeClass("fade-in-bullseye");
  $(".location-explain").removeClass("fade-in");
}

function listenInfoX() {
  $(".close").on("click", event => {
    hideForm();
    hideBullseye();
    document.getElementById("showform").disabled = false;
  });
}

function handleApp() {
  initMap();
  listenShowNewSmell();
  listenInfoX();
  listenNewSmell();
}

$(handleApp);
