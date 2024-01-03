import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import axios from "axios";
import mqtt from "mqtt";

const libraries = ["places"];
const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};
const center = {
  lat: 19.441261067653702, // default latitude
  lng: -70.68447494396473, // default longitude
};

const protocol = "ws";
const host = "maptest.ddns.net";
const port = "8083";
const path = "/mqtt";
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const topic = "mqtt/map";

const connectUrl = `${protocol}://${host}:${port}${path}`;

const App = () => {
  let mytrucks = [];
  const [trucks, setTrucks] = useState([]);
  const [rutas, setRutas] = useState();
  const [client, setClient] = useState(null);
  const [lat, setLat] = useState(19.441907556432835);
  const [lgn, setLgn] = useState(-70.6815231746255);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyARFCccvBa5znIAbFaMotUz6MfPh_doCrg",
    libraries,
  });

  const mqttConnect = () => {
    setClient(
      mqtt.connect(connectUrl, {
        clientId,
        clean: true,
        connectTimeout: 4000,
        username: "emqx",
        password: "public",
        reconnectPeriod: 1000,
      })
    );
  };

  const showTrucks = () => {
    console.log(trucks)
    return trucks.map((item, index) => {
      return (
        <Marker
          key={index}
          position={{
            lat: item.position.latitude,
            lng: item.position.longitude,
          }}
        />

      );
    });
  };

  useEffect(() => {
    mqttConnect();
  }, []);

  useEffect(() => {
    if (client) {
      client.on("connect", (error) => {
        if (error) {
          console.log(error);
        }

        client.subscribe([topic], () => {
          console.log(`Subscribe to topic '${topic}'`);
        });
      });
      client.on("error", (err) => {
        console.error("Connection error: ", err);
        client.end();
      });
      client.on("reconnect", () => {});

      client.on("message", (topic, message) => {
        console.log(message.toString())
        mytrucks.push(JSON.parse(message.toString()));
        setTrucks(mytrucks);
      });
    }

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
  }, [client, trucks]);

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

        {trucks && showTrucks()}

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
