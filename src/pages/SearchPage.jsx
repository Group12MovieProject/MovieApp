
import React, {useState, useEffect} from 'react'
import ReactPaginate from 'react-paginate';
import './SearchPage.css'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

export default function Search(){

    const [movies, setMovies] = useState([])
    const [page, setPage] = useState(1)
    const [pageCount, setPageCount] = useState(0)
    const [query, setQuery] = useState('Alien')


    const Movies = () => {
        return (
            <table>
              <tbody>
                { movies && movies.map(movie => (
                    <tr key={movie.id}><td>{movie.title}</td></tr>
                ))}
                </tbody>
            </table>
        )
    }

    const search = () => {
      fetch('https://api.themoviedb.org/3/search/movie?query=' + query + '&include_adult=false&language=en-US&page=' + page, {
        headers: {
          'Authorization': 'Bearer ' + TMDB_API_KEY,
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
    }
    useEffect(() => {
      search()
    }, [page])

  return (
    <div id="search-container">
      <h3>Search movies</h3>
      <input value={query} onChange={e => setQuery(e.target.value)} ></input><button onClick={search} type="button">Search</button>
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