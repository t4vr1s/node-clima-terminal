require('dotenv').config()
const {
  inquirerMenu,
  pausar,
  leerInput,
  listarLugares
} = require('./helpers/inquirer')
const Busquedas = require('./models/busquedas')

const main = async () => {
  let opt,
    buscar,
    ciudades,
    id,
    selectCiudad,
    clima,
    idx
  const busquedas = new Busquedas()
  do {
    opt = await inquirerMenu()
    switch (opt) {
      case 1:
        // mostrar mensaje
        buscar = await leerInput('Ciudad:')
        // buscar lugar
        ciudades = await busquedas.ciudad(buscar)
        // seleccionar lugar
        id = await listarLugares(ciudades)
        if (id === 0) continue
        selectCiudad = ciudades.find((ciudad) => id === ciudad.id)
        // guardar db
        busquedas.agregarHistorial(selectCiudad.nombre)
        // clima
        clima = await busquedas.climaLugar(selectCiudad.lat, selectCiudad.lng)
        // mostrar resultados
        console.clear()
        console.log('\nBuscando clima de la ciudad\n'.green)
        console.log(`Ciudad: ${selectCiudad.nombre.green}`)
        console.log('Lat:', selectCiudad.lat)
        console.log('Lng:', selectCiudad.lng)
        console.log('Tempratura:', clima.temp)
        console.log('Mínima:', clima.min)
        console.log('Máxima:', clima.max)
        console.log('Descripción clima:', clima.desc.green)
        break
      case 2:
        busquedas.historialCapitalizado.forEach((lugar, index) => {
          idx = `${index + 1}.`.green
          console.log(`${idx} ${lugar}`)
        })
        break
      case 0:
        console.log('Adiós...')
        break

      default:
        console.log('Opción no reconocida')
        break
    }
    if (opt !== 0) await pausar()
  } while (opt !== 0)
}

main()
