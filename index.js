( function(){
    'use strict';
    
    var Job = require('./lib/job');
    var mapReduceSimulator = require('./lib/map-reduce-simulator');
    require('./lib/job-tracker-model');
    var mongoose = require('mongoose');
    var MapReduceJobTracker = mongoose.model('MapReduceJobTracker');

    exports.addToSchema = function( schema, options ){
        schema.plugin( MongooseMapReduceProfit, options );
    };
    
    function MongooseMapReduceProfit( schema, options ){
        
        var jobs = {};
        
        schema.defineIncrementalMapReduceJob = function( name ){
            var job = new Job( name );
            jobs[name] = job;
            return job;
        };
        
        schema.statics.performIncrementalMapReduceJob = function( name, callback ){
            var Model = this;

            var job = jobs[name];
            if( !job ) throw new Error( "No job found for name: " + name );
            job.validate();

            job.buildCommand( function( error, command ){
                if( error ) return callback( error, false );
                Model.mapReduce( command, function( error, results ){
                    if( error ) return callback( error, false );

                    MapReduceJobTracker.recordRunForJobName( job.name, function( recordError, success ){
                        callback( recordError, results );
                    });
                    
                });
            });
        };

        schema.statics.debugIncrementalMapReduceJob = function( name, callback ){
            var Model = this;
            
            var job = jobs[name];
            if( !job ) throw new Error( "No job found for name: " + name );
            job.validate();
            
            job.buildCommand( function( error, command ){
                mapReduceSimulator.simulateCommand( command, Model, function( error, result ){
                   callback( error, result ); 
                });
            });
        };
    }
    
})();