// require('dotenv').config()

let nearByBrews = [], breweriesPage1, breweriesPage2, allBreweries, coords, city, myCity, currentLat, currentLong, favoriteBrews = [], newLat, newLong;

//RETURN USERS CURRENT GEOLOCATION COORDS
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

//GET USERS CURRENT CITY NAME BASED ON GEOLOCATION COORDS
const getCity = () => {
    return new Promise((resolve) => {
        // console.log(currentLat)
        // console.log(currentLong)
        fetch(`https://www.mapquestapi.com/geocoding/v1/reverse?key=IOGuXL0zAKHaQVwYf9qGnm4UQm9ZG7PZ&location=${currentLat}%2C${currentLong}&outFormat=json&thumbMaps=false`)
        .then(res=>res.json())
        .then(response => {
            myCity = response.results[0].locations[0].adminArea5
            // console.log(myCity)
            document.getElementById("curLocation").innerHTML = myCity;
            resolve()
        })
    });
}  

//ADD FAVORITE KEY TO BREWERY OBJECT
const addFavorite = () => {
    allBreweries.forEach(element => {
        element.favorite = false;
    })
}

//GET ADDITIONAL PAGE OF BREWERIES
const getMoreBreweries = () => {
    // console.log("get more")
    return new Promise((resolve) => {
        if (breweriesPage1.length >= 50) {
        fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50&page=2`)
            .then(res => res.json())
            .then(response => {
            breweriesPage2 = response;
            allBreweries = breweriesPage1.concat(breweriesPage2)
            addFavorite();
            resolve()
            // console.log(allBreweries)
        })
        .catch(err => {
            console.error(err);
        });
    } else {
        allBreweries = breweriesPage1
        addFavorite();
        resolve()
        }
        
    })
};

//UPDATES DOM RESULTS DISPLAYING TOTAL NUMBER OF BREWERIES RETURNED
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

//RETURNS FIRST 50 BREWERIES BASED ON CITY NAME
const getBreweries = () => {
    return new Promise((resolve) => {
        // myCity = "austin"
        // console.log(myCity)
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

//RUNS THROUGH ALL BREWERIES TO CHECK WHICH ONES ARE WITHIN SPECIFIED DISTANCE
const checkForNear = (dist) => {
    // console.log('checking for near')
        // console.log('checking for near')
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
    // console.log(nearByBrews)
}

//GET COORDS FROM CITY NAME
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

//COLLECT CITY INPUT, UPDATE MYCITY, RUN NEW SEARCH
const updateCity = () => {
    // console.log("click button")
    document.getElementById("searchResults").innerHTML = null;
    let input = document.getElementById("citySearch").value
    myCity = input.toLowerCase();
    breweriesPage1 = null;
    breweriesPage2 = null;
    allBreweries = null;
    nearByBrews = [];
    // console.log(myCity)
    getBreweries()
        .then(getMoreBreweries)
        .then(listNumber)
        .then(getCoords(myCity))
        .then(checkForCoords)
        .then(searchDistance);
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
        // console.log(brewery)
    })
}

//SEARCHES FOR ALL BREWERIES WITHIN SPECIFIED DISTANCE AND DISPLAY ON LIST
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
    nearByBrews.map((brew, index) => {
        const i = document.createElement('i');
        i.classList.add("far")
        i.classList.add("fa-heart")
        i.setAttribute("onclick", "likeIt(this)")
        const li = document.createElement('li');
        li.id = index;
        const h2 = document.createElement('h2');
        let info = document.createElement('p');
        info.innerHTML = `
            <strong>Address:</strong> ${brew.street}, ${brew.city}, ${brew.state}<br>
            <strong>Phone:</strong> ${brew.phone}<br>
            <strong>Website:</strong> <a href ="${brew.website_url}" target="_blank">${brew.website_url.slice(11)}</a>
        `
        const brewName = document.createTextNode(`${brew.name}`)
        h2.appendChild(brewName)
        // p.appendChild(brewInfo)
        li.appendChild(h2)
        li.appendChild(info)
        li.appendChild(i)
        brewList.appendChild(li)
    })
}

//LIKE BUTTON = ADDS OR REMOVES BREWERY TO FAVORITE LIST AND UPDATES COUNTER
const likeIt = (elem) => {
    let index = elem.parentNode.id
    // let favNum = document.getElementById("favNum")
    let favButton = document.getElementById("favoriteList")
    let favNumber = document.getElementById("numbers")
    if (elem.classList.contains("fa-heart")) {
        elem.classList.remove("far");
        elem.classList.add("fas");
        elem.classList.remove("fa-heart");
        elem.classList.add("fa-beer");
        nearByBrews[index]["favorite"] = true;
        let brewName = elem.parentNode.firstChild.innerHTML
        let favIndexCheck = favoriteBrews.findIndex( element => {
            if (element.name === brewName) {
                return true
            }
        });
        // console.log(favIndexCheck)
        if (favIndexCheck < 0) {
            favoriteBrews.push(nearByBrews[index])
        }
        if (favoriteBrews.length > 0) {
            favButton.style.visibility = "visible"
            favNumber.innerHTML = favoriteBrews.length
        }
        // console.log(favoriteBrews.length)
    } else if (elem.classList.contains("fa-beer")) {
        elem.classList.remove("fas");
        elem.classList.add("far");
        elem.classList.remove("fa-beer");
        elem.classList.add("fa-heart");
        let brewName = elem.parentNode.firstChild.innerHTML
        let favIndex = favoriteBrews.findIndex( element => {
            if (element.name === brewName) {
                return true
            }
        });
        nearByBrews[index]["favorite"] = false
        favoriteBrews.splice(favIndex, 1)
        favNumber.innerHTML = favoriteBrews.length
        // console.log(favoriteBrews.length)
        if (favoriteBrews.length === 0) {
            favButton.style.visibility = "hidden"
            favNumber.innerHTML = null;
        }
    }
        // favNum.innerHTML = `You have ${favoriteBrews.length} favorite breweries!`    
}

//REMOVE FAVORTIED BREWERIES WHILE FAVORTIE LIST IS DISPLAYED
const removeIt = (elem) => {
    let index = elem.parentNode.id
    let favButton = document.getElementById("favoriteList")
    let favNumber = document.getElementById("numbers")
    if (elem.classList.contains("fa-beer")) {
        let brewName = elem.parentNode.firstChild.innerHTML
        let favIndex = favoriteBrews.findIndex( element => {
            if (element.name === brewName) {
                return true
            }
        });
        nearByBrews[index]["favorite"] = false
        favoriteBrews.splice(favIndex, 1)
        favNumber.innerHTML = favoriteBrews.length
        listFavorites();
        if (favoriteBrews.length === 0) {
            favButton.style.visibility = "hidden"
            favNumber.innerHTML = null;
            searchDistance();
        }
    }
}


//DISLAY ALL FAVORITED BREWERIES IN LIST
const listFavorites = () => {
    const brewList = document.getElementById("searchResults")
    brewList.innerHTML = null;
    favoriteBrews.map((brew, index) => {
        const i = document.createElement('i');
        i.classList.add("fas")
        i.classList.add("fa-beer")
        i.setAttribute("onclick", "removeIt(this)")
        const li = document.createElement('li');
        li.id = index;
        const h2 = document.createElement('h2');
        let info = document.createElement('p');
        info.innerHTML = `
            <strong>Address:</strong> ${brew.street}, ${brew.city}, ${brew.state}<br>
            <strong>Phone:</strong> ${brew.phone}<br>
            <strong>Website:</strong> <a href ="${brew.website_url}" target="_blank">${brew.website_url.slice(11)}</a>
        `
        const brewName = document.createTextNode(`${brew.name}`)
        h2.appendChild(brewName)
        // p.appendChild(brewInfo)
        li.appendChild(h2)
        li.appendChild(info)
        li.appendChild(i)
        brewList.appendChild(li)
    })
}

//STARTING FUNCTION CALLS
getLocation()
    .then(getCity)
    .then(getBreweries)
    .then(getMoreBreweries)
    .then(checkForCoords)
    .then(listNumber)
    .then(searchDistance);


//EVENT LISTENER FOR ENTER PRESSED ON INPUT FIELD
let inputField = document.getElementById("citySearch")
inputField.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
    updateCity();
    }
});


//1 LATITUDE MILE
// .0144927536261881 = 1 mile


