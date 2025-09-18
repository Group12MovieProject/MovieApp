
import React, {useState, useEffect} from 'react'
import placeholder from '../assets/placeholder.png';
import { useLocation } from 'react-router-dom';
import ReactPaginate from 'react-paginate'
import './SearchPage.css'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY

export default function Search() {
  const [results, setResults] = useState([])
  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('multi')
  const location = useLocation();

  const ResultsTable = () => {
    if (!results || results.length === 0) return <div className="no-results">Ei hakutuloksia</div>;
    // for multi search results are separated in 3 tables
    if (searchType === 'multi') {
      const persons = results.filter(item => item.media_type === 'person');
      const movies = results.filter(item => item.media_type === 'movie');
      const tvs = results.filter(item => item.media_type === 'tv');

      return (
        <div>
          {movies.length > 0 && (
            <div style={{marginBottom: '2em'}}>
              <h4>Elokuvat</h4>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Nimi</th>
                    <th>Julkaisupäivä </th>
                    <th>TMDB pisteet</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map(item => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : placeholder}
                          alt={item.title}
                          style={{ width: '60px', borderRadius: '6px', marginRight: '1em' }}
                        />
                      </td>
                      <td>{item.title}</td>
                      <td>{item.release_date}</td>
                      <td>{item.vote_average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tvs.length > 0 && (
            <div style={{marginBottom: '2em'}}>
              <h4>TV Ohjelmat</h4>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Nimi</th>
                    <th>Ensiesitys</th>
                    <th>TMDB pisteet</th>
                  </tr>
                </thead>
                <tbody>
                  {tvs.map(item => (
                    <tr key={item.id}>
                      <td>
                        <img
                          src={item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : placeholder}
                          alt={item.name}
                          style={{ width: '60px', borderRadius: '6px', marginRight: '1em' }}
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.first_air_date}</td>
                      <td>{item.vote_average}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {persons.length > 0 && (
            <div style={{marginBottom: '2em'}}>
              <h4>Henkilöt</h4>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Nimi</th>
                    <th>Tehtävä</th>
                  </tr>
                </thead>
                <tbody>
                  {persons.map(item => (
                    <tr key={item.id}>
                      <td>
                          <img
                            src={item.profile_path ? `https://image.tmdb.org/t/p/w185${item.profile_path}` : placeholder}
                          alt={item.name}
                          style={{ width: '60px', borderRadius: '6px', marginRight: '1em' }}
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>{item.known_for_department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }
    // other searches like before (only shows what user is searching)
    if (searchType === 'person') {
      return (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nimi</th>
              <th>Tehtävä</th>
            </tr>
          </thead>
          <tbody>
            {results.map(item => (
              <tr key={item.id}>
                <td>
                  <img
                    src={item.profile_path ? `https://image.tmdb.org/t/p/w185${item.profile_path}` : placeholder}
                    alt={item.name}
                    style={{ width: '60px', borderRadius: '6px', marginRight: '1em' }}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.known_for_department}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    if (searchType === 'movie') {
      return (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nimi</th>
              <th>Julkaisupäivä</th>
              <th>TMDB pisteet</th>
            </tr>
          </thead>
          <tbody>
            {results.map(item => (
              <tr key={item.id}>
                <td>
                  <img
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : placeholder}
                    alt={item.title}
                    style={{ width: '60px', borderRadius: '6px', marginRight: '1em' }}
                  />
                </td>
                <td>{item.title}</td>
                <td>{item.release_date}</td>
                <td>{item.vote_average}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    if (searchType === 'tv') {
      return (
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nimi</th>
              <th>Ensiesitys</th>
              <th>TMDB pisteet</th>
            </tr>
          </thead>
          <tbody>
            {results.map(item => (
              <tr key={item.id}>
                <td>
                  <img
                    src={item.poster_path ? `https://image.tmdb.org/t/p/w185${item.poster_path}` : placeholder}
                    alt={item.name}
                    style={{ width: '60px', borderRadius: '6px', marginRight: '1em' }}
                  />
                </td>
                <td>{item.name}</td>
                <td>{item.first_air_date}</td>
                <td>{item.vote_average}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    return null;
  }

  const search = (customQuery = query, customPage = page) => {
    fetch(`https://api.themoviedb.org/3/search/${searchType}?query=${customQuery}&include_adult=false&language=en-US&page=${customPage}`, {
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query');
    if (q && q !== query) {
      setQuery(q);
      setPage(1);
      search(q, 1);
    }
  }, [location.search]);

  return (
    <div id="search-container">
      <h3>Hakutulokset</h3>
      <form className="search-form" onSubmit={(e) => { e.preventDefault(); setPage(1); search(); }}>
        <select value={searchType} onChange={e => { setSearchType(e.target.value); setPage(1); }}>
          <option value="multi">Multi</option>
          <option value="movie">Elokuvat</option>
          <option value="person">Henkilöt</option>
          <option value="tv">TV ohjelmat</option>
        </select>
        <div className="search-input-wrapper">
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Syötä hakusana..."
          />
          <span className="search-icon">🔍</span>
        </div>
      </form>
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