console.log('script.js loaded');

document.addEventListener('DOMContentLoaded', function () {
    // Password toggle logic
    const pswdBtn = document.getElementById("pswdBtn");

    if (pswdBtn) {
        pswdBtn.addEventListener("click", function () {
            const pswdInput = document.getElementById("pword");
            const type = pswdInput.getAttribute("type");

            if (type === "password") {
                pswdInput.setAttribute("type", "text");
                pswdBtn.innerHTML = "Hide Password";
            } else {
                pswdInput.setAttribute("type", "password");
                pswdBtn.innerHTML = "Show Password";
            }
        });
    } else {
        console.log('Password button not found.');
    }

    // Toggle account manager view logic
    const toggleBtn = document.getElementById('toggleViewBtn');
    const container = document.querySelector('.account-management-container');

    if (toggleBtn && container) {
        toggleBtn.addEventListener('click', () => {
            container.classList.toggle('hidden');
            toggleBtn.textContent = container.classList.contains('hidden')
                ? 'Show Account Manager'
                : 'Hide Account Manager';
        });
    } else {
        console.log('Toggle button or account manager container not found.');
    }
});
