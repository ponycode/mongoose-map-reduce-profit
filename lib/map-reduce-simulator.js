( function(){
    'use strict';
    
    var vm = require('vm');
    
    exports.simulateCommand = function( command, Model, callback ){

        var query = Model.find( command.query );
        if( command.sort ) query.sort( command.sort );
        query.exec( function( error, results ){
            if( error ) return callback( error, false );
            
            var sandbox = {};
            sandbox.emittedData = {};
            sandbox.results = [];

            function runner( results ){
                for( var n = 0; n < results.length; n++ ){
                    map.call( results[n] );
                }
            }
            
            var code = "";
            code += "var map = " + command.map.toString() + ";";
            code += "var reduce = " + command.reduce.toString() + ";";
            if( command.finalize ) code += "var finalize = " + command.finalize.toString() + ";";
            code += "var runner = " + runner.toString() + "; runner();"

            vm.runInContext( code, sandbox, "mapReduceSimulator.vm" );

            callback( sandbox.emittedData );
            
        });
    };
    
})();