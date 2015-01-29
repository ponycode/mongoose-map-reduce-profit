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
            
            callback( false, emittedData );
            
        });
    };
    
    exports.executeMapPhase = function( command, results ){
        var sandbox = {};
        sandbox.emittedData = {};
        sandbox.records = results;
        sandbox.console = console;

        var emittedData = {};

        function _emit( key, value ){
            console.log( 'emit: ', key, value );
            if( emittedData[key] === undefined ) {
                emittedData[key] = [value];
            }else{
                emittedData[key].push( value );
            }
        }
        sandbox.emit = _emit;


        function runner( results ){
            console.log( "STARTING MAP REDUCE SIMULATION: ", records.length );
            for( var n = 0; n < records.length; n++ ){
                map.call( records[n] );
            }
        }

        var code = "";
        code += "var map = " + command.map.toString() + ";";
        code += "var reduce = " + command.reduce.toString() + ";";
        if( command.finalize ) code += "var finalize = " + command.finalize.toString() + ";";
        code += "var runner = " + runner.toString() + "; runner();"

        vm.runInNewContext( code, sandbox, "mapReduceSimulator.vm" );
        
        return emittedData;
    }
    

    
})();