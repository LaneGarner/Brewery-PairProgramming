// require('dotenv').config()
let currentLat, currentLong, breweriesPage1, breweriesPage2, allBreweries;

window.onload = function() {
    navigator.geolocation.getCurrentPosition(function(position){
        console.log(position)
        currentLat = position.coords.latitude;
        currentLong = position.coords.longitude;
    })
    // console.log(currentLocation)
  }

const getBreweries = () => {
    fetch("https://api.openbrewerydb.org/breweries?by_city=austin&per_page=50")
    .then(res => res.json())
    .then(response => {
        breweriesPage1 = response;
        console.log(breweriesPage1);
    })
    .catch(err => {
        console.error(err);
    });
    fetch("https://api.openbrewerydb.org/breweries?by_city=austin&per_page=50&page=2")
    .then(res => res.json())
    .then(response => {
        breweriesPage2 = response;
        console.log(breweriesPage2);
        allBreweries = breweriesPage1.concat(breweriesPage2)
        console.log(allBreweries)
    })
    .catch(err => {
        console.error(err);
    });
}

getBreweries()

setTimeout(function() {
    console.log(`user latitude: ${currentLat}`)
    console.log(`user longitude: ${currentLong}`)
}, 1000)

const checkForNear = () => {
    let nearByBrews = [];
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
