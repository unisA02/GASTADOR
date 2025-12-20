document
  .getElementById("registerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (localStorage.getItem(username)) {
      alert("Username already exists");
      return;
    }

    const user = {
      name,
      username,
      password,
    };

    localStorage.setItem(username, JSON.stringify(user));

    alert("Registration successful! Please login.");
    window.location.href = "../login/";
  });
