  const circle = document.querySelector(".circle");
  const startBtn = document.querySelector("#searchButton");

  let pointDegree;
  let distance; // In metres
  let point;

  function init() {
    startBtn.addEventListener("click", startSearch);
    point = JSON.parse(localStorage.getItem("position"));
  }

  function startSearch() {
    $('#searchButton').hide();
    $('#distance').addClass('m-5');
    
    try {
      DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handler, true);
        } else {
          alert("Sensors must be allowed");
          window.location.href = "../";
        }
       }).catch(() => {
        alert("not supported");
        window.location.href = "../";
       });
    } catch (error) {
      alert('Soemthing went wrong. Please try again later');
      window.location.href = "../";
    }

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(locationHandler, (error) => {
        if (error.code === 1) {
          alert("Sensors must be allowed");
          window.location.href = "../";
        }
      });
    } else {
      alert('Geolocation is not supported by this browser');
      window.location.href = "../";
    }
  }

  function handler(e) {
    compass = e.webkitCompassHeading || Math.abs(e.alpha - 360);
    circle.style.transform = `translate(-50%, -50%) rotate(${pointDegree - compass - 7}deg)`;

    const diff = ( compass - pointDegree + 180 + 7 ) % 360 - 180;
    const angleDiff = Math.round(Math.abs((diff < -180) ? diff + 360 : diff));
    if (angleDiff < 40) {
      document.getElementById('container').style.boxShadow = "0 0 30px rgb(5, 235, 43)";
    } else if (angleDiff < 100) {
      document.getElementById('container').style.boxShadow = "0 0 30px rgb(235, 235, 5)";
    } else {
      document.getElementById('container').style.boxShadow = "0 0 30px rgb(255, 59, 59)";
    }
  }

  function locationHandler(position) {
    const { latitude, longitude } = position.coords;
    pointDegree = calcDegreeToPoint(latitude, longitude);
    distance = calcDistanceToPoint(latitude, longitude);

    if (distance > 1000) {
      document.getElementById('distance').innerHTML = (Math.floor(distance / 1000)) + ',' + (Math.floor(distance / 100) - Math.floor(distance / 1000)*10) + 'km';
    } else {
      document.getElementById('distance').innerHTML = distance + 'm';
    }
    if (pointDegree < 0) {
      pointDegree = pointDegree + 360;
    }
  }

  function calcDegreeToPoint(latitude, longitude) {
    const phiK = (point.latitude * Math.PI) / 180.0;
    const lambdaK = (point.longitude * Math.PI) / 180.0;
    const phi = (latitude * Math.PI) / 180.0;
    const lambda = (longitude * Math.PI) / 180.0;
    const psi =
      (180.0 / Math.PI) *
      Math.atan2(
        Math.sin(lambdaK - lambda),
        Math.cos(phi) * Math.tan(phiK) -
          Math.sin(phi) * Math.cos(lambdaK - lambda)
      );
    return Math.round(psi);
  }

  function calcDistanceToPoint(latitude, longitude) {
    const r = 6371 * 1000;
    const psi1 = point.latitude * Math.PI / 180.0;
    const psi2 = latitude * Math.PI / 180.0;
    const deltaPsi = (latitude - point.latitude) * Math.PI / 180.0;
    const deltaLambda = (longitude - point.longitude) * Math.PI / 180.0;

    const a = Math.sin(deltaPsi/2) * Math.sin(deltaPsi/2) + Math.cos(psi1) * Math.cos(psi2) * Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(r * c);
  }

  document.addEventListener("DOMContentLoaded", init);