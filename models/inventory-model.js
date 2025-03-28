const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}



/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


async function getVehicleByInvId(inv_id) {
  try {

    console.log(`Querying database for inv_id: ${inv_id}`);
    
    const result = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.inv_id = $1`,
      [inv_id]
    )

    console.log("Vehicle data returned: ", result.rows)
    
    return result.rows[0]
  } catch (error) {
    console.error("getVehicleById error: " + error)
    
  }
}


// Function to insert a new classification
async function insertClassification(classification_name) {
  try {
    const sql = "INSERT INTO classifications (classification_name) VALUES ($1)";
  const result = await db.query(sql, [classification_name])
  return result;
  }catch (error) {
    console.error("insertClassification error: " + error)
  }
}










const insertVehicle = async function(vehicle) {
  const { make, model, year } = vehicle;
  const sql = "INSERT INTO public.inventory (make, model, year) VALUES ($1, $2, $3)";
  const result = await pool.query(sql, [make, model, year]);
  return result;
};






module.exports = {
  getClassifications, 
  getInventoryByClassificationId,
  getVehicleByInvId,
  insertClassification,
  insertVehicle,
};