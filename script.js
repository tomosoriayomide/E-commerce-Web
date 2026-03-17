document.addEventListener("DOMContentLoaded", () => {
  const loginFormContainer = document.getElementById("login-form");
  const registerFormContainer = document.getElementById("register-form");
  const showRegisterLink = document.getElementById("show-register");
  const showLoginLink = document.getElementById("show-login");

  const loginForm = document.getElementById("login-page");
  const registerForm = document.getElementById("register-page");

  // Function to switch forms
  const switchForm = (formToShow, formToHide) => {
    formToHide.classList.add("hide");
    setTimeout(() => {
      formToShow.classList.remove("hide");
    }, 100);
  };

  // Event listener for showing the register form
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    switchForm(registerFormContainer, loginFormContainer);
  });

  // Event listener for showing the login form
  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    switchForm(loginFormContainer, registerFormContainer);
  });
})
