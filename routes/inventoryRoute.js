// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const errorController = require('../controllers/errorController')
utilities = require('../utilities')




// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId)

// Route to show vehicle details by inv_id
router.get("/detail/:invId", invController.showVehicleDetail)

router.get("/", invController.buildManagementView)

router.get('/add-classification', invController.showAddClassification)
router.post('/add-classification', invController.addClassification)

router.get(
    "/getInventory/:classification_id",
    utilities.handleErrors(invController.getInventoryJSON))

router.get(
  "/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))

router.get('/add-inventory', invController.addInventory)
router.post('/add-inventory', invController.addInventory) 
router.get('/trigger-error', errorController.throwError)

module.exports = router;


