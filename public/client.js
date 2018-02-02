let map;
let myPosition;
let smellId = 2;
// let popup, Popup;

let MOCK_SMELLS = {
  mySmells: [
    {
      id: 1,
      title: "poopy garbage",
      description: "diaper and yard waste smells from dumpster",
      category: "waste",
      intensity: 8,
      publishedAt: "Wed Jan 31 2018 09:26:10 GMT-0800 (PST)",
      smellLocation: {
        lat: 45.5376723,
        lng: -122.6211201
      }
    },
    {
      id: 2,
      title: "herbs and spices",
      description: "very calming, various kinds of tea and baked goods",
      category: "food and drink",
      intensity: 6,
      publishedAt: "Fri Feb 02 2018 09:26:10 GMT-0800 (PST)",
      smellLocation: {
        lat: 45.5050628,
        lng: -122.6280184
      }
    }
  ]
};

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
    center: myPosition
  });

  displayMapData(MOCK_SMELLS);
  listenNewSmell();
}

function displayMapData(data) {
  for (var index in data.mySmells) {
    let thisSmellId = data.mySmells[index].id;
    let smellTitle = data.mySmells[index].title;
    let smellDescription = data.mySmells[index].description;
    let smellCategory = data.mySmells[index].category;
    let smellCreated = data.mySmells[index].publishedAt;
    let smellPosition = data.mySmells[index].smellLocation;

    let smellText = `<div id="content" class="smell-box">
          <h2 class="smell-title">${smellTitle}</h2>
          <p>${smellDescription}</p>
          <p>${smellCategory}</p>
          <p>${smellCreated}</p>
          <button type="submit" onlick="listenUpdate(${thisSmellId})" class="edit-smell">Edit Smell</button>
          <button>Delete Smell</button>
          </div>`;

    const infowindow = new google.maps.InfoWindow({
      content: smellText
    });

    const marker = new google.maps.Marker({
      position: smellPosition,
      map: map,
      title: smellTitle
    });

    // popup = new Popup(
    //   new google.maps.LatLng(myPosition.lat, myPosition.lng),
    //   document.getElementById("content")
    // );
    //
    // popup.setMap(map);

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

function addDataToMap(newSmellData) {
  MOCK_SMELLS.mySmells.push(newSmellData);
}

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
      intensity: $(".intensity-slider").val(),
      publishedAt: thisDate,
      smellLocation: smellPosition
    };
    console.log(smellData);
    addDataToMap(smellData);
    initMap();
    $(".new-smell").addClass("hidden");
    document.getElementById("showform").disabled = false;
  });
}

//add find array element in ID function here

function listenUpdate(currentSmellId) {}
//
// function listenDelete() {}

function listenShowNewSmell() {
  $(".show-new-smell-form").on("click", event => {
    $(".new-smell").removeClass("hidden");
    map.addListener("dragend", event => {
      console.log(event);
    });
    document.getElementById("smellsubmit").reset();
    document.getElementById("showform").disabled = true;
    $(".bullseye").removeClass("hidden");
  });
}

function handleApp() {
  initMap();
  listenShowNewSmell();
  // listenDelete();
}

$(handleApp);
