( function(){
    
    function Job( name ){
        this.name = false;
        this.buildQuery = false;
        this.sort = false;
        this.map = false;
        this.reduce = false;
        this.finalize = false;
    }
    
    Job.prototype.validate = function(){
        if( !this.name ) throw new Error( "job.name is required" );
        if( !this.buildQuery ) throw new Error( "job.buildQuery( runSpec ) is required" );
        if( !this.map ) throw new Error( "job.map is required" );
        if( !this.reduce ) throw new Error( "job.reduce is required" );
    };

    Job.prototype.buildCommand = function( callback ){
        var self = this;
        
        var runSpec = {};
        runSpec.incremental = false;
        runSpec.lastRunDate = new Date();
            
        var command = {};
        command.query = this.buildQuery( runSpec );
        if( self.sort ) command.sort = self.sort;
        command.map = self.map;
        command.reduce = self.reduce;
        if( self.finalize ) command.finalize = self.finalize;
        
        callback( false, command );
    };
    
    module.exports = Job;
})();