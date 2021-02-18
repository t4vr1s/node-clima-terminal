const fs = require('fs')
const axios = require('axios').default

class Busquedas {

  historial = ['los angeles', 'santiago', 'recoleta']
  dbPath = './db/dabase.json'

  constructor () {
    // TODO: leer db si exis te
    this.leerDB()
  }

  get getParamsMapbox () {
    return {
      access_token: process.env.MAPBOX_KEY,
      limit: '5',
      language: 'es'
    }
  }

  get getParamsOpenWeather () {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric',
      lang: 'es'
    }
  }

  get historialCapitalizado () {
    return this.historial.map(lugar => {
      let palabras = lugar.split(' ')
      palabras = palabras.map((p) =>
        p[0].toUpperCase() + p.slice(1)
      )
      return palabras.join(' ')
    })
  }

  async ciudad (lugar = '') {
    try {
      // Peticion http
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.getParamsMapbox
      })

      const { data: { features } } = await instance.get()
      return features.map((ciudad) => ({
        id: ciudad.id,
        nombre: ciudad.place_name,
        lng: ciudad.center[0],
        lat: ciudad.center[1]
      }))
    } catch (error) {
      return []
    }
  }

  async climaLugar (lat, lon) {
    try {
      const instance = axios.create({
        baseURL: 'https://api.openweathermap.org/data/2.5/weather',
        params: {
          lat,
          lon,
          ...this.getParamsOpenWeather
        }
      })
      const { data } = await instance.get()
      const { weather, main } = data
      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp
      }
    } catch (error) {
      console.log(error)
    }
  }

  agregarHistorial (ciudad = '') {
    if (this.historial.includes(ciudad.toLocaleLowerCase())) {
      return
    }
    this.historial = this.historial.slice(0, 5)
    this.historial.unshift(ciudad.toLocaleLowerCase())
    // grabar en la db
    this.guardarDB()
  }

  guardarDB () {
    const payload = {
      historial: this.historial
    }
    fs.writeFileSync(this.dbPath, JSON.stringify(payload))
  }

  leerDB () {
    if (fs.existsSync(!this.dbPath)) return
    const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' })
    const { historial } = JSON.parse(info)
    this.historial = historial
  }
}

module.exports = Busquedas
