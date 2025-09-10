import React, {useState, useEffect} from 'react'
import ReactPaginate from 'react-paginate';
import './SearchPage.css'

export default function Search(){

    const [movies, setMovies] = useState([])
    const [page, setPage] = useState(1)
    const [pageCount, setPageCount] = useState(0)


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
        fetch('https://api.themoviedb.org/3/search/movie?query=star%20wars&include_adult=false&language=en-US&page=' + page, {
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MGIwMjhhYTk3ODRjMTE3NzJhMjQwOTllNzI5MDVmOCIsIm5iZiI6MTc1NzQ4MzkzNC42NzcsInN1YiI6IjY4YzExMzllYjRiM2JiYjczYjliZDA1ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.44SoXEYMvQslmBfz2siV0z0JD5_FRB7cJuDhXwJFsVc',
                'Content-Type':'application/json'
            }
        })
        .then(response => response.json())
        .then (json => {
            setMovies(json.results)
            setPageCount(json.total_pages)
        })
        .catch(error => {
            console.log(error)
        })
    }, [page])

  return (
    <div id="container">
      <h3>Search movies</h3>
      <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        onPageChange={(e) => setPage(e.selected + 1)}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="<"
        renderOnZeroPageCount={null}
      />
      <Movies/>
      </div>
  );
}