const accountModel = require('../models/account-model');
const utilities = require('../utilities')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
* Deliver login view
*
* ***************************************** */

async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
* Deliver  registration view
*
* ***************************************** */

async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
        res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const 
    { account_firstname, 
    account_lastname, 
    account_email, 
    account_password,
    } = req.body

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", "Sorry, there was an error processing the registration. ")
        res.render(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }


    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )
    console.log(req.flash('notice')); 

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you are registered ${account_firstname}. Please log in.`)
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
            
        })
    }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    console.log("Login attempt for:", account_email)
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        console.log("No account found for:", account_email)
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            console.log("Password match for:", account_email)
            delete accountData.account_password

        // Store account_type in the session
        req.session.account_type = accountData.account_type;

            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            console.log("Redirecting to account management for:", account_email)
            return res.redirect("/account/accountManagement/")
        } else {
            req.flash("notice", "Please check your credentials and try again.")
            console.log("Password mismatch for:", account_email)
            return res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        console.error("Error during login:", error)
        throw new Error('Access Forbidden')
    }
}

/* ****************************************
* Deliver account management view
* ***************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav(); 

    console.log("Account Type from Session: ", req.session.account_type);  // Log the session value

    try {
        const accounts = await accountModel.getAllAccounts(); 

        req.flash('notice', "You are logged in.");
        console.log("Logged-in user account type: ", req.session.account_type);
        res.render("account/accountManagement", {
        title: "Account Management",
        nav,
        errors: null,
        accounts, 
        loggedIn: req.session.loggedin,      
        account_type: req.session.account_type   
    });
    } catch (error) {
      next(error); // 
    }
} 

// Reset password logic
async function resetPassword(req, res, next)  {
    try {
        const accountId = req.params.account_id; 
        const newPassword = req.body.account_password; 

        // Hash the new password before saving it
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await accountModel.updatePassword(accountId, hashedPassword);

        // Flash success message and redirect to account management page
        req.flash('notice', 'Password has been successfully reset.');
        res.redirect('/account/accountManagement'); // Redirect to Account Management page
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).send("Internal Server Error");
    }
};

async function deleteAccount(req, res, next) {
    try {
        const accountId = req.params.account_id;

        // Perform delete operation in the database
        await accountModel.deleteAccount(accountId);

        // Flash success message and redirect
        req.flash('notice', 'Account has been successfully deleted.');
        res.redirect('/account/accountManagement'); // Redirect to Account Management page
    } catch (error) {
        console.error("Error deleting account:", error);
        res.status(500).send("Internal Server Error");
    }
}







// Render the password reset form (GET route)
async function showResetPasswordForm(req, res, next) {
    try {
        const accountId = req.params.account_id;  // Get the account ID from the URL
        const account = await accountModel.findById(accountId); // Fetch account details by ID

        if (!account) {
            req.flash('error', 'Account not found');
            return res.redirect('/account/accountManagement');
        }

        // Render the reset password form and pass the account ID to the view
        res.render('account/resetPassword', { accountId });
    } catch (error) {
        console.error("Error fetching account details:", error);
        req.flash('error', 'An error occurred while loading the reset password form.');
        res.redirect('/account/accountManagement');
    }
}


// Controller to render the reset password page
async function showResetPasswordPage(req, res, next) {
    try {
      const accountId = req.params.account_id;  // Retrieve account ID from the URL
      res.render('account/resetPassword', { accountId: accountId });  // Render the form
    } catch (error) {
        console.error("Error showing reset password page:", error);
        res.status(500).send("Internal Server Error");
    }
}



module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, resetPassword, showResetPasswordForm, showResetPasswordPage, deleteAccount }
