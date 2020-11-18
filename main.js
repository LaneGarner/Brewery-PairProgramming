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

    // setTimeout(()=> {
    //     checkForNear()
    // }, 6000)
}

const getCity = () => {
    fetch(`https://www.mapquestapi.com/geocoding/v1/reverse?key=IOGuXL0zAKHaQVwYf9qGnm4UQm9ZG7PZ&location=${currentLat}%2C${currentLong}&outFormat=json&thumbMaps=false`)
    .then(res=>res.json())
    .then(response => {
        myCity = response.results[0].locations[0].adminArea5
        console.log(myCity)
        document.getElementById("curLocation").innerHTML = myCity;
    })
}

const getBreweries = () => {
    // myCity = "austin"
    fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50`)
    .then(res => res.json())
    .then(response => {
        breweriesPage1 = response;
    })
    .catch(err => {
        console.error(err);
    });
    setTimeout(() => {
        if (breweriesPage1.length === 50) {
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
        } else {
            allBreweries = breweriesPage1;
        }
    }, 500)
    
    setTimeout(() => {
        let numOfBrews = allBreweries.length;
        if (numOfBrews > 0) {
            document.getElementById("numOfBreweries").innerHTML = `There are <br>${numOfBrews} breweries in your city.`
        } else {
            document.getElementById("numOfBreweries").innerHTML = `Oh no!<br>There are ${numOfBrews} breweries in your city. Try searching a nearby city.`
        }
    }, 600)
}

const checkForNear = (dist) => {
    for (let brewery of allBreweries) {
        if (brewery.latitude !== null) {
            let diffLat = Math.abs(brewery.latitude-currentLat)
            if (diffLat <= dist) {
                let diffLong = Math.abs(brewery.longitude-currentLong)
                if (diffLong <= dist) {
                    nearByBrews.push(brewery)
                }
            }
        }
    }
    console.log(nearByBrews)
}

const getCoords = (city) => {
    fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=8q0FAWlpVLSby4A5G8GyjZliyncLL3Wh&inFormat=kvp&outFormat=json&location=${city}&thumbMaps=false`)
    .then(res => res.json())
    .then(response => {
        coords = response;
        console.log(coords.results[0].locations[0].displayLatLng)
        currentLat = coords.results[0].locations[0].displayLatLng.lat
        currentLong = coords.results[0].locations[0].displayLatLng.lng
    })
}

const updateCity = () => {
    console.log("click button")
    let input = document.getElementById("citySearch").value
    myCity = input.toLowerCase();
    breweriesPage1 = null;
    breweriesPage2 = null;
    allBreweries = null;
    nearByBrews = [];
    console.log(myCity)
    getBreweries();
    getCoords(myCity)
    setTimeout(() => {
        checkForNear()
    }, 2000)
}

const searchDistance = () => {
    let input = document.getElementById("distance").value
    if (input === "five") {
        nearByBrews = [];
        checkForNear(0.0724637681309405)
    } else if (input === "ten") {
        nearByBrews = [];
        checkForNear(0.144927536261881)
    } else if (input === "twenty") {
        nearByBrews = [];
        checkForNear(0.289855072523762)
    } else if (input === "fifty") {
        nearByBrews = [];
        checkForNear(1)
    }
    const brewList = document.getElementById("searchResults")
    brewList.innerHTML = null;
    nearByBrews.map((brews) => {
        const li = document.createElement('li');
        const text = document.createTextNode(`${brews.name} - Brew Type: ${brews.brewery_type} - ${brews.street} ${brews.city}`)
        li.appendChild(text)
        brewList.appendChild(li)
    })
}

//CHECK IF BREW HAS COORDS
// IF NO COORDS .. GET ADDRESS AND USE GET COORDS FUNCTION BELOW
// PUSH COORDINATES INTO 
// const checkForCoords = () => {
//     let newLat;
//     let lewLong;
//     for(let brewery of allBreweries) {
//         if (brewery.latitude === null && brewery.street !== "") {
//             let streetAdd = [];
//             streetAdd = brewery.street.split(" ")
//             let newStreet = streetAdd.join("+")
//             // console.log(newStreet)

//             setTimeout(() => {
//                 getCoords(newStreet, brewery.city, brewery.state)
//             }, 5000)
//         }
//     }
// }


// const getCoords = (city) => {
//     fetch(`https://www.mapquestapi.com/geocoding/1/address?key=8q0FAWlpVLSby4A5G8GyjZliyncLL3Wh&inFormat=kvp&outFormat=json&location=${city}&thumbMaps=false`)
//     .then(res => res.json())
//     .then(response => {
//         coords = response;
//         console.log(coords.results[0].locations[0].displayLatLng)
//     })
//     console.log(`${street}+${city}+${state}`)
// }

// getCoords()


//COMPARE USER COORDS TO BREW COORDS


// console.log('All breweries: ', allBreweries)
// console.log('breweries 2: ', breweries2)



// .0144927536261881 = 1 mile


