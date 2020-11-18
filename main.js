// const env = require('dotenv').config()

let nearByBrews = [], breweriesPage1, breweriesPage2, allBreweries, coords, city, myCity, currentLat, currentLong;

const getLocation = () => {
    return new Promise((resolve)=>{

        navigator.geolocation.getCurrentPosition(function(position){
            console.log(position)
            currentLat = position.coords.latitude;
            currentLong = position.coords.longitude;
            console.log(currentLat, currentLong)
            
            resolve()
            
        })
        
    })
}

const getCity = () => {
    return new Promise((resolve)=>{

        fetch(`https://www.mapquestapi.com/geocoding/v1/reverse?key=IOGuXL0zAKHaQVwYf9qGnm4UQm9ZG7PZ&location=${currentLat}%2C${currentLong}&outFormat=json&thumbMaps=false`)
        .then(res=>res.json())
        .then(response => {

                myCity = response.results[0].locations[0].adminArea5
                console.log(myCity)
                resolve()
            })
    })
}


const getBreweries = () => {
    return new Promise((resolve)=>{

        fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50`)
        .then(res => res.json())
        .then(response => {
            breweriesPage1 = response;
        })

        fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50&page=2`)
        .then(res => res.json())
        .then(response => {
            breweriesPage2 = response;
            setTimeout(()=>{
                allBreweries = breweriesPage1.concat(breweriesPage2)
                console.log(allBreweries)
            }, 500)
            resolve()
            
        })
        .catch(err => {
            console.error(err);
        })
        // .then(resolve());

    })
}


const checkForNear = () => {
    for (let brewery of allBreweries) {
        if (brewery.latitude !== null) {
            let diffLat = Math.abs(brewery.latitude-currentLat)
            if (diffLat <= .144927) {
                let diffLong = Math.abs(brewery.longitude-currentLong)
                if (diffLong <= .144927) {
                    nearByBrews.push(brewery)
                }
            }
        }
    }
    console.log(nearByBrews)
}

getLocation()
    .then(getCity)
    .then(getBreweries)
    .then(checkForNear);


//CHECK IF BREW HAS COORDS
// IF NO COORDS .. GET ADDRESS AND USE GET COORDS FUNCTION BELOW
// PUSH COORDINATES INTO 



const getCoords = () => {
    fetch("https://www.mapquestapi.com/geocoding/v1/address?key=IOGuXL0zAKHaQVwYf9qGnm4UQm9ZG7PZ&inFormat=kvp&outFormat=json&location=4602+Weletka+Dr+austin+tx&thumbMaps=false")
    .then(res => res.json())
    .then(response => {
        coords = response;
        console.log(coords.results[0].locations[0].displayLatLng)
    })
}

// getCoords()




const displayNearByBrews = () => {
    let domBrews = document.querySelector('#dom-brews');
    let listOfBrews = document.createElement('ul');
    let load = document.querySelector('#load')
    let brewItem;
    console.log(nearByBrews)
    nearByBrews.forEach(brew => {
        console.log(brew.name, brew.street, brew.city, brew.state, brew.phone, brew.website_url)
        brewItem = document.createElement('li')
        let name = document.createElement('h2')
            name.innerHTML = brew.name
        let info = document.createElement('p');
            info.innerHTML = `
                <strong>Address:</strong> ${brew.street}, ${brew.city}, ${brew.state}<br>
                <strong>Phone:</strong> ${brew.phone}<br>
                <strong>Website:</strong> <a href ="${brew.website_url}" target="_blank">${brew.website_url.slice(11)}</a>
            `
        brewItem.appendChild(name)
        brewItem.appendChild(info)
        listOfBrews.appendChild(brewItem)
    })

    domBrews.appendChild(listOfBrews)
    load.style.display = 'none';
}

// console.log('All breweries: ', allBreweries)
// console.log('breweries 2: ', breweries2)



// .0144927536261881 = 1 mile

