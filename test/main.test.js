( function(){
    'use strict';
    var expect = require('expect');
    require('./db');
    var mongoose = require('mongoose');
    var Task = mongoose.model( 'Task' );
    
    describe( 'general', function(){
        
        before( function( done ){
            Task.remove( {}, function(){
                Task.insertTaskStartingDaysAgo( 7 ).lastingForDays( 3, function( error, result1 ){
                    Task.insertTaskStartingDaysAgo( 6 ).lastingForDays( 4, function( error, result2 ){
                        Task.insertTaskStartingDaysAgo( 6 ).lastingForDays( 2, function( error, result3 ){
                            done();
                        });
                    });
                });
            });
        });
        
        it( 'more general', function( done ){
            Task.debugIncrementalMapReduceJob( "job1", function( error, result ){
                console.log( "GOT RESULTS", result );
                done();
            });
        });
        
    });
    
})();