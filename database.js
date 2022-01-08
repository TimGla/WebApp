import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { where, getFirestore, collection, addDoc, query, orderBy, startAfter, limit, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
    if ($(".mansory").length) {
        $(".mansory").remove();
    }
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

    $('body').append("<script class='mansory' src='https://unpkg.com/masonry-layout@4/dist/masonry.pkgd.min.js'></script>")
}

let lastCitySearchFetch;
let lastTitleSearchFetch;
let searchMode = false;
let searchItem;

async function search() {
    searchMode = true;
    searchItem = document.getElementById('search').value;
    const cityQuery = query(collection(db, "places"), where("location.city", "==", searchItem), orderBy("position.latitude"), limit(10));
    const titleQuery = query(collection(db, "places"), where("title", "==", searchItem), orderBy("position.latitude"), limit(10));

    const citySnaps = await getDocs(cityQuery);
    const titleSnaps = await getDocs(titleQuery);
    lastCitySearchFetch = (citySnaps.docs.length >= 10) ? citySnaps.docs[citySnaps.docs.length - 1] : null;
    lastTitleSearchFetch = (titleSnaps.docs.length >= 10) ? titleSnaps.docs[titleSnaps.docs.length - 1] : null;
    $(".grid").empty();
    if (citySnaps.docs.length === 0 && titleSnaps.docs.length === 0) {
        $('#placesContainer').append("<div class='d-flex justify-content-center m-4 fw-bold opacity-50'>Sorry, no results found :(</div>");
        return
    }
    drawPlaces(citySnaps);
    drawPlaces(titleSnaps);

}

$(window).scroll(async function() {   
    if($(window).scrollTop() + $(window).height() == $(document).height()) {
        if(!searchMode) {
            if (lastFetched != null) {
                const batch = query(collection(db, "places"), orderBy("position.latitude"), startAfter(lastFetched), limit(10));
                const docSnaps = await getDocs(batch);
                lastFetched = (docSnaps.docs.length >= 10) ? docSnaps.docs[docSnaps.docs.length - 1] : null;
                await drawPlaces(docSnaps);
            }
        } else {
            if (lastCitySearchFetch != null) {
                const batch = query(collection(db, "places"), orderBy("position.latitude"), startAfter(lastCitySearchFetch), limit(10));
                const docSnaps = await getDocs(batch);
                lastCitySearchFetch = (docSnaps.docs.length >= 10) ? docSnaps.docs[docSnaps.docs.length - 1] : null;
                await drawPlaces(docSnaps);
            } else if (lastTitleSearchFetch != null) {
                const batch = query(collection(db, "places"), orderBy("position.latitude"), startAfter(lastTitleSearchFetch), limit(10));
                const docSnaps = await getDocs(batch);
                lastTitleSearchFetch = (docSnaps.docs.length >= 10) ? docSnaps.docs[docSnaps.docs.length - 1] : null;
                await drawPlaces(docSnaps);
            }
        }
    }
 });

 $(document).on('click','.grid-item', async (e) => {
    const preId = ($(e.target).is("div")) ? e.target.id : $(e.target).parent()[0].id; 
    const id = preId.substring(8);
    const docRef = doc(db, "places", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        localStorage.setItem("position", JSON.stringify(data.position));
        alert(data.position.latitude);
        window.location.href = "/navigation/navigation.html";
    } else {
        alert('Something went wrong. Please try again later')
    }
 });

 $("#logo").on('click', () => {
     searchMode = false;
     $(".grid").empty();
     fetchPlaces();
 });

document.getElementById('search').addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        search();
    }
});
document.getElementById('submitButton').addEventListener('click', addNewPlaceToDatabase);
document.addEventListener("DOMContentLoaded", fetchPlaces);