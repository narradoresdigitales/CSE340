// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")


// Debugging - Log when route is hit

router.get("/detail/:invId", (req, res, next) => {
    console.log(`Route hit: /inv/detail/${req.params.invId}`);
    next();
});

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to show vehicle details by inv_id
router.get("/detail/:invId", invController.showVehicleDetail);

module.exports = router;


