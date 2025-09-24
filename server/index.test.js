import {expect} from "chai"
import { initializeTestDb } from "./helper/test.js"
import { insertTestUser } from "./helper/test.js"
import { getToken } from "./helper/test.js"


import dotenv from "dotenv"
dotenv.config()

import bcrypt from "bcrypt"
const { hash } = bcrypt

describe("Testing user managment", () => {
    const user = { email: "foo2@test.com", password: "password123" }
    let token
    before(() => {
        insertTestUser(user.email, user.password)
        initializeTestDb()
        token = getToken(user.email)
    })
    it("should sign up", async () => {
        const newUser = {email: "foo@test.com", password: "password123"}

        const response = await fetch("http://localhost:3001/user/signup", {
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({user: newUser})
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data).to.include.all.keys(["id_account","email"])
        expect(data.email).to.equal(newUser.email)
    })
    it('should log in', async () => {
        const response = await fetch("http://localhost:3001/user/signin", {
            method: "post",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({user})
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.include.all.keys(["id_account","email", "access_token"])
        expect(data.email).to.equal(user.email)
        token = data.access_token
    })
    it('should delete a user account', async () => {
        const response = await fetch("http://localhost:3001/user/delete", {
            method: "delete",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data.message).to.equal("Account deleted successfully")
    })
})

describe("Testing review management", () => {

})
