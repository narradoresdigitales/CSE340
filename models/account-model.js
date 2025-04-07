const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
      const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT * FROM account WHERE account_email = $1"
        const email = await pool.query(sql, [account_email])
        return email.rowCount
    } catch (error) {
        return error.message
    }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
    try {
        const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
        [account_email])
        return result.rows[0]
    } catch (error) {
        return new Error("No matching email found")
    }
}

/* *****************************
* Return all account data using email address
* ***************************** */
async function getAllAccounts() {
    try {
        const result = await pool.query(
        'SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account ORDER BY account_id ASC'
    )
        return result.rows
    } catch (error) {
        throw new Error("Failed to retrieve account list")
    }
}

async function updatePassword(accountId, hashedPassword) {
    const query = 'UPDATE account SET account_password = $1 WHERE account_id = $2'; // Ensure proper parameterized query
    const values = [hashedPassword, accountId]; // Pass in the values as an array
    return pool.query(query, values); // Use pool.query to execute the query
}

async function deleteAccount(accountId) {
    try {
        const sql = 'DELETE FROM account WHERE account_id = $1';
        const result = await pool.query(sql, [accountId]);
        return result; // This will return the result of the delete operation
    } catch (error) {
        throw new Error('Failed to delete account');
    }
}




module.exports = { registerAccount, checkExistingEmail, getAccountByEmail, getAllAccounts, updatePassword, deleteAccount }