var express = require('express');
var fs = require('fs');
var cors = require('cors');
var http = require('http');
var request = require('request');
var url = require('url');

//Mongo DB
const mongoose = require("mongoose");
const db = mongoose.connection;

const {
  MONGO_URL,
  MONGO_DATABASE,
  MONGO_USERNAME,
  MONGO_PASSWORD
}  = process.env;



const config = require('../config');

var open = require('open');

var RestaurantRecord = require('./model').Restaurant;
var MemoryStorage = require('./storage').Memory;

var API_URL = '/api/restaurant';
var API_URL_ID = API_URL + '/:id';
var API_URL_ORDER = '/api/order';


//API Call to fetch Menu Items
var API_MENU_ITEMS = '/api/fetchMenuItems';


//API Call to fetch More Info
var API_MORE_INFO = '/api/fetchMoreInfo';

// var siteHost;


var removeMenuItems = function(restaurant) {
  var clone = {};

  Object.getOwnPropertyNames(restaurant).forEach(function(key) {
    if (key !== 'menuItems') {
      clone[key] = restaurant[key];
    }
  });

  return clone;
};


//Mongoose local DB connection
// mongoose.connect('mongodb://localhost:27017/foodappmoreinfo', { useNewUrlParser: true }).then(
//     () => {
//         console.log('Database is connected'); 
//     },
//     err => { console.log('Can not connect to the database'+ err)}
//   );


//Mongoose main for DB connection (pod)
mongoose.connect('mongodb://'+MONGO_URL+'/'+MONGO_DATABASE, 
{ 
  useNewUrlParser: true,
  auth: {
    user: MONGO_USERNAME,
    password: MONGO_PASSWORD
   } 
}
).then(() => {
    console.log("DB connected");
}).catch((err)=> {
    console.log('Can not connect to the database'+err)
})




  db.once("open", function() {

    db.collection('inventory').count(function (err, count) {
        if (err) throw err;    
        console.log('Total moreinfo Rows: ' + count);
    });

    db.collection('menuitems').count(function (err, count) {
      if (err) throw err;    
      console.log('Total menuitems Rows: ' + count);
  });


  }); 


exports.start = function(PORT, STATIC_DIR, DATA_FILE, TEST_DIR) {
  var app = express();
  var storage = new MemoryStorage();

  // log requests
  app.use(express.logger('dev'));

  // serve static files for demo client
  app.use(express.static(STATIC_DIR));

  // parse body into req.body
  app.use(express.bodyParser());


// API Call to fetch menu items
app.get(API_MENU_ITEMS, function (req, res) {

  db.collection('menuitems').find().toArray()
      .then(result => {
        console.log(result);
        res.send(result);
      })
      .catch(error => console.error(error))


  /* Old code to fetch data through API Service */
  // siteHost_m_items = req.get('host');
  // console.log('Host for menuitems is '+siteHost_m_items);

  // if(siteHost_m_items.includes(':')){

  //   var splitPath_m_items = siteHost_m_items.split(":");
  //   var splitHost_m_items = splitPath_m_items[0];
  //   var splitPort_m_items = splitPath_m_items[1];
  //   console.log('splitHost menuitems :'+splitHost_m_items);
  //   console.log('splitPort menuitems:'+splitPort_m_items);


  //     request('http://'+splitHost_m_items+':'+config.items.port+'/api/menuitems', (error, response, body) => {
    
  //       if (!error && response.statusCode == 200) {
    
  //           result = JSON.stringify(JSON.parse(body));
  //           res.send(result);
  //       } else {
  //          res.send(error);
  //       }
  //   });

  // }else{

  //   request('http://'+siteHost_m_items+':'+config.items.port+'/api/menuitems', (error, response, body) => {
    
  //     if (!error && response.statusCode == 200) {
  
  //         result = JSON.stringify(JSON.parse(body));
  //         res.send(result);
  //     } else {
  //        res.send(error);
  //     }
  // });

  // }



});   





//Code snippet to allow CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// API Call to fetch more info
app.get(API_MORE_INFO, function (req, res) {

  db.collection('inventory').find().toArray()
      .then(result => {
        console.log(result);
        res.send(result);
      })
      .catch(error => console.error(error))


  //---***Old Code for API***
  // var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  // siteHost_m_info = req.get('host');
  // var protocol = req.protocol;
  // var originalLink = req.originalUrl;

  // console.log('Host for moreinfo is '+siteHost_m_info);

  // if(siteHost_m_info.includes(':')){
  //   var splitPath_m_info = siteHost_m_info.split(":");
  //   var splitHost_m_info = splitPath_m_info[0];
  //   var splitPort_m_info = splitPath_m_info[1];
  //   console.log('splitHost moreinfo :'+splitHost_m_info);
  //   console.log('splitPort moreinfo :'+splitPort_m_info);

  //     request('http://'+splitHost_m_info+':'+config.info.port+'/api/moreinfo', (error, response, body) => {
    
  //       if (!error && response.statusCode == 200) {
    
  //           result = JSON.stringify(JSON.parse(body));
  //           res.send(result);
    
  //       } else {
  //          res.send(error); 
  //       }
  //   });

  // }else{

  //   request('http://'+siteHost_m_info+':'+config.info.port+'/api/moreinfo', (error, response, body) => {
    
  //     if (!error && response.statusCode == 200) {
  
  //         result = JSON.stringify(JSON.parse(body));
  //         res.send(result);
  
  //     } else {
  //        res.send(error); 
  //     }
  // });

  // }




});




  // API
  app.get(API_URL, function(req, res, next) {
    res.send(200, storage.getAll().map(removeMenuItems));
  });




  app.post(API_URL, function(req, res, next) {
    var restaurant = new RestaurantRecord(req.body);
    var errors = [];

    if (restaurant.validate(errors)) {
      storage.add(restaurant);
      return res.send(201, restaurant);
    }

    return res.send(400, {error: errors});
  });

  app.post(API_URL_ORDER, function(req, res, next) {
    // console.log(req.body)
    return res.send(201, { orderId: Date.now()});
  });


  app.get(API_URL_ID, function(req, res, next) {
    var restaurant = storage.getById(req.params.id);

    if (restaurant) {
      return res.send(200, restaurant);
    }

    return res.send(400, {error: 'No restaurant with id "' + req.params.id + '"!'});
  });


  app.put(API_URL_ID, function(req, res, next) {
    var restaurant = storage.getById(req.params.id);
    var errors = [];

    if (restaurant) {
      restaurant.update(req.body);
      return res.send(200, restaurant);
    }

    restaurant = new RestaurantRecord(req.body);
    if (restaurant.validate(errors)) {
      storage.add(restaurant);
      return res.send(201, restaurant);
    }

    return res.send(400, {error: errors});
  });


  app.del(API_URL_ID, function(req, res, next) {
    if (storage.deleteById(req.params.id)) {
      return res.send(204, null);
    }

    return res.send(400, {error: 'No restaurant with id "' + req.params.id + '"!'});
  });


  // only for running e2e tests
  app.use('/test/', express.static(TEST_DIR));


  // start the server
  // read the data from json and start the server
  fs.readFile(DATA_FILE, function(err, data) {
    JSON.parse(data).forEach(function(restaurant) {
      storage.add(new RestaurantRecord(restaurant));
    });

    app.listen(PORT, function(req) {
      open('http://localhost:' + PORT + '/');
      console.log('Go to http://localhost:' + PORT + '/');
    });
  });

  // console.log('New Url is '+newUrl);


  

  // Windows and Node.js before 0.8.9 would crash
  // https://github.com/joyent/node/issues/1553
  try {
    process.on('SIGINT', function() {
      // save the storage back to the json file
      fs.writeFile(DATA_FILE, JSON.stringify(storage.getAll()), function() {
        process.exit(0);
      });
    });
  } catch (e) {}

};
