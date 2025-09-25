import { insertUser, selectUserByEmail, deleteUserByEmail } from '../models/User.js'
import { ApiError } from '../helper/ApiError.js'
import { hash, compare } from 'bcrypt'
import jwt from 'jsonwebtoken'

const { sign, verify } = jwt

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

        if (!user || !user.email || !user.password) {
            return next(new ApiError('Email and password are required', 400))
        }

        const result = await selectUserByEmail(user.email)

        if (!result.rows || result.rows.length === 0) {
            return next(new ApiError('User not found', 404))
        }

        const dbUser = result.rows[0]
        const isMatch = await compare(user.password, dbUser.password)

        if (!isMatch) {
            return next(new ApiError('Invalid password', 401))
        }

        const access_token = sign(
            { email: dbUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1m' }
        )

        const refresh_token = sign(
            { email: dbUser.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' }
        )

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', refresh_token, {
            // httpOnly: false,
            // path:"/",
            // domain: "localhost",
            // secure: false,
            // sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

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

const deleteMe = async (req, res, next) => {
    try {
        const email = req.user.email
        const result = await deleteUserByEmail(email)

        if (result.rowCount === 0) {
            return next(new ApiError('User not found', 404))
        }

        res.clearCookie('refreshToken')

        return res.status(200).json({ message: 'Account deleted successfully' })
    } catch (error) {
        return next(new ApiError('Internal server error while deleting user', 500))
    }
}

const verifyPassword = async (req, res, next) => {
    try {
        const { password } = req.body
        const email = req.user.email

        if (!password) {
            return next(new ApiError('Password is required', 400))
        }

        const result = await selectUserByEmail(email)
        
        if (!result.rows || result.rows.length === 0) {
            return next(new ApiError('User not found', 404))
        }

        const dbUser = result.rows[0]
        const isMatch = await compare(password, dbUser.password)

        if (!isMatch) {
            return next(new ApiError('Invalid password', 401))
        }

        return res.status(200).json({ 
            message: 'Password verified successfully',
            verified: true 
        })
    } catch (error) {
        return next(new ApiError('Internal server error while verifying password', 500))
    }
}

const autoLogin = async (req, res, next) => {
    try {
        const refresh_token = req.cookies['refreshToken']
        
        if (!refresh_token) {
            return res.status(401).json({ error: 'No refresh token provided' })
        }

        const decodedUser = verify(refresh_token, process.env.JWT_SECRET)
        
        const access_token = sign(
            { email: decodedUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        )

        return res
            .header('Access-Control-Expose-Headers', 'Authorization')
            .header('Authorization', 'Bearer ' + access_token)
            .status(200)
            .json({ 
                message: 'Valid refresh token',
                access_token,
                email: decodedUser.email
            })
    } catch (error) {
        return res.status(401).json({ error: 'Invalid refresh token' })
    }
}

const logout = async (req, res, next) => {
    try {
        res.clearCookie('refreshToken')
        return res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
        return next(new ApiError('Internal server error while logging out', 500))
    }
}

export { signUp, signIn, deleteMe, autoLogin, logout, verifyPassword }
