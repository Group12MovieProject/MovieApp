import {pool} from '../helper/db.js'

const insertUser = async (email, hashedPassword) => {
    return await pool.query(
        'INSERT INTO account (email, password) VALUES ($1, $2) RETURNING *',
        [email, hashedPassword]
    )
}

const selectUserByEmail = async (email) => {
    return await pool.query(
        'SELECT * FROM account WHERE email = $1',
        [email]
    )
}

export {insertUser, selectUserByEmail}