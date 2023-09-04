let userLocation;
let map;
window.onload = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
        });
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: -34.397, lng: 150.644 }, // Centered at some default location
        zoom: 8
    });
}


window.addEventListener("DOMContentLoaded", (event) => {
    const searchForm = document.getElementById("search-form");
    const listingsContainer = document.getElementById("listings-container");

   
    initMap();

    searchForm.addEventListener("submit", function (e) {
        e.preventDefault(); 

    
        const locationInput = document.getElementById("location").value;
        const checkInInput = document.getElementById("check-in").value;
        const checkOutInput = document.getElementById("check-out").value;
        const guestsInput = document.getElementById("guests").value;

        
        handleSearch(locationInput, checkInInput, checkOutInput, guestsInput, listingsContainer);
    });

    getUserLocation();
});

function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
        });
    }
}

async function fetchListings(location, checkIn, checkOut, guests) {
   
    const apiKey = 'a57828ea78msh732920ac55ca037p1da580jsnb99b9bc47667';
    const apiUrl = `https://airbnb13.p.rapidapi.com?location=${location}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;

    const response = await fetch(apiUrl, {
        headers: {
            'X-RapidAPI-Key': apiKey,
       
        },
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return await response.json();
}
async function handleSearch(location, checkIn, checkOut, guests, container) {
    
    try {
        const listings = await fetchListings(location, checkIn, checkOut, guests);
        const listingCards = createListingCards(listings);
        renderListingCards(container, listingCards);
    } catch (error) {
        console.error("Error:", error);
    }
}

function createListingCard(listing) {
    const listingLocation = `${listing.latitude},${listing.longitude}`;

    fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=${userLocation.lat},${userLocation.lng}&destinations=${listingLocation}&key=AIzaSyBsfTD3q835l1iyBYSQDcC3bltfuDy-9_w`)
        .then(response => response.json())
        .then(data => {
            const distance = data.rows[0].elements[0].distance.text;

            const listingCard = document.createElement("div");
            listingCard.classList.add("listing-card");

            if (listing.host.is_superhost) {
                const superhostIndicator = document.createElement("p");
                superhostIndicator.innerText = "Superhost";
                superhostIndicator.style.color = "red";
                listingCard.appendChild(superhostIndicator);
            }
            if (listing.is_rare_find) {
                const rareFindIndicator = document.createElement("p");
                rareFindIndicator.innerText = "Rare Find";
                rareFindIndicator.style.color = "green";
                listingCard.appendChild(rareFindIndicator);
            }
            const amenitiesPreview = document.createElement("p");
            amenitiesPreview.innerText = `Amenities: ${createAmenitiesPreview(listing.amenities)}`;
            listingCard.appendChild(amenitiesPreview);

            const directionsButton = document.createElement("button");
            directionsButton.innerText = "Get Directions";
            directionsButton.addEventListener("click", function () {
                openDirections(listing.location);
            });
            listingCard.appendChild(directionsButton);

            const hostDetails = document.createElement("p");
            hostDetails.innerText = `Hosted by ${createHostDetails(listing.host)}`;
            listingCard.appendChild(hostDetails);
    
            new google.maps.Marker({
                position: { lat: listing.latitude, lng: listing.longitude },
                map,
                title: listing.title
            });
            listingCard.innerHTML = `
                <img src="${listing.image}" alt="${listing.title}">
                <div class="listing-info">
                    <h2>${listing.title}</h2>
                    <p>${listing.propertyType} · ${listing.beds} beds · ${listing.bathrooms} bathrooms</p>
                    <p>Price: $${listing.price.toFixed(2)} per night</p>
                    <p>${listing.location}</p>
                    <p>Distance from you: ${distance}</p>
                    <p>Amenities: ${listing.amenities.join(", ")}</p>
                    <p>Reviews: ${listing.reviews_count} | Average Rating: ${calculateAverageRating(listing.reviews)}</p>
                    <button class="cost-button" onclick="showBookingCostBreakdown(${listing.price})">Show Booking Cost Breakdown</button>
                </div>
            `;


            return listingCard;
        });
}
function calculateAverageRating(reviews) {
    if (reviews.length === 0) {
        return "No reviews yet";
    }

    let sum = 0;
    for (let review of reviews) {
        sum += review.rating;
    }

    return (sum / reviews.length).toFixed(1);
}

function showBookingCostBreakdown(basePrice) {
    
    const additionalFees = basePrice * 0.10; 
    const totalCost = basePrice + additionalFees;

        const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button" onclick="closeModal()">&times;</span>
            <h2>Booking Cost Breakdown</h2>
            <p>Base Rate: $${basePrice.toFixed(2)}</p>
            <p>Additional Fees: $${additionalFees.toFixed(2)}</p>
            <p>Total Cost: $${totalCost.toFixed(2)}</p>
        </div>
    `;

   
    document.body.appendChild(modal);
}

function createAmenitiesPreview(amenities) {
   
    const previewAmenities = amenities.slice(0, 3);
    let previewText = previewAmenities.join(", ");

    if (amenities.length > 3) {
        const extraCount = amenities.length - 3;
        previewText += `, and ${extraCount} more`;
    }

    return previewText;
}

function createHostDetails(host) {
    

    if (host.is_superhost) {
        hostText += " (Superhost)";
    }

    return hostText;
}

function openDirections(location) {
    
    const url = `https://www.google.com/maps/dir//${location.latitude},${location.longitude}`;
    window.open(url, "_blank");
}

function closeModal() {
    const modal = document.querySelector(".modal");
    modal.parentNode.removeChild(modal);
}





