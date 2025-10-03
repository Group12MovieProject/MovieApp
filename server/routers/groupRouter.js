import { Router } from 'express'
import { postGroup, deleteGroup, getAllGroups, getGroupById } from '../controllers/GroupController.js'
import { auth } from '../helper/auth.js' 

const router = Router()


router.post('/add', auth, postGroup)
router.delete('/delete/:id_group', auth, deleteGroup)
router.get('/', getAllGroups)
router.get('/:id_group', auth, getGroupById)

export default router

