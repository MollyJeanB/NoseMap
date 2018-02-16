//listen for when "Add New Smell" is clicked display form and location bullseye
function listenShowNewSmell() {
  $(".show-new-smell-form").on("click", event => {
    console.log("new smell form requested");
    showForm();
    showBullseye();
    //reset smell form
    document.getElementById("smellsubmit").reset();
    //disable button when form is displayed
    document.getElementById("showform").disabled = true;
  });
}

//show form with slide-out transition and fade out "click the nose icons to see smell info" label
function showForm() {
  $(".new-smell").addClass("slide-out");
  $(".icon-explain").addClass("icon-disappear");
}

//hide form with slide transition and fade in "click the nose icons to see smell info" label
function hideForm() {
  $(".new-smell").removeClass("slide-out");
  $(".icon-explain").removeClass("icon-disappear");
}

//fade in bullseye circle and explanation text
function showBullseye() {
  $(".bullseye").addClass("fade-in-bullseye");
  $(".location-explain").addClass("fade-in");
}

//fade in bullseye circle and explanation text
function hideBullseye() {
  $(".bullseye").removeClass("fade-in-bullseye");
  $(".location-explain").removeClass("fade-in");
}

//hide form and location bullseye when closure X is clicked
function listenInfoX() {
  $(".close").on("click", event => {
    hideForm();
    hideBullseye();
    //enable "Add New Smell Button"
    document.getElementById("showform").disabled = false;
  });
}

//re-iniate map when user clicks logo in top corner
function listenRecenter() {
  $(".nose-logo").on("click", event => {
    initMap();
  });
}

//hide signup form when closure x is clicked
function listenSignupX() {
  $(".close-su").on("click", event => {
    $(".signup-form-contain").removeClass("drop-in");
  });
}

//hide login form when closure x is clicked
function listenLoginX() {
  $(".close-login").on("click", event => {
    $(".login-form-contain").removeClass("slide-out-right");
  });
}

//transitions for showing login form
function showLogin() {
  $(".login-form-contain").addClass("slide-out-right");
  $(".signup-form-contain").removeClass("drop-in");
}

//show login form when user clicks "Log In button from landing page"
function listenShowLogin() {
  $(".show-login").on("click", event => {
    showLogin();
  });
}

//show login form and hide sign-up form when user clicks "Already Have an Account?"
function listenShowLoginFromSignup() {
  $(".show-login-from-signup").on("click", event => {
    showLogin();
  });
}

//show sign-up form when Sign Up button is clicked on landing page and hide login form
function listenShowSignup() {
  $(".show-signup-button").on("click", event => {
    $(".signup-form-contain").addClass("drop-in");
    $(".login-form-contain").removeClass("slide-out-right");
  });
}
