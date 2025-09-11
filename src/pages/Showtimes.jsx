import React from 'react'
import { useState, useEffect } from 'react'

export default function Showtimes() {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [selectedTheatre, setSelectedTheatre] = useState('');

  const getFinnkinoShows = (xml) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'application/xml');
    const showElements = xmlDoc.getElementsByTagName('Show');
    const tempMovies = [];
    const tempTheatres = new Set();

    for (let i = 0; i < showElements.length; i++) {
      const show = showElements[i];
      const titleElement = show.getElementsByTagName('Title')[0];
      const startTimeElement = show.getElementsByTagName('dttmShowStart')[0];
      const theatreElement = show.getElementsByTagName('Theatre')[0];
      const theatre = theatreElement ? theatreElement.textContent : '';
      tempMovies.push({
        title: titleElement ? titleElement.textContent : 'Tuntematon',
        startTime: startTimeElement ? startTimeElement.textContent : '',
        theatre: theatre
      });
      if (theatre) tempTheatres.add(theatre);
    }
    setMovies(tempMovies);
    setTheatres(Array.from(tempTheatres).sort());
    if (!selectedTheatre && tempTheatres.size > 0) {
      setSelectedTheatre(Array.from(tempTheatres)[0]);
    }
  };

  useEffect(() => {
    fetch('https://www.finnkino.fi/xml/Schedule/')
      .then(response => response.text())
      .then(xml => {
        // console.log(xml)
        getFinnkinoShows(xml)
      })
      .catch(error => {
        console.log(error)
      })

  }, [])

/* //For loop to chech if shows[i].children[0] and shows[i].children[1] exist and printing them if they do.
  for (let i = 0; i < shows.length; i++) {
    if (shows[i].children[0]) {
      console.log(shows[i].children[0].innerHTML);
    }
    if (shows[i].children[1]) {
      console.log(shows[i].children[1].innerHTML);
  }
} */

  const filteredMovies = movies.filter(movie => movie.theatre === selectedTheatre);

  return (
    <div>
      <h3>Finnkino-näytökset</h3>
      <label htmlFor="theatre-select">Valitse teatteri: </label>
      <select id="theatre-select" value={selectedTheatre} onChange={e => setSelectedTheatre(e.target.value)}>
        {theatres.map(theatre => (
          <option key={theatre} value={theatre}>{theatre}</option>
        ))}
      </select>
      <ul>
        {filteredMovies.map((movie, idx) => (
          <li key={idx}>
            {movie.title} — {movie.startTime}
          </li>
        ))}
      </ul>
    </div>
  );
}
//Showtimes
//export default Showtimes;
