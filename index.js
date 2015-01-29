( function(){
    'use strict';
    
    var Job = require('./lib/job' +
    var mapReduceSimulator = require('./');
    
    exports.addToSchema = function( schema, options ){
        schema.plugin( MongooseMapReduceProfit, options );
    };
    
    function MongooseMapReduceProfit( schema, options ){
        
        var jobs = {};
        
        schema.defineJob = function( name ){
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
                    callback( false, results );
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