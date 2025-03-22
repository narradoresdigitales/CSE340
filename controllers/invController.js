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
  });
};


module.exports = invCont