import { pool } from '../helper/db.js'

const selectMembership = async (id_group, id_account) => {
    return await pool.query(
        'SELECT id_group_account, id_account, id_group, is_approved, joined_at FROM group_account WHERE id_group = $1 AND id_account = $2',
        [id_group, id_account]
    )
}

const insertMembership = async (id_group, id_account, is_approved = false) => {
    return await pool.query(
        'INSERT INTO group_account (id_account, id_group, is_approved) VALUES ($1, $2, $3) ON CONFLICT (id_account, id_group) DO UPDATE SET is_approved = EXCLUDED.is_approved RETURNING id_group_account, id_account, id_group, is_approved, joined_at',
        [id_account, id_group, is_approved]
    )
}

const updateMembership = async (id_group, id_account, is_approved) => {
    return await pool.query(
        'UPDATE group_account SET is_approved = $3 WHERE id_group = $1 AND id_account = $2 RETURNING id_group_account, id_account, id_group, is_approved, joined_at',
        [id_group, id_account, is_approved]
    )
}

const deleteMembership = async (id_group, id_account) => {
    return await pool.query(
        'DELETE FROM group_account WHERE id_group = $1 AND id_account = $2 RETURNING id_group_account, id_account, id_group, is_approved, joined_at',
        [id_group, id_account]
    )
}

const selectAllMemberships = async (id_group, status = 'approved') => {
    let filter = ''
    if (status === 'approved') {
        filter = 'AND ga.is_approved = TRUE'
    } else if (status === 'pending') {
        filter = 'AND ga.is_approved = FALSE'
    }

    return await pool.query(
        `SELECT ga.id_group_account, ga.id_account, ga.id_group, ga.is_approved, ga.joined_at, a.email FROM group_account ga INNER JOIN account a ON a.id_account = ga.id_account WHERE ga.id_group = $1 ${filter} ORDER BY ga.joined_at ASC`,
        [id_group]
    )
}

export { selectMembership, insertMembership, updateMembership, deleteMembership, selectAllMemberships }
