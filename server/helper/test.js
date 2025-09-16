import fs from 'fs'
import path from 'path'
import { pool } from './db.js'
import jwt from 'jsonwebtoken';
import { hash } from 'bcrypt';

const __dirname = import.meta.dirname

const initializeTestDb = () => {
    const sql = fs.readFileSync(path.resolve(__dirname, '../testidb.sql'), 'utf8')

    pool.query(sql, (err) => {
        if (err) {
            console.error("Error initializing test database", err)
        } else {
            console.log("Test database initialized successfully")
        }
    })
}

const insertTestUser = (email, password) => {
    hash(password, 10, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err)
            return
        }
    pool.query('INSERT INTO account (email, password) VALUES ($1, $2)',
            [email, hashedPassword],
            (err, result) => {
                if(err) {
                    console.error('Error inserting test user', err)
                } else {
                    console.log('Test user inserted uccessfully', result)
                }
            })
    })
}

const getToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET)
}

export { initializeTestDb, insertTestUser, getToken }