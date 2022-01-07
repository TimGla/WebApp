import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, startAfter, limit, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
// alphabay522szl32u4ci5e3iokdsyth56ei7rwngr2wm7i5jo54j2eid.onion
// http://whilgmoqcvjwefe6ubspypiusclukp5dhanl7b7hlz3g6st75r4jvzqd.onion/
const firebaseConfig = {
  apiKey: "AIzaSyC_eW7eTE1AHliZ77omfFV2W4hkfRdezw4",
  authDomain: "secretplaces-a21bf.firebaseapp.com",
  projectId: "secretplaces-a21bf",
  storageBucket: "secretplaces-a21bf.appspot.com",
  messagingSenderId: "64277054545",
  appId: "1:64277054545:web:0a4aa086f9bdc39d42a470",
  measurementId: "G-2N96DF4DCX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();

async function addNewPlaceToDatabase() {
    const inputTitle = document.getElementById('titleInput').value;
    const inputPosition = {
        latitude: document.getElementById('latitudeInput').value,
        longitude: document.getElementById('longitudeInput').value
    };
    const inputLocation = {
        city: document.getElementById('cityInput').value,
        country: document.getElementById('countryInput').value
    };
    const inputDescription = document.getElementById('descriptionInput').value;
    try {
        await addDoc(collection(db, "places"), {
            title: inputTitle,
            position: inputPosition,
            location: inputLocation,
            description: inputDescription
        });
        document.getElementById('addPlacePopup').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
        // Reset
        document.getElementById('titleInput').value = "";
        document.getElementById('latitudeInput').value = "";
        document.getElementById('longitudeInput').value = "";
        document.getElementById('cityInput').value = "";
        document.getElementById('countryInput').value = "";
        document.getElementById('descriptionInput').value = "";
    } catch(e) {
        alert('An error occured. Please try again later');
        document.getElementById('addPlacePopup').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }
}

let lastFetched = null;

async function fetchPlaces() {
    const batch = query(collection(db, "places"), orderBy("position.latitude"), limit(10));
    const docSnaps = await getDocs(batch);
    lastFetched = docSnaps.docs[docSnaps.docs.length - 1];
    await drawPlaces(docSnaps);

}

async function drawPlaces(docSnaps) {
    const placesContainer = document.getElementById('placesContainer');
    docSnaps.forEach((doc) => {
        const data = doc.data();
        const content = 
        "<div id='placeBox" + doc.id + "'" + "class='grid-item'>" +
            "<p class='fw-bold h4 m-2'>" + data.title + "</p>" +
            "<hr class='line'>" +
            "<p class='fw-bold m-2'>" + "Location: " + data.location.city + ", " + data.location.country + "</p>" +
            "<hr class='line'>" +
            "<p class='m-2'>" + data.description + "</p>" +
        "</div>";
        $('.grid').append(content);
    });

    $('body').append("<script class='masonry' src='https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js'></script>")
}

$(window).scroll(async function() {   
    if($(window).scrollTop() + $(window).height() == $(document).height()) {
        if (lastFetched != null) {
            const batch = query(collection(db, "places"), orderBy("position.latitude"), startAfter(lastFetched), limit(10));
            const docSnaps = await getDocs(batch);
            lastFetched = docSnaps.docs[docSnaps.docs.length - 1];
            if (docSnaps.docs.length < 10) {
                lastFetched = null;
            }
            await drawPlaces(docSnaps);
        }
    }
 });

document.getElementById('submitButton').addEventListener('click', addNewPlaceToDatabase);
document.addEventListener("DOMContentLoaded", fetchPlaces);