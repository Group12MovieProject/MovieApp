import { Router } from 'express'
import { postGroup, deleteGroup, getAllGroups, getGroupById } from '../controllers/GroupController.js'
import { requestMembership, getMemberships, approveMembership, rejectMembership, leaveMembership } from '../controllers/GroupMembershipController.js'
import { auth } from '../helper/auth.js' 

const router = Router()

// Group routes
router.post('/add', auth, postGroup)
router.delete('/delete/:id_group', auth, deleteGroup)
router.get('/', getAllGroups)
router.get('/:id_group', auth, getGroupById)

// Membership routes
router.post('/:id_group/join', auth, requestMembership)
router.get('/:id_group/members', auth, getMemberships)
router.patch('/:id_group/members/:id_account/approve', auth, approveMembership)
router.delete('/:id_group/members/:id_account/reject', auth, rejectMembership)
router.delete('/:id_group/leave', auth, leaveMembership)

export default router

