import React, {useState, useEffect} from 'react'

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
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MGIwMjhhYTk3ODRjMTE3NzJhMjQwOTllNzI5MDVmOCIsIm5iZiI6MTc1NzQ4MzkzNC42NzcsInN1YiI6IjY4YzExMzllYjRiM2JiYjczYjliZDA1ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.44SoXEYMvQslmBfz2siV0z0JD5_FRB7cJuDhXwJFsVc',
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
