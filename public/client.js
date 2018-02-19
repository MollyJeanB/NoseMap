function listenSignup() {
  $(".signup-form").on("submit", event => {
    event.preventDefault();
    let password = $(".password-new").val();
    let username = $(".username-new").val();
    if (password.length < 7) {
      $(".passwarn").html(" Must be at least 7 characters");
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
    username: newUserCreds.username,
    password: newUserCreds.password
  };
  $.ajax({
    url: "/users",
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
  console.log(userCreds);
  $.ajax({
    url: "auth/login",
    method: "POST",
    data: JSON.stringify(userCreds),
    crossDomain: true,
    contentType: "application/json",
    success: loginSuccess
  });
}

function loginSuccess(response) {
  console.log("token added to storage");
  localStorage.setItem("TOKEN", response.authToken);
  showMap();
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
