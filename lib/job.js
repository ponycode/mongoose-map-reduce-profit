( function(){
    
    var mongoose = require('mongoose');
    
    function Job( name ){
        this.name = name;
        this.buildQuery = false;
        this.sort = false;
        this.map = false;
        this.reduce = false;
        this.finalize = false;
        this.out = false;
        this.limit = false;
        this.scope = false;
        this.verbose = false;
    }
    
    Job.prototype.validate = function(){
        if( !this.name ) throw new Error( "job.name is required" );
        if( !this.buildQuery ) throw new Error( "job.buildQuery( runSpec ) is required" );
        if( !this.map ) throw new Error( "job.map is required" );
        if( !this.reduce ) throw new Error( "job.reduce is required" );
    };

    Job.prototype.buildCommand = function( callback ){
        var self = this;
        var MapReduceJobTracker = mongoose.model('MapReduceJobTracker');
        MapReduceJobTracker.runSpecForJobName( self.name, function( error, runSpec ){
            if( error ) return callback( error, false );
            
            var command = {};
            command.query = self.buildQuery( runSpec );
            if( self.sort ) command.sort = self.sort;
            command.map = self.map;
            command.reduce = self.reduce;
            if( self.finalize ) command.finalize = self.finalize;
            if( self.out ) command.out = self.out;
            if( self.limit ) command.limit = self.limit;
            if( self.scope ) command.scope = self.scope;
            if( self.verbose ) command.verbose = self.verbose;

            callback( false, command );
        });
    };
    
    module.exports = Job;
})();