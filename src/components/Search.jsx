// this is not used at this moment

import React, {useState, useEffect} from 'react'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

export default function Search(){

    const [movies, setMovies] = useState([])

    const Movies = () => {
        return (
            <table>
                { movies && movies.map(movie => (
                    <tr key={movie.id}><td>{movie.title}</td></tr>
                ))}
            </table>
        )
    }
    useEffect(() => {
        fetch('https://api.themoviedb.org/3/search/movie?query=star%20wars&include_adult=false&language=en-US&page=1', {
            headers: {
                'Authorization': 'Bearer '+ TMDB_API_KEY,
                'Content-Type':'application/json'
            }
        })
        .then(response => response.json())
        .then (json => {
            setMovies(json.results)
        })
        .catch(error => {
            console.log(error)
        })
    }, [])

return 

}
