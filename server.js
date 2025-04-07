/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require('express-ejs-layouts')
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute"); 
const utilities = require('./utilities');
const session = require("express-session")
const pool = require('./database') 
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")


/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session)) ({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))





//Express Messages Middleware
app.use(require('connect-flash')())

app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
//Unit 5, Login activity
app.use(cookieParser())

app.use(utilities.checkJWTToken) 



/* ***********************
 * View Engine and Templates
 *************************/
app.set('view engine', 'ejs')
app.use(expressLayouts)
app.set('layout', './layouts/layout') 


/* ***********************
 * Serve Static Files 
 *************************/
app.use(express.static("public"));



/* ***********************
 * Routes
 *************************/
app.use(static)
//Index route
app.get("/", utilities.handleErrors(baseController.buildHome)) 
// Inventory routes
app.use("/inv", inventoryRoute);
app.use("/account", require("./routes/accountRoute"));
// Trigger error route (for testing)
app.use("/inv/trigger-error", inventoryRoute);





// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
}) 



/* ***********************
* Express Error Handler for 404
* This is for handling file not found errors.
*************************/
app.use(async (req, res, next) => {
  let nav = await utilities.getNav();
  res.status(404).render("errors/error", {
    title: "404 - Page Not Found",
    message: "The page you are looking for doesn't exist.",
    nav
  });
});


/* ***********************
* Express Error Handler for 500
* This will handle the 500 errors, including the ones from `/inv/trigger-error`
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  let status = err.status || 500; // Defaults to 500 if no status is set
  let message = (status === 404) 
    ? err.message 
    : "Oh no! There was a crash. Maybe try a different route?";

  res.status(status).render("errors/error", {
    title: `${status} - Server Error`,
    message,
    nav
  });
});




/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST  






/* ***********************
 * Trouble Shooting
 * 
 *************************/
app._router.stack.forEach((layer) => {
  if (layer.route) {
    console.log(layer.route.path);
  }
});

console.log("SESSION_SECRET in Render:", process.env.SESSION_SECRET ? "Loaded" : "Undefined");


/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
