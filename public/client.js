let map;

let MOCK_SMELLS = {
  mySmells: [
    {
      title: "poopy garbage",
      description: "diaper and yard waste smells from dumpster",
      category: "waste",
      intensity: 8,
      publishedAt: 1470016976609,
      smellLocation: {
        lat: 45.5376723,
        lng: -122.6211201
      }
    },
    {
      title: "herbs and spices",
      description: "very calming, various kinds of tea and baked goods",
      category: "food and drink",
      intensity: 6,
      publishedAt: 1470017976609,
      smellLocation: {
        lat: 45.5050628,
        lng: -122.6280184
      }
    },
    {
      title: "rain on asphalt",
      description: "nostalgic smell of rain beginning",
      catgory: "nature and environment",
      intensity: 4,
      publishedAt: 1470017976709,
      smellLocation: {
        lat: 45.5300958,
        lng: -122.6169967
      }
    }
  ]
};

function getCurrentPositionSuccess(position) {
  var myPosition = {
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
}

function displayMapData(data) {
  for (var index in data.mySmells) {
    let smellTitle = data.mySmells[index].title;
    let smellDescription = data.mySmells[index].description;
    let smellCategory = data.mySmells[index].category;
    let smellCreated = data.mySmells[index].publishedAt;
    let smellPosition = data.mySmells[index].smellLocation;

    let smellText = `<div id="content" class="smell-box">
          <h1 class="smell-title">${smellTitle}</h1>
          <p>${smellDescription}</p>
          <p>${smellCategory}</p>
          <p>${smellCreated}</p>
          </div>`;

    const infowindow = new google.maps.InfoWindow({
      content: smellText
    });

    const marker = new google.maps.Marker({
      position: smellPosition,
      map: map,
      title: smellTitle
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

$(initMap);
