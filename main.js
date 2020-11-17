// require('dotenv').config()

let nearByBrews = [], breweriesPage1, breweriesPage2, allBreweries, coords, city, myCity, currentLat, currentLong;

window.onload = function() {
    navigator.geolocation.getCurrentPosition(function(position){
        console.log(position)
        currentLat = position.coords.latitude;
        currentLong = position.coords.longitude;
    })
    setTimeout(()=>{
        getCity()
    }, 4000)

    setTimeout(()=> {
        getBreweries()
    }, 5000)

    setTimeout(()=> {
        checkForNear()
    }, 6000)
}

const getCity = () => {
    fetch(`https://www.mapquestapi.com/geocoding/v1/reverse?key=IOGuXL0zAKHaQVwYf9qGnm4UQm9ZG7PZ&location=${currentLat}%2C${currentLong}&outFormat=json&thumbMaps=false`)
    .then(res=>res.json())
    .then(response => {
        myCity = response.results[0].locations[0].adminArea5
        console.log(myCity)
    })
}

const getBreweries = () => {
    fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50`)
    .then(res => res.json())
    .then(response => {
        breweriesPage1 = response;
    })
    fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50&page=2`)
    .then(res => res.json())
    .then(response => {
        breweriesPage2 = response;
        allBreweries = breweriesPage1.concat(breweriesPage2)
        console.log(allBreweries)
    })
    .catch(err => {
        console.error(err);
    });
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

getCoords()


//COMPARE USER COORDS TO BREW COORDS


// console.log('All breweries: ', allBreweries)
// console.log('breweries 2: ', breweries2)



// .0144927536261881 = 1 mile
