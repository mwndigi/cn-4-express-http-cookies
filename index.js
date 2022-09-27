const express = require('express')
const cookieParser = require('cookie-parser')
const helmet = require("helmet")
const morgan = require('morgan')
const fetch = require('node-fetch')
var path = require('path');
const app = express()
const port = 3000

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());

// Helmet helps you secure your Express apps by setting various HTTP headers
// https://www.npmjs.com/package/helmet
// app.use(helmet())
app.use(helmet.hidePoweredBy())


// Morgan is a HTTP request logger middleware for Node.js
// https://www.npmjs.com/package/morgan
app.use(morgan('combined'))

// cookie-parser helps parse Cookie header and populate req.cookies with an object keyed by cookie name
// https://www.npmjs.com/package/cookie-parser
app.use(cookieParser('A secret!'))

app.use(express.static(path.join(__dirname, 'public')));

// Routes for Weather data
const cphWeatherRoute = 'https://api.open-meteo.com/v1/forecast?latitude=55.6763&longitude=12.5681&current_weather=true'
const berlinWeatherRoute = 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true'
const parisWeatherRoute = 'https://api.open-meteo.com/v1/forecast?latitude=48.8567&longitude=2.3510&current_weather=true'
const laWeatherRoute = 'https://api.open-meteo.com/v1/forecast?latitude=34.05&longitude=-118.24&current_weather=true'

// Returner temperatur fra fetch
const fetchRouteToTemp = (weatherRoute) => fetch(weatherRoute)
    .then(response => response.json())
    .then(data => data.current_weather.temperature)

// Promise for at fetche alle routes
async function fetchRouteAsync() {
      try {   
          const results = await Promise.all(
              [
                  fetchRouteToTemp(cphWeatherRoute),
                  fetchRouteToTemp(berlinWeatherRoute),
                  fetchRouteToTemp(laWeatherRoute),
                  fetchRouteToTemp(parisWeatherRoute)
              ]
          )
  
          data = [ 
                    ['Copenhagen', results[0]],
                    ['Berlin', results[1]],
                    ['Los Angeles', results[2]],
                    ['Paris', results[3]]
          ]

          // console.log(data)

          return data
  
      } catch (e) {
          console.error(e)
      }
  }

fetchRouteAsync()

app.get('/', (req, res) => {
  console.log(req.headers)
  res.render('pages/index')
})

app.get('/data/', (req, res) => {
  res.render('pages/data')
})

app.get('/json-data', (req, res) => {
  res.status(200).json({ cityTemperature: data })
})

app.get('/cookies', (req, res) => {
  res.cookie('app', 'express', {signed: true})
  res.cookie('test', 'normal cookie')
  console.log('Cookies: ', req.cookies)
  console.log('Signed Cookies: ', req.signedCookies)
  res.send('Cookies added. Right-click -> Inspect -> Application -> Storage -> Cookies.')
})

app.get('/clear-cookies', (req, res) => {
  res.clearCookie('app')
  res.clearCookie('test')
  res.json('Cookies cleared')
})

app.post('/new', (req, res) => {
  // curl -X POST http://localhost:3000/new --header 'content-type: application/json' --data '{"json-data": "New Hello"}'
  res.status(201)
  res.json(req.body)
})

app.get('/redirect', (req, res) => {
  res.status(302)
  res.redirect('/')
});

app.get('/error', (req, res) => {
  res.status(404)
  res.render('pages/error')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
