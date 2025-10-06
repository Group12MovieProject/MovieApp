import { useState, useEffect, useCallback } from 'react'
import './Showtimes.css'

function Showtimes() {

  const [areas, setAreas] = useState([])
  const [showtimes, setShowtimes] = useState([])
  const [selectedAreaId, setSelectedAreaId] = useState("");

  function handleAreaChange(e) {
    setSelectedAreaId(e.target.value)
  }

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

  useEffect(() => {
    fetch('https://www.finnkino.fi/xml/TheatreAreas/')
      .then(response => response.text())
      .then(xml => {
        const json = parseXML(xml)
        setAreas(json.TheatreAreas.TheatreArea)
      })
      .catch(error => {
        console.log(error)
      })
  }, [parseXML])

  useEffect(() => {
    if (!selectedAreaId) return

    fetch(`https://www.finnkino.fi/xml/Schedule/?area=${selectedAreaId}`)
      .then(response => response.text())
      .then(xml => {
        const json = parseXML(xml)
        setShowtimes(json.Schedule.Shows.Show || []);
      })
      .catch(error => {
        console.log(error)
      })
  }, [selectedAreaId, parseXML])

  return (
    <div id="showtimes-container">
      <h1>Näytösajat Finnkinon teattereissa</h1>

      <div className="showtimes-controls">
        <select value={selectedAreaId} onChange={handleAreaChange}>
          <option value="">Valitse alue</option>
          {areas.map(area => (
            <option key={area.ID} value={area.ID}>{area.Name}</option>
          ))}
        </select>
      </div>
      {selectedAreaId && showtimes.length === 0 && (
        <p>No movies available</p>
      )}
      {showtimes.length > 0 && (
        <div className="showtimes-wrapper">
          <table className="showtimes">
          <thead>
            <tr>
              <th>Elokuva</th>
              <th>Aika</th>
              <th>Teatteri</th>
              <th>Sali</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map((show, idx) => (
              <tr key={idx}>
                <td>{show.Title}</td>
                <td>{new Date(show.dttmShowStart).toLocaleString('fi-FI')}</td>
                <td>{show.Theatre}</td>
                <td>{show.TheatreAuditorium}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Showtimes