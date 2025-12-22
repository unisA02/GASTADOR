document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const user = localStorage.getItem(username);

    if (!user) {
      alert("User not found");
      return;
    }

    const parsedUser = JSON.parse(user);

    if (parsedUser.password !== password) {
      alert("Incorrect password");
      return;
    }

    localStorage.setItem("user", JSON.stringify(parsedUser));
    window.location.href = "../start.html";
  });

  