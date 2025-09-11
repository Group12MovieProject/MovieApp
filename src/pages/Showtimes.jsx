import { useState, useEffect, useCallback } from 'react'

function Showtimes() {
  const [movies, setMovies] = useState([])

  const xmlToJson = useCallback((node) => {
    const json = {}

    let children = [...node.children]

    if (!children.length) return node.innerHTML

    for (let child of children) {
      const hasSibilings = children.filter(c => c.nodeName === child.nodeName).length > 1

      if (hasSibilings) {
        if (json[child.nodeName] === undefined) {
          json[child.nodeName] = [xmlToJson(child)]
        } else {
          json[child.nodeName].push(xmlToJson(child))
        }
      } else {
        json[child.nodeName] = xmlToJson(child)
      }
    }
    return json
  }, [])

  const parseXML = useCallback((xml) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, 'application/xml')
    return xmlToJson(xmlDoc)
  }, [xmlToJson])

  // const getFinkinoTheatres = (xml) => {
  //   const parser = new DOMParser()
  //   const xmlDoc = parser.parseFromString(xml, 'application/xml')
  //   const root = xmlDoc.children
  //   const theatres = root[0].children
  //   const tempAreas = []
  //   for (let i = 0; i < theatres.length; i++) {
  //     //console.log(theatres[i].children[0].innerHTML)
  //     //console.log(theatres[i].children[1].innerHTML)
  //     tempAreas.push(
  //       {
  //         "id":theatres[i].children[0].innerHTML,
  //         "name" : theatres[i].children[1].innerHTML
  //       }
  //     )
  //   }
  //   SetAreas(tempAreas)
  // }

  useEffect(() => {
    fetch('https://www.finnkino.fi/xml/Schedule//')
      .then(response => response.text())
      .then(xml => {
        //console.log(xml)
        //getFinkinoTheatres(xml)
        const json = parseXML(xml);
        let shows = json.Schedule.Shows.Show;
        if (!Array.isArray(shows)) {
          shows = shows ? [shows] : []
        }
        setMovies(shows)
      })
      .catch(error => {
        console.log(error)
      })
  }, [parseXML])

  return (
    <div>
      <h3>Finnkino-näytökset</h3>
      <select>
        {movies.map(movie => (
          <option key={movie.ID}>{movie.Theatre}</option>
        ))}
      </select>
    </div>
  )
}

export default Showtimes