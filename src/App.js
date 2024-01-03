import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import axios from "axios";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};
const center = {
  lat: 19.441261067653702, // default latitude
  lng: -70.68447494396473, // default longitude
};

const App = () => {
  const [rutas, setRutas] = useState();
  const [lat, setLat] = useState(19.441907556432835);
  const [lgn, setLgn] = useState(-70.6815231746255);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyARFCccvBa5znIAbFaMotUz6MfPh_doCrg",
    libraries,
  });

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setLat(latitude);
            setLgn(longitude);
          },
          (error) => {
            console.error("Error getting location:", error.message);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    axios
      .get(`http://maptest.ddns.net:3001/api/maps/rutax`)
      .then((res) => {
        console.log(res.data[0].colorRutas);
        setRutas(res.data);
      })
      .catch((error) => {
        console.log(error);
      });

    getLocation();
  }, []);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }
  return (
    <div>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={18}
        center={center}
      >
        <Marker position={{ lat: lat, lng: lgn }} />
        <Polyline
          path={rutas && rutas[0].coordinates}
          strokeColor="#0FC72E"
          strokeOpacity={0.8}
          strokeWeight={2}
        />

        <Polyline
          path={rutas && rutas[1].coordinates}
          strokeColor={rutas && rutas[1].colorRutas}
          strokeOpacity={0.8}
          strokeWeight={2}
        />
      </GoogleMap>
    </div>
  );
};

export default App;
