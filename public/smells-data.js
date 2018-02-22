"use strict";

//this file contains functions that allow users to retrieve, create, update, and delete data from the REST API (or allow demo users to interact with the sample data)

//id to increment for demo data array. Registered users interact with the REST API and save their data to the database, while demo account users see how the app behaves with an array of pre-loaded data. They may add, update, and delete data from the array, but their changes will not be saved when the page reloads
let demoId = 19;
let isDemo = false;

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

//listen for when smell form is submitted
function listenNewSmell() {
  $(".smell-form").on("submit", event => {
    event.preventDefault();
    //check if title input is white space and warn if so
    if ($.trim($(".smell-title").val()) == "") {
      alert("Title is blank");
    } else {
      //record position of the smell as the center of the map
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
        //if user account and the data already has an id, make PUT request to update
        if (smellData.id) {
          putSmell(smellData);
          //if user account and the data is new, make POST request to create
        } else {
          postSmell(smellData);
        }
      }
      //after request is submitted, hide the form, the map center bullseye, and re-enable the button to create more data
      hideForm();
      hideBullseye();
      document.getElementById("showform").disabled = false;
    }
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

//listens for when "Edit Smell" is clicked
function listenEdit(smellId) {
  document.getElementById("showform").disabled = true;
  if (isDemo) {
    //if demo, find the correct smell object in the array call formRepop
    let currentSmell = findIndexArray(smellId);
    formRepop(currentSmell);
  } else {
    //if user account, call getSmellById with that Id
    getSmellById(smellId);
  }
}

function findIndexArray(someId) {
  return MOCK_SMELLS.mySmells.find(element => {
    //return object with id (parsed to integer)
    return element.id === parseInt(someId);
  });
}

//get smell data with specific ID from database
function getSmellById(id) {
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
    //on success, call updatedSmellWindow to update text in DOM
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

//if demo, update data in array
function updateDataInArray(updatedSmellData) {
  let dataId = updatedSmellData.id;
  let dataIndex = findIndexArray(dataId);
  dataIndex = updatedSmellData;
}

//update infowindow with updated smell data
function updateSmellWindow(data) {
  let smellId;
  let smellCreated;
  if (isDemo) {
    smellId = data.id;
    smellCreated = moment(new Date()).format("dddd, MMMM Do YYYY, h:mm:ss a");
  } else {
    smellId = data._id;
    smellCreated = moment(data.publishedAt).format(
      "dddd, MMMM Do YYYY, h:mm:ss a"
    );
  }
  let smellTitle = data.title;
  let smellDescription = data.description;
  let smellCategory = data.category;
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

// listen for when user clicks "Delete Smell" and makes DELETE request
function listenDelete(smellId) {
  if (isDemo) {
    //if demo, remove data object from array
    MOCK_SMELLS.mySmells.splice(parseInt(smellId) - 1, 1);
    //re-initiate the map
    initMap();
  } else {
    //if user account, make DELETE request and re-initiate the map
    $.ajax({
      url: `/smells/${smellId}`,
      method: "DELETE",
      crossDomain: true,
      contentType: "application/json",
      success: initMap
    });
  }
}
