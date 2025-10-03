import fs from 'fs'
import path from 'path'
import { pool } from './db.js'
import jwt from 'jsonwebtoken';
import { hash } from 'bcrypt';

const __dirname = import.meta.dirname

const initializeTestDb = () => {
    const sql = fs.readFileSync(path.resolve(__dirname, '../testidb.sql'), 'utf8')
    return new Promise((resolve, reject) => {
        pool.query(sql, (err) => {
            if (err) {
                console.error("Error initializing test database", err)
                return reject(err)
            }
            console.log("Test database initialized successfully")
            resolve()
        })
    })
}

const insertTestUser = (email, password) => {
    return new Promise((resolve, reject) => {
        hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err)
                return reject(err)
            }
            pool.query('INSERT INTO account (email, password) VALUES ($1, $2)',
                [email, hashedPassword],
                (err, result) => {
                    if (err) {
                        console.error('Error inserting test user', err)
                        return reject(err)
                    }
                    console.log('Test user inserted successfully')
                    resolve()
                }
            )
        })
    })
}

const getToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET)
}

export { initializeTestDb, insertTestUser, getToken}