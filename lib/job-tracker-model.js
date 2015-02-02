( function(){
    
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var MapReduceJobTrackerSchema = new Schema({
        jobName: { type: String, unique: true },
        runDate: { type: Date }
    });

    MapReduceJobTrackerSchema.statics.runSpecForJobName = function( jobName, callback ){
        var MapReduceJobTracker = this;
        MapReduceJobTracker
            .findOne({jobName: jobName})
            .sort("-runDate")
            .exec( function( error, tracker ){
                var runSpec = {};

                if( !tracker ){
                    runSpec.incremental = false;
                    runSpec.lastRunDate = new Date();
                }else{
                    runSpec.incremental = true;
                    runSpec.lastRunDate = tracker.runDate;
                }
                
                callback( error, runSpec );
            });
    };

    MapReduceJobTrackerSchema.statics.recordRunForJobName = function( jobName, callback ) {
        var MapReduceJobTracker = this;
        
        var upsertData = {
            jobName: jobName,
            runDate: new Date()
        };
        
        MapReduceJobTracker.update({jobName: jobName}, upsertData, { upsert: true }, function( error, result ){
            callback( error, true );
        });
    };

    mongoose.model( 'MapReduceJobTracker', MapReduceJobTrackerSchema );
})();
