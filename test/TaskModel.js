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
    
    var job1 = TaskSchema.defineIncrementalMapReduceJob( "job1" );
    //job1.out = { replace: "test-results" };
    job1.out = "test-results";
    job1.verbose = true;
    
    job1.buildQuery = function( runSpec ){
        return {};
    };
    
    job1.map = function(){
        
        var MS_IN_DAY = 24*60*60*1000;
        
        var startDate = new Date( this.openedDate.getFullYear(), this.openedDate.getMonth(), this.openedDate.getDate(), 0, 0, 0, 0 );
        var endDate = new Date( this.closedDate.getFullYear(), this.closedDate.getMonth(), this.closedDate.getDate(), 0, 0, 0, 0 );
        var currentDate = startDate;
        
        while( currentDate <= endDate ){
            //console.log( "C", currentDate.getTime(), "E", endDate.getTime() );
            
            var dayString = currentDate.getFullYear() + "-" + currentDate.getMonth() + "-" + currentDate.getDate();
            if( currentDate.getTime() === endDate.getTime() ){
                emit( dayString, { open: 0, closed: 1 } );
            }else{
                emit( dayString, { open: 1, closed: 0 } );
            }
            currentDate = new Date( currentDate.getTime() + MS_IN_DAY );
        }
        
        //console.log( "\n\n" );
    };    
    
    job1.reduce = function( key, values ){
        var totals = { open: 0, closed: 0 };
        for( var n = 0; n < values.length; n++ ){
            var record = values[n];
            totals.open += record.open;
            totals.closed += record.closed;
        }
        return totals;
    };

    mongoose.model( 'Task', TaskSchema );

})();