"use strict";

//this file contains functions for loading the page and handling user signup and login

//listens for when user clicks to demo button from the landing page
function listenMapStartDemo() {
  $(".demo-button").on("click", event => {
    //sets state of isDemo variable to true
    isDemo = true;
    //calls showMapOrLanding with loggedIn set to "true"
    showMapOrLanding(true);
  });
}

function showMapOrLanding(loggedIn) {
  //if not loggedIn, show landing oage
  if (!loggedIn) {
    $("#landing").removeClass("hidden");
    $("#main-content").addClass("hidden");
    $(".contain").addClass("background");
  } else {
    //if logged in, hide landing page and initiate the map
    $("#landing").addClass("hidden");
    $("#main-content").removeClass("hidden");
    $(".contain").removeClass("background");
    initMap();
  }
}

//checks if string has white space
function hasWhiteSpace(string) {
  return string.indexOf(" ") >= 0;
}

//listens for when user submits signup form
function listenSignup() {
  $(".signup-form").on("submit", event => {
    event.preventDefault();
    let password = $(".password-new").val();
    let username = $(".username-new").val();
    //if password is too short, show warning
    if (password.length < 7) {
      $(".passwarn").html(" Must be at least 7 characters");
      //if password or username has white space, show warning
    } else if (hasWhiteSpace(password) === true) {
      $(".passwarn").html(" Cannot contain spaces");
    } else if (hasWhiteSpace(username) === true) {
      $(".userwarn").html(" Cannot contain spaces");
    } else {
      let newUserCreds = {
        firstName: $(".firstname").val(),
        lastName: $(".lastname").val(),
        username: username,
        password: password
      };
      createUser(newUserCreds);
    }
  });
}

function createUser(newUserCreds) {
  let userCreds = {
    firstName: newUserCreds.firstName,
    username: newUserCreds.username,
    password: newUserCreds.password
  };
  //post new user data
  $.ajax({
    url: "/users",
    method: "POST",
    data: JSON.stringify(newUserCreds),
    crossDomain: true,
    contentType: "application/json",
    //on success, call showSuccessBox
    success: () => {
      showSuccessBox(userCreds);
    },
    //if error, call userDuplicate
    error: userDuplicate
  });
}

//warn that username is already taken
function userDuplicate() {
  $(".userwarn").html(" Username already taken");
}

//show welcome message with user's firstname
function showSuccessBox(userCreds) {
  let userGreeting = userCreds.firstName;
  $(".new-user-text").html(userGreeting);
  $(".success-box").removeClass("hidden");
  listenFirstLogin(userCreds);
  document.getElementById("show-login-button").disabled = true;
}

//listen for when new user logs in from success box
function listenFirstLogin(newUserCreds) {
  let userCreds = {
    username: newUserCreds.username,
    password: newUserCreds.password
  };
  $(".login-new-user").on("click", event => {
    event.preventDefault();
    //call login, passing user's password and username credentials
    login(userCreds);
  });
}

//listen for when user submits login form and calls login with the credentials entered on the form
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

//sends POST request to auth/login
function login(userCreds) {
  $.ajax({
    url: "auth/login",
    method: "POST",
    data: JSON.stringify(userCreds),
    crossDomain: true,
    contentType: "application/json",
    success: loginSuccess,
    error: loginFailMessage
  });
}

//if login fails, show warning
function loginFailMessage() {
  $(".loginwarn").html("Login failed. Please try again.");
}

//if login succeeds, create token and call showUserMap
function loginSuccess(response) {
  localStorage.setItem("TOKEN", response.authToken);
  showUserMap();
}

//call newToken and call showMapOrLanding with loggedIn set to "true" in order to show and init map
function showUserMap() {
  newToken();
  showMapOrLanding(true);
}

//sets up token in header for ajax requests so user can access their account and data
function newToken() {
  $.ajaxSetup({
    dataType: "json",
    contentType: "application/json",
    headers: {
      Authorization: "JWT " + localStorage.getItem("TOKEN")
    }
  });
}

//checks if JWT token is already in local storage
function isLoggedIn() {
  return localStorage.getItem("TOKEN");
}

//listen for when user clicks "Log Out", removes JWT token from local storage, and reloads the page
function listenLogout() {
  $(".logout-button").on("click", event => {
    localStorage.removeItem("TOKEN");
    location.reload();
  });
}

//callback function for when the page loads
function handleApp() {
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
  listenLogout();

  //check whether user is logged in and either calls showUserMap to show the user's account or showMapOrLanding to show the landing page
  if (isLoggedIn()) {
    showUserMap();
  } else {
    showMapOrLanding();
  }
}

//when page loads, call handleApp
$(handleApp);
