let map;
let myPosition;
let smellId = 2;
// let popup, Popup;

let mapStyle = [
  {
    elementType: "geometry",
    stylers: [
      {
        color: "#242f3e"
      }
    ]
  },
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#746855"
      }
    ]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#242f3e"
      }
    ]
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563"
      }
    ]
  },
  {
    featureType: "administrative.neighborhood",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563"
      }
    ]
  },
  {
    featureType: "poi.business",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [
      {
        color: "#263c3f"
      }
    ]
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#6b9a76"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [
      {
        color: "#38414e"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#212a37"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#9ca5b3"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [
      {
        color: "#746855"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [
      {
        color: "#1f2835"
      }
    ]
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#f3d19c"
      }
    ]
  },
  {
    featureType: "transit",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [
      {
        color: "#2f3948"
      }
    ]
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#d59563"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [
      {
        color: "#17263c"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "labels.text",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#515c6d"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#17263c"
      }
    ]
  }
];

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
      category: "food",
      intensity: 6,
      publishedAt: "Fri Feb 02 2018 09:26:10 GMT-0800 (PST)",
      smellLocation: {
        lat: 45.5050628,
        lng: -122.6280184
      }
    },
    {
      id: 4,
      title: "rain on pines",
      description: "the parl after a storm",
      category: "nature",
      intensity: 6,
      publishedAt: "Sun Feb 04 2018 08:26:10 GMT-0800 (PST)",
      smellLocation: {
        lat: 45.52087156,
        lng: -122.62561797
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
    center: myPosition,
    styles: mapStyle
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

    const markerImage = "https://i.imgur.com/FVQb1CP.png";

    const marker = new google.maps.Marker({
      position: smellPosition,
      map: map,
      title: smellTitle,
      icon: markerImage
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
    $(".location").addClass("hidden");
  });
}

//add find array element in ID function here

// function listenUpdate(currentSmellId) {}
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
    $(".location").removeClass("hidden");
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
  // listenUpdate();
  // listenDelete();
}

$(handleApp);
