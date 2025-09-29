import {expect} from "chai"
import { initializeTestDb, insertTestUser, getToken} from "./helper/test.js"

import dotenv from "dotenv"
dotenv.config()

import bcrypt from "bcrypt"
const { hash } = bcrypt

describe("Testing user managment", () => {
    const user = { email: "foo2@test.com", password: "password123" }
    let token
    before(() => {
        initializeTestDb()
        insertTestUser(user.email, user.password)
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
    it('should post a review', async () => {
        const newReview = {
            id_account: 1,
            tmdb_id: 550,
            review_text: "Great movie!",
            stars: 5
        }
        const response = await fetch('http://localhost:3001/review/add', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newReview)
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data[0]).to.include.all.keys(["id_review", "id_account", "tmdb_id", "review_text", "stars", "review_time"])
        expect(data[0].review_text).to.equal(newReview.review_text)
        expect(data[0].stars).to.equal(newReview.stars)
        
        // Tallennetaan review_id delete-testiä varten
        global.reviewId = data[0].id_review
    })

    it('should reject duplicate review for same movie', async () => {
        const duplicateReview = {
            id_account: 1,
            tmdb_id: 550,
            review_text: "Trying to review again",
            stars: 4
        }

        const response = await fetch('http://localhost:3001/review/add', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(duplicateReview)
        })

        const data = await response.json()
        expect(response.status).to.equal(409)
        expect(data.error).to.include.all.keys(["message", "status"])
        expect(data.error.message).to.equal('Review already exists for this movie')
    })
    it ('should get all reviews', async () => {
        const response = await fetch('http://localhost:3001/review/', {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data[0]).to.include.all.keys(["id_review", "id_account", "tmdb_id", "review_text", "stars", "review_time", "email"])
    })

    it('should delete a review', async () => {
        const response = await fetch(`http://localhost:3001/review/delete/${global.reviewId}`, {
            method: "delete",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data[0]).to.include.all.keys(["id_review", "id_account", "tmdb_id", "review_text", "stars", "review_time"])
        expect(data[0].id_review).to.equal(global.reviewId)
    })

        it('should add favorite', async () => {
        const newReview = {
            id_account: 1,
            tmdb_id: 550,
            movie_title: "Mies ja alaston ase"
        }
        const response = await fetch('http://localhost:3001/favorites/add', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newReview)
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data.favorite).to.include.all.keys(["id_favorite", "id_account", "movie_title", "tmdb_id"])
        
        // Tallennetaan review_id delete-testiä varten
        global.favoriteId = data.favorite.id_favorite
    })

        it ('should get all favorites', async () => {
        const response = await fetch('http://localhost:3001/favorites/', {
            method: "get",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data.favorites[0]).to.include.all.keys(["id_favorite", "id_account", "movie_title", "tmdb_id"])
    })

        it('should delete a favorite', async () => {
        const response = await fetch(`http://localhost:3001/favorites/delete/${global.favoriteId}`, {
            method: "delete",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data.favorite).to.include.all.keys(["id_favorite", "id_account", "movie_title", "tmdb_id"])
        expect(data.favorite.id_favorite).to.equal(global.favoriteId)
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