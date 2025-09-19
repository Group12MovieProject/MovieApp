import { insertUser, selectUserByEmail } from '../models/User.js'
import { ApiError } from '../helper/ApiError.js'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'

const { sign } = jwt

const signUp = async (req, res, next) => {
    try {
        const { user } = req.body

        if (!user || !user.email || !user.password) {
            return next(new ApiError('Email and password are required', 400))
        }

        if (user.password.length < 8) {
            return next(new ApiError('Password must be at least 8 characters', 400))
        }

        const hashedPassword = await hash(user.password, 10)
        const result = await insertUser(user.email, hashedPassword)

        return res.status(201).json({
            id_account: result.rows[0].id_account,
            email: user.email
        })
    } catch (error) {
        if (error.code === '23505') {
            return next(new ApiError('Email already exists', 409))
        }
        return next(new ApiError('Internal server error while creating user', 500))
    }
}

const signIn = async (req, res, next) => {
    try {
        const { user } = req.body
        console.log('Login attempt:', user.email) // Debug

        if (!user || !user.email || !user.password) {
            return next(new ApiError('Email and password are required', 400))
        }

        const result = await selectUserByEmail(user.email)
        console.log('User found in DB:', result.rows.length > 0) // Debug

        if (!result.rows || result.rows.length === 0) {
            return next(new ApiError('User not found', 404))
        }

        const dbUser = result.rows[0]
        console.log('DB password hash:', dbUser.password) // Debug
        const isMatch = await compare(user.password, dbUser.password)
        console.log('Password match:', isMatch) // Debug

        if (!isMatch) {
            return next(new ApiError('Invalid password', 401))
        }

        const access_token = sign(
            { email: dbUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1m' }
        )

        return res
            .header('Access-Control-Expose-Headers', 'Authorization')
            .header('Authorization', 'Bearer ' + access_token)
            .status(200)
            .json({
                id_account: dbUser.id_account,
                email: dbUser.email,
                access_token
            })
    } catch (error) {
        return next(new ApiError('Internal server error while signing in', 500))
    }
}

export { signUp, signIn }