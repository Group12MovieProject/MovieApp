import { selectMembership, insertMembership, updateMembership, deleteMembership, selectAllMemberships } from '../models/GroupMembership.js'
import { selectGroupById } from '../models/Group.js'
import { selectUserByEmail } from '../models/User.js'
import { ApiError } from '../helper/ApiError.js'

const requestMembership = async (req, res, next) => {
    try {
        const { id_group } = req.params

        if (!req.user?.email) {
            return next(new ApiError('Unauthorized', 401))
        }

        const userResult = await selectUserByEmail(req.user.email)
        if (userResult.rows.length === 0) {
            return next(new ApiError('User not found', 404))
        }

        const groupResult = await selectGroupById(id_group)
        if (groupResult.rows.length === 0) {
            return next(new ApiError('Group not found', 404))
        }

        const user = userResult.rows[0]
        const group = groupResult.rows[0]

        if (group.owner_id === user.id_account) {
            return next(new ApiError('Owner cannot request membership', 400))
        }

        const existingMembership = await selectMembership(id_group, user.id_account)
        if (existingMembership.rows.length > 0) {
            const membership = existingMembership.rows[0]
            if (membership.is_approved) {
                return next(new ApiError('Already a member', 409))
            } else {
                return next(new ApiError('Membership request already pending', 409))
            }
        }

        const result = await insertMembership(id_group, user.id_account, false)
        return res.status(201).json({
            message: 'Membership request sent',
            membership: result.rows[0]
        })
    } catch (error) {
        return next(new ApiError('Internal server error while requesting membership', 500))
    }
}

const getMemberships = async (req, res, next) => {
    try {
        const { id_group } = req.params
        const { status } = req.query

        if (!req.user?.email) {
            return next(new ApiError('Unauthorized', 401))
        }

        const userResult = await selectUserByEmail(req.user.email)
        if (userResult.rows.length === 0) {
            return next(new ApiError('User not found', 404))
        }

        const groupResult = await selectGroupById(id_group)
        if (groupResult.rows.length === 0) {
            return next(new ApiError('Group not found', 404))
        }

        const user = userResult.rows[0]
        const group = groupResult.rows[0]

        if (status === 'pending' && group.owner_id !== user.id_account) {
            return next(new ApiError('Only owner can view pending requests', 403))
        }

        const result = await selectAllMemberships(id_group, status || 'approved')
        return res.status(200).json(result.rows)
    } catch (error) {
        return next(new ApiError('Internal server error while fetching memberships', 500))
    }
}

const approveMembership = async (req, res, next) => {
    try {
        const { id_group, id_account } = req.params

        if (!req.user?.email) {
            return next(new ApiError('Unauthorized', 401))
        }

        const userResult = await selectUserByEmail(req.user.email)
        if (userResult.rows.length === 0) {
            return next(new ApiError('User not found', 404))
        }

        const groupResult = await selectGroupById(id_group)
        if (groupResult.rows.length === 0) {
            return next(new ApiError('Group not found', 404))
        }

        const user = userResult.rows[0]
        const group = groupResult.rows[0]

        if (group.owner_id !== user.id_account) {
            return next(new ApiError('Only owner can approve memberships', 403))
        }

        const membershipResult = await selectMembership(id_group, id_account)
        if (membershipResult.rows.length === 0) {
            return next(new ApiError('Membership request not found', 404))
        }

        const result = await updateMembership(id_group, id_account, true)
        return res.status(200).json({
            message: 'Membership approved',
            membership: result.rows[0]
        })
    } catch (error) {
        return next(new ApiError('Internal server error while approving membership', 500))
    }
}

const rejectMembership = async (req, res, next) => {
    try {
        const { id_group, id_account } = req.params

        if (!req.user?.email) {
            return next(new ApiError('Unauthorized', 401))
        }

        const userResult = await selectUserByEmail(req.user.email)
        if (userResult.rows.length === 0) {
            return next(new ApiError('User not found', 404))
        }

        const groupResult = await selectGroupById(id_group)
        if (groupResult.rows.length === 0) {
            return next(new ApiError('Group not found', 404))
        }

        const user = userResult.rows[0]
        const group = groupResult.rows[0]

        if (group.owner_id !== user.id_account) {
            return next(new ApiError('Only owner can reject memberships', 403))
        }

        const membershipResult = await selectMembership(id_group, id_account)
        if (membershipResult.rows.length === 0) {
            return next(new ApiError('Membership request not found', 404))
        }

        await deleteMembership(id_group, id_account)
        return res.status(200).json({
            message: 'Membership request rejected'
        })
    } catch (error) {
        return next(new ApiError('Internal server error while rejecting membership', 500))
    }
}

const leaveMembership = async (req, res, next) => {
    try {
        const { id_group } = req.params

        if (!req.user?.email) {
            return next(new ApiError('Unauthorized', 401))
        }

        const userResult = await selectUserByEmail(req.user.email)
        if (userResult.rows.length === 0) {
            return next(new ApiError('User not found', 404))
        }

        const groupResult = await selectGroupById(id_group)
        if (groupResult.rows.length === 0) {
            return next(new ApiError('Group not found', 404))
        }

        const user = userResult.rows[0]
        const group = groupResult.rows[0]

        if (group.owner_id === user.id_account) {
            return next(new ApiError('Owner cannot leave group', 400))
        }

        const membershipResult = await selectMembership(id_group, user.id_account)
        if (membershipResult.rows.length === 0) {
            return next(new ApiError('Not a member of this group', 404))
        }

        await deleteMembership(id_group, user.id_account)
        return res.status(200).json({
            message: 'Successfully left the group'
        })
    } catch (error) {
        return next(new ApiError('Internal server error while leaving group', 500))
    }
}

export { requestMembership, getMemberships, approveMembership, rejectMembership, leaveMembership }
