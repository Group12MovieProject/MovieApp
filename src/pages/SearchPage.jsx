
import React, {useState, useEffect} from 'react'
import ReactPaginate from 'react-paginate'
import './SearchPage.css'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

export default function Search() {
  const [results, setResults] = useState([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('movie')

  const ResultsTable = () => {
    if (!results || results.length === 0) return <div>No results</div>;
    return (
      <table>
        <tbody>
          {results.map(item => (
            <tr key={item.id}>
              <td>{searchType === 'movie' ? item.title : item.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  const search = () => {
    fetch(`https://api.themoviedb.org/3/search/${searchType}?query=${query}&include_adult=false&language=en-US&page=${page}`, {
      headers: {
        'Authorization': 'Bearer ' + TMDB_API_KEY,
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(json => {
        setResults(json.results);
        setPageCount(json.total_pages);
      })
      .catch(error => {
        console.log(error);
      });
  };

  useEffect(() => {
    search();
  }, [page, searchType]);

  return (
    <div id="search-container">
      <h3>Search</h3>
      <select value={searchType} onChange={e => { setSearchType(e.target.value); setPage(1); }}>
        <option value="movie">Movies</option>
        <option value="person">Persons</option>
        <option value="tv">TV Shows</option>
      </select>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <button onClick={() => { setPage(1); search(); }} type="button">Search</button>
      <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        onPageChange={e => setPage(e.selected + 1)}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="<"
        renderOnZeroPageCount={null}
      />
      <ResultsTable />
    </div>
  );
}