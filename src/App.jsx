import { Routes, Route} from 'react-router-dom'
import './App.css'
import NavBar from  './components/NavBar'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Groups from './pages/Groups'
import Reviews from './pages/Reviews'
import Login from './pages/Login'
import Search from './pages/SearchPage'
import Showtimes from './pages/Showtimes'
import NotFound from './pages/NotFound'
import Register from './pages/Register'
import ProfilePage from './pages/ProfilePage'
import PrivateRoute from './components/PrivateRoute'
import UserProvider from './context/UserProvider'
import FavoritesProvider from './context/FavoritesProvider'

function App() {

  return (
    <UserProvider>
    <FavoritesProvider>
    <NavBar />
    <Header /> 
    <div id="elements">
      <Routes>
        <Route path="/" exact element={<Home />} />
        <Route path="/reviews" exact element={<Reviews />} />
        <Route path="/groups" exact element={<Groups />} />
        <Route path="/showtimes" exact element={<Showtimes />} />
        <Route path="/searchpage" exact element={<Search />} />
        <Route path="/login" exact element={<Login />} />
        <Route path="/register" exact element={<Register />} />
        <Route path="/*" exact element={<NotFound />} />
        <Route element={<PrivateRoute />} >
        <Route path="/profilepage" exact element={<ProfilePage />} />
        </Route>
      </Routes>
    </div>
    <Footer />
    </FavoritesProvider>
    </UserProvider>
  )
}

export default App
