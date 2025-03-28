const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}


invCont.showVehicleDetail = async function(req, res, next) {
  const inv_id = req.params.invId;
  const vehicle = await invModel.getVehicleByInvId(inv_id);
  console.log("Vehicle Data in Controller:", vehicle);
  const grid = await utilities.buildGetVehicleByIdGrid([vehicle]);
  let nav = await utilities.getNav()
  // Troubleshooting logs // 

  res.render("inventory/vehicle-detail", {
    title: `${vehicle.inv_year} ${vehicle.inv_model} ${vehicle.inv_model}`,
    vehicle,
    nav, 
    grid,
    errors: null,
  });
};

invCont.buildManagementView = async function(req, res, next) {
  console.log("Building management view");
  let nav = await utilities.getNav();
  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
  })
}

invCont.showAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/addClassification", {
      flash: req.flash('info'),
      nav, 
      errors: null,
  });
}

invCont.showAddInventory = async function(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/addInventory", {
      flash: req.flash('info'),
      nav, 
      errors: null
  });
}




module.exports = invCont