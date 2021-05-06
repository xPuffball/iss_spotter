const request = require("request");

const fetchMyIP = function(callback) { 
  request("https://freegeoip.app/json/", (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    body = JSON.parse(body)
    callback(null, body['ip'])
  })
}

const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
  
    body = JSON.parse(body)
    console.log(body)
    callback(null, {"latitude": body['latitude'], "longitude": body['longitude']});
  })
}

const fetchISSFlyOverTimes = function(coords, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords['latitude']}&lon=${coords['longitude']}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching ISS pass times: ${body}`), null);
      return;
    }
    body = JSON.parse(body);
    callback(null, body['response'])
  })
};

const nextISSTimesForMyLocation = function (callback) {

  fetchMyIP((error, ip) => {
    if (error) {
      console.log("It didn't work!" , error);
      return;
    }
    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        console.log("It didn't work!" , error);
        return;
      }
      fetchISSFlyOverTimes(coords, (error, times) => {
        if (error) {
          console.log("It didn't work!" , error);
          return;
        }
        callback(null, times)
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };