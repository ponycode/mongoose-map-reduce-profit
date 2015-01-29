( function(){
    'use strict';
    
    var mongoose = require('mongoose');
    
    require('./TaskModel');

    mongoose.connect( "mongodb://localhost/mongoose-map-reduce-profit" );
    
})();