import {
    removeGroup,
    selectAllGroups,
    selectGroupById,
    selectGroupMembership,
    insertGroup
} from '../models/Group.js'
import { selectUserByEmail } from '../models/User.js'
import {ApiError} from '../helper/ApiError.js'

const postGroup = async (req,res,next) => {
    try {
        const { group_name, description, owner_id } = req.body

        if (!group_name || !description || !owner_id) {
            return next(new ApiError('Missing required information', 400)) 
        }

            try {
                const newGroup = await insertGroup(group_name, description, owner_id)
                return res.status(201).json(newGroup)
            } catch (err) {
                if (err && err.code === '23505') {
                    return next(new ApiError('Group name already exists', 409))
                }
                return next(new ApiError('Internal server error while creating group', 500))
        }
    } catch (error) {
        return next(new ApiError('Internal server error while creating group', 500)) 
    }
}

const deleteGroup =  async (req, res, next) => {
        try {
        const result = await removeGroup(req.params.id_group)
        return res.status(200).json(result.rows)
        }
        catch (error) {
            return next(new ApiError('Internal server error while removing group', 500))
        }
}

const getGroupById = async (req, res, next) => {
    try {
        const { id_group } = req.params

        const groupResult = await selectGroupById(id_group)
        if (groupResult.rows.length === 0) {
            return next(new ApiError('Group not found', 404))
        }

        if (!req.user?.email) {
            return next(new ApiError('Unauthorized', 401))
        }

        const userResult = await selectUserByEmail(req.user.email)
        if (userResult.rows.length === 0) {
            return next(new ApiError('User not found', 404))
        }

        const group = groupResult.rows[0]
        const user = userResult.rows[0]

        if (group.owner_id === user.id_account) {
            return res.status(200).json(group)
        }

        const membershipResult = await selectGroupMembership(id_group, user.id_account)

        if (membershipResult.rows.length === 0 || membershipResult.rows[0].is_approved !== true) {
            return next(new ApiError('Access denied', 403))
        }

        return res.status(200).json(group)
    } catch (error) {
        return next(new ApiError('Internal server error while fetching group', 500))
    }
}

const getAllGroups = async (req, res, next) => {
    try {
        const result = await selectAllGroups()
        return res.status(200).json(result.rows)
    } 
    catch (error) {
       return next(new ApiError('Internal server error while showing all groups', 500)) 
    }
}

export {postGroup, deleteGroup, getAllGroups, getGroupById}
