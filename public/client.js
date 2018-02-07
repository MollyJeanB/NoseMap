let map;
let myPosition;

function getSmells(callback) {
  const url = "../smells";
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
    styles: mapStyle
  });
  getSmells(displayMapData);
  listenNewSmell();
}

function displayMapData(response) {
  console.log(response);
  for (var i = 0; i < response.length; i++) {
    let thisSmellId = response[i].id;
    let smellTitle = response[i].title;
    let smellDescription = response[i].description;
    let smellCategory = response[i].category;
    let smellCreated = response[i].publishedAt;
    let smellPosition = response[i].smellLocation;

    let smellText = `<div id="content" class="smell-box">
          <h2 class="smell-title">${smellTitle}</h2>
          <p>${smellDescription}</p>
          <p>${smellCategory}</p>
          <p>${smellCreated}</p>
          <button onclick="listenUpdate(${thisSmellId})"
class="edit-smell">Edit Smell</button>
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
}

function initMap() {
  console.log("called initMap");
  navigator.geolocation.getCurrentPosition(getCurrentPositionSuccess, error => {
    console.log("Error", error);
  });
}

// function addDataToMap(newSmellData) {
//   MOCK_SMELLS.mySmells.push(newSmellData);
// }
//
// function updateMapData(newDataforId) {
//   let thisDataId = newDataforId.id;
//   let thisDataIndex = findIndexArray(thisDataId);
//   MOCK_SMELLS.mySmells.splice(thisDataIndex, 1);
//   MOCK_SMELLS.mySmells.push(newDataforId);
// }
//
function listenNewSmell() {
  $(".smell-form").submit(event => {
    event.preventDefault();
    console.log("new smell submitted");
    let thisDate = new Date();
    let smellPosition = map.getCenter();
    console.log(smellPosition);
    const smellData = {
      id: smellId++,
      title: $(".smell-title").val(),
      description: $(".smell-description").val(),
      category: $("input[name=category]:checked", "#smellsubmit").val(),
      publishedAt: thisDate,
      smellLocation: smellPosition
    };
    console.log(smellData);
    addDataToMap(smellData);
    initMap();
    $(".new-smell").addClass("hidden");
    document.getElementById("showform").disabled = false;
    $(".location").addClass("hidden");
  });
}
//
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
//
// function listenUpdate(thisSmellId) {
//   console.log(thisSmellId);
//   let thisSmell = findIndexArray(thisSmellId);
//   console.log(thisSmell);
//   const thisTitle = thisSmell.title;
//   const thisDescription = thisSmell.description;
//   const thisCategory = thisSmell.category;
//   $(".new-smell").removeClass("hidden");
//   $(".smell-title").val(thisTitle);
//   $(".smell-description").val(thisDescription);
//   document.forms["smellsubmit"][thisCategory].checked = true;
//   document.getElementById("updatebutton").disabled = false;
//   document.getElementById("createbutton").disabled = true;
//   listenUpdateButton(thisSmell);
// }
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
    $(".new-smell").removeClass("hidden");
    map.addListener("dragend", event => {
      console.log(event);
    });
    document.getElementById("smellsubmit").reset();
    document.getElementById("showform").disabled = true;
    $(".location").removeClass("hidden");
    document.getElementById("updatebutton").disabled = true;
  });
}

function listenInfoX() {
  $(".close").on("click", event => {
    $(".new-smell").addClass("hidden");
    document.getElementById("showform").disabled = false;
    $(".location").addClass("hidden");
  });
}

function handleApp() {
  initMap();
  listenShowNewSmell();
  listenInfoX();
}

$(handleApp);
