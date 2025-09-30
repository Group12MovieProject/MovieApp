import { expect } from 'chai'
import { initializeTestDb, insertTestUser, getToken } from './helper/test.js'
import dotenv from 'dotenv'
dotenv.config()

describe('Testing Groups', () => {
  const user = { email: 'group@test.com', password: 'password123' }
  let token
  before(() => {
    return (async () => {
      await initializeTestDb()
      await insertTestUser(user.email, user.password)
      token = getToken(user.email)
    })()
  })

  let createdGroupId

  it('creates a group (201)', async () => {
    const payload = { group_name: 'SciFi Fans', description: 'We like sci-fi', owner_id: 1 }
    const res = await fetch('http://localhost:3001/group/add', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    expect(res.status).to.equal(201)
    expect(data).to.include.all.keys(['id_group','group_name','description','owner_id','created_at'])
    expect(data.group_name).to.equal(payload.group_name)
    createdGroupId = data.id_group
  })

  it('rejects missing fields (400)', async () => {
    const res = await fetch('http://localhost:3001/group/add', {
      method: 'post',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ group_name: 'NoDesc' }) // missing description and owner_id
    })
    const data = await res.json()
    expect(res.status).to.equal(400)
    expect(data.error).to.have.property('message')
  })

  it('rejects duplicate group name (409)', async () => {
    const payload = { group_name: 'SciFi Fans', description: 'Another', owner_id: 1 }
    const res = await fetch('http://localhost:3001/group/add', {
      method: 'post',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    expect(res.status).to.equal(409)
    expect(data.error.message).to.match(/already exists/i)
  })

  it('gets all groups (200)', async () => {
    const res = await fetch('http://localhost:3001/group/', { method: 'get', headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    expect(res.status).to.equal(200)
    expect(data).to.be.an('array')
    expect(data.some(g => g.id_group === createdGroupId)).to.be.true
  })

  it('gets group by id (200)', async () => {
    const res = await fetch(`http://localhost:3001/group/${createdGroupId}`, { method: 'get', headers: { 'Content-Type': 'application/json' } })
    const data = await res.json()
    expect(res.status).to.equal(200)
    expect(data.id_group).to.equal(createdGroupId)
    expect(data.group_name).to.equal('SciFi Fans')
  })

  it('deletes the group (200)', async () => {
    const res = await fetch(`http://localhost:3001/group/delete/${createdGroupId}`, {
      method: 'delete',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    expect(res.status).to.equal(200)
    // expecting deleted row returned as in controllers (array with row)
    expect(data[0]).to.have.property('id_group')
    expect(data[0].id_group).to.equal(createdGroupId)
  })
})