import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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
        const dbRef = await addDoc(collection(db, "places"), {
            title: inputTitle,
            position: inputPosition,
            location: inputLocation,
            description: inputDescription
        });
        document.getElementById('addPlacePopup').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    } catch(e) {
        alert('An error occured. Please try again later');
        document.getElementById('addPlacePopup').classList.remove('active');
        document.getElementById('overlay').classList.remove('active');
    }
}

document.getElementById('submitButton').addEventListener('click', addNewPlaceToDatabase);



