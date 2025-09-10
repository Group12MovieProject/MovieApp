import { useState, useEffect } from 'react'
import { Routes, Route} from 'react-router-dom'
import './App.css'
import NavBar from  './components/NavBar'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import Groups from './pages/Groups'
import Reviews from './pages/Reviews'
import Login from './pages/Login'
import Search from './pages/Search'
import Showtimes from './pages/Showtimes'
import NotFound from './pages/NotFound'

function App() {


  return (
    <>
    <NavBar />
    <Header /> 
    <div id="container">
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/favorites" exact element={<Favorites />} />
        <Route path="/reviews" exact element={<Reviews />} />
        <Route path="/groups" exact element={<Groups />} />
        <Route path="/showtimes" exact element={<Showtimes />} />
        <Route path="/search" exact element={<Search />} />
         <Route path="/login" exact element={<Login />} />
        <Route path="/*" exact element={<NotFound />} />
      </Routes>
    </div>
    <Footer />
    </>

  )
}

export default App
