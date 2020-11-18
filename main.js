// require('dotenv').config()

let nearByBrews = [], breweriesPage1, breweriesPage2, allBreweries, coords, city, myCity, currentLat, currentLong, favoriteBrews = [], newLat, newLong;

// window.onload = function() {
//     navigator.geolocation.getCurrentPosition(function(position){
//         console.log(position)
//         currentLat = position.coords.latitude;
//         currentLong = position.coords.longitude;
//     })
//     setTimeout(()=>{
//         getCity()
//     }, 4000)

//     setTimeout(()=> {
//         getBreweries()
//     }, 5000)

//     setTimeout(()=> {
//         checkForCoords()
//     }, 6000)
// }
const getLocation = () => {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(function(position){
        console.log(position)
        currentLat = position.coords.latitude;
        currentLong = position.coords.longitude;
        resolve();
        })
    })
}
const getCity = () => {
    return new Promise((resolve) => {
        console.log(currentLat)
        console.log(currentLong)
        fetch(`https://www.mapquestapi.com/geocoding/v1/reverse?key=IOGuXL0zAKHaQVwYf9qGnm4UQm9ZG7PZ&location=${currentLat}%2C${currentLong}&outFormat=json&thumbMaps=false`)
        .then(res=>res.json())
        .then(response => {
            myCity = response.results[0].locations[0].adminArea5
            console.log(myCity)
            document.getElementById("curLocation").innerHTML = myCity;
            resolve()
        })
    });
}   

const getMoreBreweries = () => {
    console.log("get more")
    return new Promise((resolve) => {
        if (breweriesPage1.length >= 50) {
        fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50&page=2`)
            .then(res => res.json())
            .then(response => {
            breweriesPage2 = response;
            allBreweries = breweriesPage1.concat(breweriesPage2)
            resolve()
            // console.log(allBreweries)
            })
            .catch(err => {
            console.error(err);
            });
        } else {
            allBreweries = breweriesPage1
            resolve()
        }
        
    })
};

const listNumber = () => {
    return new Promise((resolve) => {
        let numOfBrews = allBreweries.length;
        if (numOfBrews > 0) {
            document.getElementById("numOfBreweries").innerHTML = `There are <br>${numOfBrews} breweries in your city.`
            resolve()
        } else {
            document.getElementById("numOfBreweries").innerHTML = `Oh no!<br>There are ${numOfBrews} breweries in your city. Try searching a nearby city.`
            resolve()
        }
    })
}

const getBreweries = () => {
    return new Promise((resolve) => {
        // myCity = "austin"
        console.log(myCity)
        fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50`)
            .then(res => res.json())
            .then(response => {
            breweriesPage1 = response;
            resolve()
            })
        .catch(err => {
        console.error(err);
        });
        
    })
}


const checkForNear = (dist) => {
    console.log('checking for near')
        for (let brewery of allBreweries) {
        if (brewery.latitude !== null) {
            let diffLat = Math.abs(brewery.latitude-currentLat)
            if (diffLat <= dist) {
                let diffLong = Math.abs(brewery.longitude-currentLong)
                if (diffLong <= dist) {
                    console.log(brewery)
                    nearByBrews.push(brewery)
                }
            }
        }
    }
    console.log(nearByBrews)
}

const getCoords = (city) => {
    return new Promise((resolve) => {
        fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=8q0FAWlpVLSby4A5G8GyjZliyncLL3Wh&inFormat=kvp&outFormat=json&location=${city}&thumbMaps=false`)
        .then(res => res.json())
        .then(response => {
            coords = response;
            console.log(coords.results[0].locations[0].displayLatLng)
            currentLat = coords.results[0].locations[0].displayLatLng.lat
            currentLong = coords.results[0].locations[0].displayLatLng.lng
            resolve()
        })
    })
}

const updateCity = () => {
    console.log("click button")
    document.getElementById("searchResults").innerHTML = null;
    let input = document.getElementById("citySearch").value
    myCity = input.toLowerCase();
    breweriesPage1 = null;
    breweriesPage2 = null;
    allBreweries = null;
    nearByBrews = [];
    console.log(myCity)
    getBreweries()
        .then(getMoreBreweries)
        .then(listNumber);
    getCoords(myCity)
        .then(checkForCoords)
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
    nearByBrews.map((brews, index) => {
        const i = document.createElement('i');
        i.classList.add("far")
        i.classList.add("fa-heart")
        i.setAttribute("onclick", "likeIt(this)")
        const li = document.createElement('li');
        li.id = index;
        const text = document.createTextNode(`${brews.name} - Brew Type: ${brews.brewery_type} - ${brews.street} ${brews.city}`)
        li.appendChild(i)
        li.appendChild(text)
        brewList.appendChild(li)
    })
}

const likeIt = (elem) => {
    let index = elem.parentNode.id
    let favNum = document.getElementById("favNum")
    elem.classList.remove("far");
    elem.classList.add("fas");
    favoriteBrews.push(nearByBrews[index])
    favNum.innerHTML = `You have ${favoriteBrews.length} favorite breweries!`    
}

//CHECK IF BREW HAS COORDS
// IF NO COORDS .. GET ADDRESS AND USE GET COORDS FUNCTION BELOW
// PUSH COORDINATES INTO 
const checkForCoords = () => {
    return new Promise((resolve) => {
        for(let brewery of allBreweries) {
            if (brewery.latitude === null && brewery.street !== "") {
                let streetAdd = [];
                streetAdd = brewery.street.split(" ")
                let newStreet = streetAdd.join("+")

                getNewCoords(newStreet, brewery.city, brewery.state, brewery)
            }
        }
        resolve()
    })
}


const getNewCoords = (street,city,state,brewery) => {
    fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=8q0FAWlpVLSby4A5G8GyjZliyncLL3Wh&inFormat=kvp&outFormat=json&location=${street}+${city}+${state}&thumbMaps=false`)
    .then(res => res.json())
    .then(response => {
        coords = response;
        // console.log(coords.results[0].locations[0].displayLatLng)
        brewery.latitude = coords.results[0].locations[0].displayLatLng.lat
        brewery.longitude = coords.results[0].locations[0].displayLatLng.lng
        console.log(brewery)
    })
}

getLocation()
    .then(getCity)
    .then(getBreweries)
    .then(getMoreBreweries)
    .then(checkForCoords)
    .then(listNumber);
    // .then(checkForNear);

// .0144927536261881 = 1 mile


