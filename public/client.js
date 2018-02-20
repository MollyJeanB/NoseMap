"use strict";

function hasWhiteSpace(string) {
  return string.indexOf(" ") >= 0;
}

function listenSignup() {
  $(".signup-form").on("submit", event => {
    event.preventDefault();
    let password = $(".password-new").val();
    let username = $(".username-new").val();
    if (password.length < 7) {
      $(".passwarn").html(" Must be at least 7 characters");
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
  $.ajax({
    url: "/users",
    method: "POST",
    data: JSON.stringify(newUserCreds),
    crossDomain: true,
    contentType: "application/json",
    success: showSuccessBox(userCreds),
    //not working as expected. duplicate users can be created, but then they error on login. May have something to do with when user gets created vs. when success gets called again
    error: userDuplicate
  });
}

function userDuplicate() {
  $(".userwarn").html(" Username already taken");
}

function showSuccessBox(userCreds) {
  let userGreeting = userCreds.firstName;
  $(".new-user-text").html(userGreeting);
  $(".success-box").removeClass("hidden");
  listenFirstLogin(userCreds);
  //disable login button in corner herre
}

function listenFirstLogin(newUserCreds) {
  let userCreds = {
    username: newUserCreds.username,
    password: newUserCreds.password
  };
  $(".login-new-user").on("click", event => {
    event.preventDefault();
    login(userCreds);
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
  console.log(userCreds);
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

function loginFailMessage() {
  $(".loginwarn").html("Login failed. Please try again.");
}

function showUserMap() {
  newToken();
  showMap(true);
}

function loginSuccess(response) {
  console.log("token added to storage");
  localStorage.setItem("TOKEN", response.authToken);
  showUserMap();
}

function newToken() {
  $.ajaxSetup({
    dataType: "json",
    contentType: "application/json",
    headers: {
      Authorization: "JWT " + localStorage.getItem("TOKEN")
    }
  });
}

function isLoggedIn() {
  return localStorage.getItem("TOKEN");
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
  listenRecenter();

  if (isLoggedIn()) {
    showUserMap();
  } else {
    showMap();
  }
}

//when page loads, call handleApp
$(handleApp);
