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
/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/accountManagement")
        } else {
            req.flash("notice", "Please check your credentials and try again.")
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
    let nav = await utilities.getNav()

    req.flash('notice', "You are logged in.")
    res.render("account/accountManagement", {
        title: "Account Management",
        nav,
        errors: null,
        flash: req.flash('notice')
    })
}




module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement }
