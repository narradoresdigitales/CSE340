document.getElementById('toggle-password').addEventListener('click', function () {
    let passwordInput = document.getElementById('password');
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        this.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        this.textContent = "Show";
    }
});