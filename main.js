// const env = require('dotenv').config()

let nearByBrews = [], favoriteBrews= [], dif = 0.21739130434782608, breweriesPage1, breweriesPage2, allBreweries, coords, city, myCity, currentLat, currentLong;

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


// const getBreweries = () => {
//     return new Promise((resolve)=>{

//         fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50`)
//         .then(res => res.json())
//         .then(response => {
//             breweriesPage1 = response;
//         })

//         fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50&page=2`)
//         .then(res => res.json())
//         .then(response => {
//             breweriesPage2 = response;
//             setTimeout(()=>{
//                 allBreweries = breweriesPage1.concat(breweriesPage2)
//                 console.log(allBreweries)
//                 resolve()
//             }, 500)
            
//         })
//         .catch(err => {
//             console.error(err);
//         })

//     })
// }

const getBreweries = () => {
    return new Promise((resolve)=>{
        fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50`)
        .then(res => res.json())
        .then(response => {
            breweriesPage1 = response;
            resolve()
        })
        .catch(err => {
            console.error(err);
        })
    })
}

const getMoreBreweries = () => {
    return new Promise((resolve)=>{
        if (breweriesPage1.length === 50) {
            fetch(`https://api.openbrewerydb.org/breweries?by_city=${myCity}&per_page=50&page=2`)
                .then(res => res.json())
                .then(response => {
                breweriesPage2 = response;
                allBreweries = breweriesPage1.concat(breweriesPage2)
                console.log(allBreweries)
                resolve()
            })
                .catch(err => {
                console.error(err);
            });
        } else {
            allBreweries = breweriesPage1;
            resolve()
        }
    })
}

const checkForCoords = () => {
    return new Promise((resolve)=>{
        let newLat;
        let lewLong;
        for(let brewery of allBreweries) {
            if (brewery.latitude === null && brewery.street !== "") {
                let streetAdd = [];
                streetAdd = brewery.street.split(" ")
                let newStreet = streetAdd.join("+")

                getNewCoords(newStreet, brewery.city, brewery.state, brewery)
            }
        }
        console.log('*****', allBreweries)
        resolve()
    })
}


const getNewCoords = (street,city,state,brewery) => {
    fetch(`https://www.mapquestapi.com/geocoding/v1/address?key=IOGuXL0zAKHaQVwYf9qGnm4UQm9ZG7PZ&inFormat=kvp&outFormat=json&location=${street}+${city}+${state}&thumbMaps=false`)
    .then(res => res.json())
    .then(response => {
        coords = response;
        // console.log(coords.results[0].locations[0].displayLatLng)
        brewery.latitude = coords.results[0].locations[0].displayLatLng.lat
        brewery.longitude = coords.results[0].locations[0].displayLatLng.lng
        console.log(brewery)
    })
}

const updateCity = () => {
    if (allBreweries.length === 0){
        return new Promise((resolve)=>{
            
            console.log('updatecity')
            myCity = prompt("Hmm... it looks like there are no breweries in your city.", "Enter the name of a nearby city here")
            // console.log(input)
            // myCity = input.toLowerCase();
            breweriesPage1 = null;
            breweriesPage2 = null;
            allBreweries = null;
            // nearByBrews = [];
            console.log(myCity)
            resolve()
            // getCoords(myCity)
            // setTimeout(() => {
                //     checkForNear()
                // }, 2000)
            })
            .then(getBreweries)
            .then(getMoreBreweries)
            .then(getCoords);
    } else {
        return new Promise((resolve)=>{
            resolve()
        })
    }
}

const checkForNear = () => {
    return new Promise((resolve)=>{
        console.log(allBreweries)

        for (let brewery of allBreweries) {
            if (brewery.latitude !== null) {
                let diffLat = Math.abs(brewery.latitude-currentLat)
                if (diffLat <= dif) {
                    let diffLong = Math.abs(brewery.longitude-currentLong)
                    if (diffLong <= dif) {
                        nearByBrews.push(brewery)
                    }
                }
            }
        }
        resolve()
        console.log(nearByBrews)
    })
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

// getCoords()




const displayNearByBrews = () => {
    let domBrews = document.querySelector('#dom-brews');
    let listOfBrews = document.createElement('ul');
    let load = document.querySelector('#load')
    let brewItem;
    console.log(nearByBrews)
    nearByBrews.map((brew, index) => {
        console.log(brew.name, brew.street, brew.city, brew.state, brew.phone, brew.website_url)
        brewItem = document.createElement('li')
        let name = document.createElement('h2')
            name.innerHTML = brew.name
        let info = document.createElement('p');
            info.innerHTML = `
                <strong>Address:</strong> ${brew.street}, ${brew.city}, ${brew.state}<br>
                <strong>Phone:</strong> ${brew.phone}<br>
                <strong>Website:</strong> <a href ="${brew.website_url}" target="_blank">${brew.website_url.slice(11)}</a><br>
            `
        const i = document.createElement('i');
            i.classList.add("far")
            i.classList.add("fa-heart")
            i.setAttribute("onclick", "likeIt(this)")
            i.id = this.index;


        brewItem.appendChild(name)
        brewItem.appendChild(info)
        brewItem.appendChild(i)
        listOfBrews.appendChild(brewItem)
    })

    domBrews.appendChild(listOfBrews)
    load.style.display = 'none';
}


const likeIt = (elem) => {
    let index = elem.id
    if (elem.classList.contains("far")) {
        elem.classList.remove("far");
        elem.classList.add("fas");
        favoriteBrews.push(nearByBrews[index])

    } else if (elem.classList.contains("fas")) {
        elem.classList.remove("fas");
        elem.classList.add("far");
    }
    console.log(favoriteBrews)
}


getLocation()
    .then(getCity)
    .then(getBreweries)
    .then(getMoreBreweries)
    .then(checkForCoords)
    .then(updateCity)
    .then(checkForNear)
    .then(displayNearByBrews);

// console.log('All breweries: ', allBreweries)
// console.log('breweries 2: ', breweries2)



// .0144927536261881 = 1 mile

