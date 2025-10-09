import { expect } from "chai"
import { initializeTestDb, insertTestUser, getToken } from "./helper/test.js"

import dotenv from "dotenv"
dotenv.config()

import bcrypt from "bcrypt"
const { hash } = bcrypt

describe("Testing user management, reviews and favorites", () => {
    const user = { email: "foo2@test.com", password: "password123" }
    let token
    before(() => {
        initializeTestDb()
        insertTestUser(user.email, user.password)
        token = getToken(user.email)
    })
    it("should sign up", async () => {
        const newUser = { email: "foo@test.com", password: "Password123" }

        const response = await fetch("http://localhost:3001/user/signup", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: newUser })
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data).to.include.all.keys(["id_account", "email"])
        expect(data.email).to.equal(newUser.email)
    })

    it('When registering it should reject duplicate email', async () => {
        const duplicateEmail = {
            email: "foo@test.com",
            password: "Password123"
        }

        const response = await fetch('http://localhost:3001/user/signup', {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: duplicateEmail })
        })

        const data = await response.json()
        expect(response.status).to.equal(409)
        expect(data.error).to.include.all.keys(["message", "status"])
        expect(data.error.message).to.equal('Email already exists')
    })

    it('When registering it should reject password that is too short', async () => {
        const passTooShort = {
            email: "foo@test.com",
            password: "Pass1"
        }

        const response = await fetch('http://localhost:3001/user/signup', {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user: passTooShort })
        })

        const data = await response.json()
        expect(response.status).to.equal(400)
        expect(data.error).to.include.all.keys(["message", "status"])
        expect(data.error.message).to.equal('Password must be at least 8 characters')
    })

    it('should log in', async () => {
        const response = await fetch("http://localhost:3001/user/signin", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user })
        })
        const data = await response.json()
        expect(response.status).to.equal(200)
        expect(data).to.include.all.keys(["id_account", "email", "access_token"])
        expect(data.email).to.equal(user.email)
        token = data.access_token
    })

    it('It should reject login if user does not exist', async () => {
        const userNotFound = {
            email: "katve@test.com",
            password: "Password123"
        }

        const response = await fetch('http://localhost:3001/user/signin', {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user: userNotFound })
        })

        const data = await response.json()
        expect(response.status).to.equal(404)
        expect(data.error).to.include.all.keys(["message", "status"])
        expect(data.error.message).to.equal('User not found')
    })

    it('It should reject login if the password is invalid', async () => {
        const userNotFound = {
            email: "foo@test.com",
            password: "Password1234"
        }

        const response = await fetch('http://localhost:3001/user/signin', {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user: userNotFound })
        })

        const data = await response.json()
        expect(response.status).to.equal(401)
        expect(data.error).to.include.all.keys(["message", "status"])
        expect(data.error.message).to.equal('Invalid password')
    })

    it('It should reject login if theres no email or password input', async () => {
        const noUser = {
            email: "",
            password: ""
        }

        const response = await fetch('http://localhost:3001/user/signin', {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ user: noUser })
        })

        const data = await response.json()
        expect(response.status).to.equal(400)
        expect(data.error).to.include.all.keys(["message", "status"])
        expect(data.error.message).to.equal('Email and password are required')
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

    it('should reject review if required information is missing', async () => {
        const informationMissing = {
            id_account: 1,
            tmdb_id: 550,
            review_text: "",
            stars: 4
        }

        const response = await fetch('http://localhost:3001/review/add', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(informationMissing)
        })

        const data = await response.json()
        expect(response.status).to.equal(400)
        expect(data.error).to.include.all.keys(["message", "status"])
        expect(data.error.message).to.equal('Missing required information')
    })

    it('should get all reviews', async () => {
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
        const newFavorite = {
            tmdb_id: 550,
            movie_title: "Mies ja alaston ase"
        }
        const response = await fetch('http://localhost:3001/favorites/add', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newFavorite)
        })
        const data = await response.json()
        expect(response.status).to.equal(201)
        expect(data.favorite).to.include.all.keys(["id_favorite", "id_account", "movie_title", "tmdb_id"])

        // Tallennetaan review_id delete-testiä varten
        global.favoriteId = data.favorite.id_favorite
    })

    it('should reject if the movie is already in favorites', async () => {
        const alreadyExists = {
            tmdb_id: 550,
            movie_title: "Mies ja alaston ase"
        }

        const response = await fetch('http://localhost:3001/favorites/add', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(alreadyExists)
        })

        const data = await response.json()
        expect(response.status).to.equal(409)
        expect(data.error).to.include.all.keys(["message", "status"])
        expect(data.error.message).to.equal('Movie already in favorites')
    })

    it('should reject if the title or TMDB ID are missing', async () => {
        const informationMissing = {
            tmdb_id: 550,
            movie_title: ""
        }

        const response = await fetch('http://localhost:3001/favorites/add', {
            method: "post",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(informationMissing)
        })

        const data = await response.json()
        expect(response.status).to.equal(400)
        expect(data.error).to.include.all.keys(["message", "status"])
        expect(data.error.message).to.equal('Movie title and TMDB ID are required')
    })

    it('should get all favorites', async () => {
        const response = await fetch('http://localhost:3001/favorites/', {
            method: "get",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
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

        it('should reject if the user does not exist', async () => {
        const noUser = {
            email: "katve@test.com"
        }

        const response = await fetch('http://localhost:3001/user/delete', {
            method: "delete",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(noUser)
        })

        const data = await response.json()
        expect(response.status).to.equal(404)
        expect(data.error).to.include.all.keys(["message", "status"])
        expect(data.error.message).to.equal('User not found')
    })
})