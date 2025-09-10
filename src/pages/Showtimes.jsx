import React from 'react'
import { useState, useEffect } from 'react'

export default function Showtimes() {
  const [movies, setMovies] = useState([])

  const getFinnkinoShows = (xml) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'application/xml')
    const root = xmlDoc.children
    //console.log(root)
    const shows = root[0].children
    //console.log(shows)

    const tempMovies = []

    for (let i = 0; i < shows.length; i++) {
      console.log(shows[i].children[0].innerHTML) //PubDate
      console.log(shows[i].children[1].innerHTML) //Shows

      tempMovies.push(
        {
          "PubDate": shows[i].children[0].innerHTML,
          "Shows": shows[i].children[1].innerHTML
        }
      )
    }
    setMovies(tempMovies)
  }

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

  return (
    <div>
      <select>
        {
          movies.map(movie => (
            <option>{movie.shows}</option>
          ))
        }
      </select>
    </div>
  )
}
//Showtimes
//export default Showtimes;
