( function(){
    'use strict';
    
    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;
    var moment = require('moment');
    var mapReduceProfit = require('../index');

    var TaskSchema = new Schema({
        openedDate: { type: Date },
        closedDate: { type: Date }
    });
    mapReduceProfit.addToSchema( TaskSchema );
    
    TaskSchema.statics.insertTaskStartingDaysAgo = function( daysAgo ){
        var Task = this;
        
        return {
            "lastingForDays": function( duration, callback ){
                var task = new Task();
                task.openedDate = moment().subtract( daysAgo, 'days' ).toDate();
                task.closedDate = moment( task.openedDate).add( duration, 'days').toDate();
                task.save( callback );
            }
        };
    };
    
    var job1 = TaskSchema.defineJob( "job1" );
    
    job1.buildQuery = function( runSpec ){
        return {};
    };
    
    job1.map = function(){
        emit( 'one', 1 );
    };    
    
    job1.reduce = function( key, values ){
        return values.length;
    };
    
    mongoose.model( 'Task', TaskSchema );

})();