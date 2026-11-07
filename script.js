let place = 'Vaasa'
let temperatureUnit = 'celsius'

async function fetchJson(url) {
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Weather service returned ${response.status}`)
    }
    return response.json()
}

async function getData(locationName) {
    const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search')
    geocodingUrl.search = new URLSearchParams({
        name: locationName,
        count: '1',
        language: 'en',
        format: 'json'
    })

    const locations = await fetchJson(geocodingUrl)
    const location = locations.results && locations.results[0]
    if (!location) {
        throw new Error(`No location found for "${locationName}".`)
    }

    const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast')
    forecastUrl.search = new URLSearchParams({
        latitude: location.latitude,
        longitude: location.longitude,
        hourly: 'temperature_2m,weather_code,is_day',
        daily: 'temperature_2m_max',
        forecast_days: '6',
        timezone: 'auto',
        temperature_unit: temperatureUnit
    })

    return {
        location,
        forecast: await fetchJson(forecastUrl)
    }
}

function getWeatherIcon(code, isDay) {
    if (code === 0) return isDay ? 'clear-day' : 'clear-night'
    if (code === 1 || code === 2) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night'
    if (code === 3) return 'cloudy'
    if (code === 45 || code === 48) return 'fog'
    if (code >= 51 && code <= 67) return 'rain'
    if (code >= 71 && code <= 77) return 'snow'
    if (code >= 80 && code <= 82) return isDay ? 'showers-day' : 'showers-night'
    if (code === 85 || code === 86) return isDay ? 'snow-showers-day' : 'snow-showers-night'
    if (code >= 95) return 'thunder-rain'
    return 'cloudy'
}

async function addElems() {
    const main = document.querySelector('.main')
    main.textContent = 'Loading weather...'

    try {
        const { location, forecast } = await getData(place)
        const today = forecast.daily.time[0]
        const todayDiv = document.createElement('div')
        todayDiv.className = 'today'

        forecast.hourly.time.forEach((time, index) => {
            if (!time.startsWith(`${today}T`)) return

            const tempCard = document.createElement('div')
            tempCard.className = 'tempCard'

            const hourDiv = document.createElement('div')
            hourDiv.textContent = time.split('T')[1]
            tempCard.append(hourDiv)

            const image = document.createElement('img')
            image.src = `./images/${getWeatherIcon(
                forecast.hourly.weather_code[index],
                forecast.hourly.is_day[index]
            )}.png`
            image.alt = ''
            tempCard.append(image)

            const tempDiv = document.createElement('div')
            const unit = temperatureUnit === 'celsius' ? '°C' : '°F'
            tempDiv.textContent = `${Math.round(forecast.hourly.temperature_2m[index])}${unit}`
            tempCard.append(tempDiv)

            todayDiv.append(tempCard)
        })

        main.replaceChildren(todayDiv)
        document.querySelector('h1').textContent = location.name

        const maxTemp = forecast.daily.temperature_2m_max[0]
        const warmThreshold = temperatureUnit === 'celsius' ? 20 : 68
        const mildThreshold = temperatureUnit === 'celsius' ? 15 : 59
        const backgroundClass = maxTemp > warmThreshold ? 'hot' : maxTemp > mildThreshold ? 'medium' : 'cold'
        main.classList.remove('hot', 'medium', 'cold')
        main.classList.add(backgroundClass)
    } catch (error) {
        console.error(error)
        main.textContent = error.message || 'Could not load weather.'
    }
}

function handleClick() {
    const newPlace = input.value.trim()
    if (!newPlace) return
    place = newPlace
    addElems()
}

const header = document.querySelector('.header')
const input = document.createElement('input')
input.placeholder = 'Enter a city'
input.setAttribute('aria-label', 'City')
input.addEventListener('keydown', event => {
    if (event.key === 'Enter') handleClick()
})
header.append(input)

const button = document.createElement('button')
button.textContent = 'Submit'
button.addEventListener('click', handleClick)
header.append(button)

const toggleBtn = document.createElement('button')
toggleBtn.textContent = 'Celsius/Fahrenheit'
toggleBtn.addEventListener('click', () => {
    temperatureUnit = temperatureUnit === 'celsius' ? 'fahrenheit' : 'celsius'
    addElems()
})
header.append(toggleBtn)

addElems()
