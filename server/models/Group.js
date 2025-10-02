import { pool } from '../helper/db.js'

const removeGroup = async (id_group) => {
    return await pool.query('DELETE FROM groups WHERE id_group = $1 RETURNING *',
        [id_group])
}

const selectAllGroups = async () => {
    return await pool.query('SELECT * FROM groups')
}

const selectGroupById = async (id_group) => {
    return await pool.query(
        'SELECT * FROM groups WHERE id_group = $1',
        [id_group]
    )
}

const selectGroupMembership = async (id_group, id_account) => {
    return await pool.query(
        'SELECT is_approved FROM group_account WHERE id_group = $1 AND id_account = $2',
        [id_group, id_account]
    )
}

const insertGroup = async (group_name, description, owner_id) => {
    const client = await pool.connect()
    try {
        await client.query('BEGIN')
        const insertResult = await client.query(
            'INSERT INTO groups (group_name, description, owner_id) VALUES ($1, $2, $3) RETURNING *',
            [group_name, description, owner_id]
        )
        const newGroup = insertResult.rows[0]

        await client.query(
            'INSERT INTO group_account (id_account, id_group, is_approved) VALUES ($1, $2, $3)',
            [owner_id, newGroup.id_group, true]
        )

        await client.query('COMMIT')
        return newGroup
    } catch (err) {
        await client.query('ROLLBACK')
        throw err
    } finally {
        client.release()
    }
}

export {
    removeGroup,
    selectAllGroups,
    selectGroupById,
    selectGroupMembership,
    insertGroup
}