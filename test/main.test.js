( function(){
    'use strict';
    var expect = require('expect');
    require('./db');
    var mongoose = require('mongoose');
    var Task = mongoose.model( 'Task' );
    var async = require('async');
    
    describe( 'general', function(){
        
        before( function( done ){
            //Task.remove( {}, function(){
                Task.insertTaskStartingDaysAgo( 7 ).lastingForDays( 3, function( error, result1 ){
                    Task.insertTaskStartingDaysAgo( 6 ).lastingForDays( 4, function( error, result2 ){
                        Task.insertTaskStartingDaysAgo( 6 ).lastingForDays( 2, function( error, result3 ){
                            done();
                        });
                    });
                });
            //});
        });
        
        it( 'works once', function( done ) {
            Task.performIncrementalMapReduceJob( "job1", function( error, results ){
                console.log( "GOT RESULTS", results, error );
                done();
            });
        });

        it.skip( 'works many times', function( done ){

            function _insertRecordsTask( taskNumber ){
                return function( done ){
                    Task.insertTaskStartingDaysAgo( 7 ).lastingForDays( 3, function( error, result1 ){
                        Task.insertTaskStartingDaysAgo( 6 ).lastingForDays( 4, function( error, result2 ){
                            Task.insertTaskStartingDaysAgo( 6 ).lastingForDays( 2, function( error, result3 ){
                                console.log( "Inserted tasks: ", taskNumber );
                                done();
                            });
                        });
                    });
                }
            }
            
            function _task( taskNumber ){
                return function( done ){
                    Task.performIncrementalMapReduceJob( "job1", function( error, results ){
                        console.log( "GOT RESULTS", taskNumber, error );
                        done();
                    });
                };
            }
            
            var insertTasks = [];
            var tasks = [];
            
            for( var n = 0; n < 1000; n++ ){
                insertTasks.push( _insertRecordsTask( n ) );
            }
            
            for( var n = 0; n < 100; n++ ){
                tasks.push( _task( n ) );
            }
            
            async.series( insertTasks, function(){
                
                console.log( "RUNNING MAP REDUCE" );
                var start = new Date();
                async.series( tasks, function(){
                    var end = new Date();
                    
                    var diff = end - start;
                    diff = diff / 1000;
                    console.log( "TOOK", diff, "seconds" );
                    done();
                });
            });
        });
        
    });
    
})();