import {removeGroup, selectAllGroups, selectGroupById, insertGroup} from '../models/Group.js'
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
        const result = await selectGroupById(req.params.id_group)
        if (result.rows.length === 0) return next(new ApiError('Group not found', 404))
        return res.status(200).json(result.rows[0])
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
