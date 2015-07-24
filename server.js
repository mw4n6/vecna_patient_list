//server.js

  /*  Set up  */
  console.log("Starting!");
  var express  = require('express');
  var app      = express();
  var mongoose = require('mongoose'); 
  var morgan = require('morgan');
  var bodyParser = require('body-parser');
  var methodOverride = require('method-override');
  
  /*  configuration */
  
  mongoose.connect('mongodb://admin:admin@ds037622.mongolab.com:37622/mw_test_2');
  app.use(express.static(__dirname + '/public'));
  app.use(morgan('dev')); 
  app.use(bodyParser.urlencoded({'extended':'true'}));
  app.use(bodyParser.json());
  app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
  app.use(methodOverride());
  
  /*  define model  */
  
  var Patient = mongoose.model('patient', {
    name  : {
      firstName : String,
      lastName  : String
    },
    ssn  : String,
    address : {
      street  : String,
      city    : String,
      state   : String,
      zip     : String
    },
    primaryPhone  : String,
    workPhone     : String,
    birthDate     : String
  });
  
  /* routes */
  
  //modify a patient
  app.post('/api/save_patient', function(req, res){
    console.log(req.body);
    var newPatient = req.body.patient;
    var id = newPatient._id;
    console.log(id);
    
    Patient.findById(id, function(err, patient){
      if(err) res.send(err);
      
      for (var attrname in newPatient) { patient[attrname] = newPatient[attrname]; }
      
      // console.log(patient);
      patient.save(function(err){
        if(err) res.send(err);
        
        Patient
        .find(function(err, patients){
          if (err)  res.send(err);
      
          res.json(patients);
        });
      });
    });
  });
  
  //get all patients
  app.get('/api/patients', function(req, res){
    Patient.find(function(err, patients){
      if (err)  res.send(err);
      
      res.json(patients);
    });
  });
  
  /*  application  */
  
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html');
  });
  
  /*  listen  */
  app.listen(process.env.PORT)
  app.listen(8080);
  console.log("patient list app listening on port 8080");