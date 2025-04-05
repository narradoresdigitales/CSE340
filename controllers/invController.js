const router = require('express').Router()
const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);
    req.inventoryData = data;  // Store data for the next handler
    next();  // Pass control to the next middleware/route handler
  } catch (error) {
    next(error);  // Pass error to error handling middleware
  }
};





invCont.showVehicleDetail = async function(req, res, next) {
  try {
    const inv_id = req.params.invId;
    const vehicle = await invModel.getVehicleByInvId(inv_id);
    console.log("Vehicle Data in Controller:", vehicle);
    if (!vehicle) throw new Error('Vehicle not found');
    
    const grid = await utilities.buildGetVehicleByIdGrid([vehicle]);
    let nav = await utilities.getNav();
    
    res.render("inventory/vehicle-detail", {
      title: `${vehicle.inv_year} ${vehicle.inv_model} ${vehicle.inv_make}`,
      vehicle,
      nav,
      grid,
      errors: null,
    });
  } catch (error) {
    console.error('Error in showVehicleDetail:', error);
    res.redirect('/');
  }
};

invCont.buildManagementView = async function(req, res, next) {
  console.log("Building management view");
  let nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();
  const classificationSelect = await utilities.buildClassificationList(classifications.rows); // <-- fix here
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect
  });
};



invCont.showAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/addClassification", {
    title: "Add Vehicle Classification",
    flash: req.flash('info'),
    nav,
    errors: null,
  });
};

invCont.addInventory = async function(req, res, next) {
  let nav = await utilities.getNav();
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body;
  const errors = [];

  // Server-side validation
  if (!classification_id || !inv_make || !inv_model || !inv_year || !inv_description || !inv_image || !inv_thumbnail || !inv_price || !inv_miles || !inv_color) {
    errors.push({ msg: "All fields are required." });
  }

  if (errors.length > 0) {
    let classifications = await invModel.getClassifications();
    res.render("inventory/addInventory", {
      title: "Add New Vehicle",
      flash: null,
      nav,
      errors,
      classifications: classifications.rows,
    });
  } else {
    try {
      await invModel.insertVehicle({
        classification_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
      });
      req.flash('info', 'Vehicle added successfully.');
      nav = await utilities.getNav(); // Re-generate the navigation bar
      res.redirect('/inv');
    } catch (err) {
      errors.push({ msg: err.message });
      let classifications = await invModel.getClassifications();
      res.render("inventory/addInventory", {
        title: "Add New Vehicle",
        flash: null,
        nav,
        errors,
        classifications: classifications.rows,
      });
    }
  }
};

// Add a function to handle form submission and insertion into the database
invCont.addClassification = async function(req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  const errors = [];

  // Server-side validation
  const regex = /^[a-zA-Z0-9]+$/;
  if (!regex.test(classification_name)) {
    errors.push({ msg: "Classification name cannot contain spaces or special characters." });
  }

  if (errors.length > 0) {
    res.render("inventory/addClassification", {
      title: "Add Vehicle Classification",
      flash: null,
      nav,
      errors,
    });
  } else {
    try {
      await invModel.insertClassification(classification_name);
      req.flash('info', 'Classification added successfully.');
      nav = await utilities.getNav(); // Re-generate the navigation bar
      res.redirect('/inv');
    } catch (err) {
      errors.push({ msg: err.message });
      res.render("inventory/addClassification", {
        title: "Add Vehicle Classification",
        flash: null,
        nav,
        errors,
      });
    }
  }
};


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */


// Handle request to fetch inventory by classification ID
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id, 10);
  if (isNaN(classification_id)) {
    return res.status(400).json({ error: "Invalid classification_id" });
  }
  try {
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    if (invData.length > 0) {
      return res.json(invData);
    } else {
      return res.status(404).json({ error: "No inventory found for this classification" });
    }
  } catch (error) {
    next(error); // Pass the error to the error handler
  }
};

module.exports = invCont;




module.exports = invCont;