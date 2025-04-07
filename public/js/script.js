console.log('script.js loaded')

document.addEventListener('DOMContentLoaded', function () {
    // Get the button element by ID (no need for the '#')
    const pswdBtn = document.getElementById("pswdBtn");

    // Check if the button exists before adding the event listener
    if (pswdBtn) {
        pswdBtn.addEventListener("click", function () {
            const pswdInput = document.getElementById("pword");
            const type = pswdInput.getAttribute("type");
            
            // Toggle the password visibility
            if (type === "password") {
                pswdInput.setAttribute("type", "text");
                pswdBtn.innerHTML = "Hide Password";  // Change button text
            } else {
                pswdInput.setAttribute("type", "password");
                pswdBtn.innerHTML = "Show Password";  // Change button text
            }
        });
    } else {
        console.log('Password button not found.');
    }
});
