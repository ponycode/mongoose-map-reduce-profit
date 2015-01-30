( function(){
    'use strict';
    
    var vm = require('vm');
    var _ = require('lodash');
    
    exports.simulateCommand = function( command, Model, callback ){

        var query = Model.find( command.query );
        if( command.sort ) query.sort( command.sort );
        query.exec( function( error, results ){
            if( error ) return callback( error, false );

            var emittedData = exports.executeMapPhase( command, results );
            var reducedData = exports.executeReducePhase( command, emittedData );
            var finalizedData = ( command.finalize ) ? exports.executeFinalizePhase( command, reducedData ) : reducedData;
            
            callback( false, finalizedData );
        });
    };
    
    exports.executeFinalizePhase = function( command, reducedData ){
        var finalizedData = {};

        var sandbox = exports.buildDefaultSandboxWrapper();
        sandbox.finalizedData = finalizedData;
        sandbox.reducedData = reducedData;

        function runner(){
            console.log( "STARTING FINALIZE SIMULATION" );
            for( var key in reducedData ){
                if( !reducedData.hasOwnProperty(key) ) continue;
                finalizedData[key] = finalize( key, reducedData[key] );
            }
        }

        var code = "";
        code += "var finalize = " + command.finalize.toString() + ";";
        code += "var runner = " + runner.toString() + "; runner();"

        vm.runInNewContext( code, sandbox, "finalizeSimulator.vm" );

        return finalizedData;
    };
    
    exports.executeReducePhase = function( command, emittedData ){
        var reducedData = {};
        
        var sandbox = exports.buildDefaultSandboxWrapper();
        sandbox.emittedData = emittedData;
        sandbox.reducedData = reducedData;
        
        function runner(){
            console.log( "STARTING REDUCE SIMULATION" );
            for( var key in emittedData ){
                if( !emittedData.hasOwnProperty(key) ) continue;
                reducedData[key] = reduce( key, emittedData[key] );
            }
        }
        
        var code = "";
        code += "var reduce = " + command.reduce.toString() + ";";
        code += "var runner = " + runner.toString() + "; runner();"

        vm.runInNewContext( code, sandbox, "reduceSimulator.vm" );

        return reducedData;
    };
    
    exports.executeMapPhase = function( command, records ){
        
        var sandbox = exports.buildDefaultSandboxWrapper();
        sandbox.records = records;
        
        function runner(){
            console.log( "STARTING MAP SIMULATION: ", records.length );
            for( var n = 0; n < records.length; n++ ){
                map.call( records[n] );
            }
        }

        var code = "";
        code += "var map = " + command.map.toString() + ";";
        code += "var runner = " + runner.toString() + "; runner();"

        vm.runInNewContext( code, sandbox, "mapSimulator.vm" );
        
        return sandbox.emittedData;
    }
    
    exports.buildDefaultSandboxWrapper = function(){
        var emittedData = {};
        
        var sandbox = {};
        sandbox.emittedData = {};
        sandbox.console = console;
        sandbox.emittedData = emittedData;
       
        sandbox.emit = function( key, value ){
            console.log( 'emit: ', key, value );
            if( emittedData[key] === undefined ) {
                emittedData[key] = [value];
            }else{
                emittedData[key].push( value );
            }
        };

        
        return sandbox;
    };

    
})();