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

//show login form when sign-up button is clicked on landing page
function showLoginForm() {
  $(".login-button").on("click", event => {
    $(".login-form").addClass("drop-in");
  });
}
