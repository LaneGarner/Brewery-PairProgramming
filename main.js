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
        brewery.latitude = coords.results[0].locations[0].displayLatLng.lat
        brewery.longitude = coords.results[0].locations[0].displayLatLng.lng
        console.log(brewery)
    })
}

const updateCity = () => {
    if (allBreweries.length === 0){
        return new Promise((resolve)=>{
            alert("Hmm... no breweries were found in your city. Try searching the name of a nearby city.")
            document.querySelector('#yourCity').innerHTML = '';
        //     myCity = prompt("Hmm... no breweries were found in your city", "Enter the name of a nearby city here")
        //     breweriesPage1 = null;
        //     breweriesPage2 = null;
        //     allBreweries = null;
        //     console.log(myCity)
        //     resolve()
        })  
        // .then(getBreweries)
        // .then(getMoreBreweries)
        // .then(getCoords);
    } else {
        return new Promise((resolve)=>{
            resolve()
        })
    }
}

// const checkForNear = () => {
//     return new Promise((resolve)=>{
//         console.log(allBreweries)

//         for (let brewery of allBreweries) {
//             if (brewery.latitude !== null) {
//                 let diffLat = Math.abs(brewery.latitude-currentLat)
//                 if (diffLat <= dif) {
//                     let diffLong = Math.abs(brewery.longitude-currentLong)
//                     if (diffLong <= dif) {
//                         nearByBrews.push(brewery)
//                     }
//                 }
//             }
//         }
//         resolve()
//         console.log(nearByBrews)
//     })
// }
 


// const getCoords = () => {
//     fetch("https://www.mapquestapi.com/geocoding/v1/address?key=IOGuXL0zAKHaQVwYf9qGnm4UQm9ZG7PZ&inFormat=kvp&outFormat=json&location=4602+Weletka+Dr+austin+tx&thumbMaps=false")
//     .then(res => res.json())
//     .then(response => {
//         coords = response;
//         console.log(coords.results[0].locations[0].displayLatLng)
//     })
// }



const randomBeerPic = () => {
    const beerPics =['photos/beer01.jpg', 'photos/beer02.jpg', 'photos/beer03.jpg', 'photos/beer04.jpg', 'photos/beer05.jpg', 'photos/beer06.jpg', 'photos/beer07.jpg', 'photos/beer08.jpg', 'photos/beer09.jpg', 'photos/beer10.jpg', 'photos/beer11.jpg', 'photos/beer12.jpg', 'photos/beer13.jpg', 'photos/beer14.jpg', 'photos/beer15.jpg']
    let randomBeer = beerPics[Math.floor(Math.random() * beerPics.length)]
    return randomBeer
}

const displayBrews = () => {
    nearByBrews = allBreweries;
    let domBrews = document.querySelector('#dom-brews');
    let listOfBrews = document.createElement('ul');
    
    let load = document.querySelector('#load');
        load.style.display = 'none';

    let yourCity = document.querySelector('#yourCity');
        yourCity.innerHTML = `
            Showing results for ${myCity}<br>
            ${allBreweries.length} breweries found
        `
    // let cityInfo = document.createElement('p');
    //     cityInfo.innerHTML = `Showing results for ${myCity}`
    // yourCity.appendChild(cityInfo);

    let citySearch = document.querySelector('#citySearch');
    citySearch.style.display = "flex";


    let brewItem;
    console.log(nearByBrews)
    nearByBrews.map((brew, index) => {
        console.log(brew.name, brew.street, brew.city, brew.state, brew.phone, brew.website_url)
        brewItem = document.createElement('li');
        let name = document.createElement('h2');
            name.innerHTML = brew.name;
        let image = document.createElement('img');
            image.src = `${randomBeerPic()}`;
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

        brewItem.appendChild(image)
        brewItem.appendChild(name)
        brewItem.appendChild(info)
        brewItem.appendChild(i)
        listOfBrews.appendChild(brewItem)
    })

    domBrews.appendChild(listOfBrews)
}

getLocation()
    .then(getCity)
    .then(getBreweries)
    .then(getMoreBreweries)
    .then(checkForCoords)
    .then(updateCity)
    // .then(checkForNear)
    .then(displayBrews);


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





const newCity = () => {
    document.querySelector('#dom-brews').innerHTML = '';
    myCity = document.querySelector('#search-city').value;
    return new Promise((resolve)=>{
        resolve()
    })
    .then(getBreweries)
    .then(getMoreBreweries)
    .then(checkForCoords)
    .then(updateCity)
    // .then(checkForNear)
    .then(displayBrews);
}

// console.log('All breweries: ', allBreweries)
// console.log('breweries 2: ', breweries2)



// .0144927536261881 = 1 mile

