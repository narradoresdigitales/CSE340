const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
    return [
      // firstname is required and must be string
        body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), // on error this message is sent.

      // lastname is required and must be string
        body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 2 })
        .withMessage("Please provide a last name."), // on error this message is sent.

      // valid email is required and cannot already exist in the DB
        body("account_email")
        .trim()
        .escape()
        .notEmpty()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
          const emailExists = await accountModel.checkExistingEmail(account_email)
          if (emailExists) {
            throw new Error("Email exists. Please login or use different email")
          }
        }),

      // password is required and must be strong password
        body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
}

validate.loginRules = () => {
  return [
      // valid email is required
      body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail() // refer to validator.js docs
      .withMessage("A valid email is required."),

      // password is required
      body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required."),
  ]
}

/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
  })
      return
  }
  next()
}







/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
    })
        return
    }
    next()
}


validate.checkAccountType = async (req, res, next) => {
  try {
    const accountId = req.user.id; // Assuming user ID is stored in req.user
    const account = await accountModel.getAccountById(accountId);
    if (!account) {
      console.error('Account not found');
      throw new Error('Account not found');
    }

    const accountType = account.account_type; // Assuming account has a `account_type` field

    if (accountType === 'Admin' || accountType === 'Employee') {
      // Allow modification of the inventory for Admin or Employee
      next();
    } else {
      console.error('Forbidden: You do not have the required permissions to modify the inventory.');
      res.status(403).json({ message: 'Forbidden: You do not have the required permissions to modify the inventory.' });
    }
  } catch (error) {
    console.error('Error checking account type:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};







module.exports = validate