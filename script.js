let key = 'YGQXXTBLD2RNF86HFW9ZKJ6Z6'
let place = 'Vaasa'
let unitGroup = 'metric' // metric, us, uk, base
let today = new Date();
let year = today.getFullYear();
let month = today.getMonth() + 1; // Months are zero-indexed, so add 1
let day = today.getDate();
let date1 = `${year}-${month}-${day}`
let future = new Date()
future.setDate(today.getDate() + 5)
let futureYear = future.getFullYear();
let futureMonth = future.getMonth() + 1
let futureDay = future.getDate()
let date2 = `${futureYear}-${futureMonth}-${futureDay}`

async function getData () {
    let url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${place}/${date1}/${date2}?unitGroup=${unitGroup}&key=${key}&contentType=json`
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        })

        if(!res.ok) {
            throw new Error('error res status ' + res.status)
        }
        const data = await res.json()
        console.log(data)
        return data.days

    } catch (e) {
        console.log(e)
    } 
}

// Paints the temperatures
async function addElems() { 
    let main = document.querySelector('.main')
    let data = await getData()
    let today = data[0].hours
    let todayDiv = document.querySelector('.today')
    if(todayDiv === null) {
        todayDiv = document.createElement('div')
        todayDiv.className = 'today'
        main.append(todayDiv)
    } else {
        todayDiv.innerHTML = ''
    }
    today.forEach(hour => {
        let tempCard = document.createElement('div')
        tempCard.className = 'tempCard'
        let hourDiv = document.createElement('div')
        hourDiv.innerHTML = hour.datetime
        tempCard.append(hourDiv)
        let icon = hour.icon
        let image = document.createElement('img')
        image.src = './images/' + icon + '.png'
        tempCard.append(image)
        let tempDiv = document.createElement('div')
        tempDiv.innerHTML = hour.temp + '°'
        tempCard.append(tempDiv)
        todayDiv.append(tempCard)
    })

    getImage(data[0].icon)


    let header = document.querySelector('h1')
    header.innerHTML = place

    let temp = data[0].temp
    console.log(`temp: ${temp}`)
    let backgroundClass = ''
    if(temp > 20) {
        backgroundClass = 'hot'
    } else if (temp > 15) {
        backgroundClass = 'medium'
    } else {
        backgroundClass = 'cold'
    }
    main.classList.remove('hot', 'medium', 'cold');
    main.classList.add(backgroundClass)
}



function handleClick() {
    place = input.value
    addElems()
}

const header = document.querySelector('.header')
let input = document.createElement('input')
input.addEventListener('keydown', event => {
    if(event.key === 'Enter') {
        handleClick()
    }
})
// header elements
header.append(input)
let button = document.createElement('button')
button.innerHTML = 'Submit'
button.addEventListener('click', handleClick)

const toggleBtn = document.createElement('button')
toggleBtn.innerHTML = 'Celsius/Fahrenheit'
toggleBtn.addEventListener('click', handleToggle)

function handleToggle() {
    // us, uk, metric, base
    unitGroup = (unitGroup === 'metric') ? 'us' : 'metric'
    addElems()
}

header.append(toggleBtn)
header.append(button)
addElems()


function getImage (prompt) {
    fetch(`https://api.giphy.com/v1/gifs/translate?api_key=J5yMscLZ72gs5DdFpmL2KnVmiJJzBBMS&s=${prompt}`, {mode: 'cors'})
    .then(res => {
        return res.json()
    }).then(data => {
        let imgSrc = './images/fallback.jpg'
        if(data.data.images){
            imgSrc = data.data.images.original.url
        }
        console.log('image loaded' + imgSrc)
        document.body.style.backgroundImage = `url('${imgSrc}')`
        document.body.style.backgroundSize = "cover";         // Scale the image to cover the entire screen
        document.body.style.backgroundRepeat = "no-repeat";   // Prevent the image from repeating
        document.body.style.backgroundPosition = "center";    // Center the image      
        document.body.style.height = "100vh";     
    }).catch(e => {
        console.log(e)
    })
}
