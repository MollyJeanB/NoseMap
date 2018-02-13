function showLoginForm() {
  $(".login-button").on("click", event => {
    $(".login-form").addClass("drop-in");
  });
}

function handleApp() {
  showLoginForm();
}

$(handleApp);
