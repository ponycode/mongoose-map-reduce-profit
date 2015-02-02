# mongoose-map-reduce-profit
A mongoose plugin to help ease mongo/mongoose incremental map-reduce jobs

Creating [incremental map-reduce](http://docs.mongodb.org/manual/tutorial/perform-incremental-map-reduce/) jobs is a pain because testing is difficult. This plugin helps you by creating a way to define a job and then offering a way to test your job outside of mongo where you can set breakpoints and use console.log. This plugin also
offers automatic job tracking so you don't have to keep track of the last run date. You may define as many jobs as necessary on a given collection.


## Defining Map Reduce Jobs

You can define your job in your mongoose schema or in separate files. This plugin adds a `defineIncrementalMapReduceJob()` function to mongoose schemas. Start by calling `defineIncrementalMapReduceJob` with a unique job
name and then defining your job details with the returned `Job` object. You should define all of your jobs at the same time you define all of your mongoose models.

```javascript

var job1 = TaskSchema.defineIncrementalMapReduceJob( "job1" );
job1.out = "job1-results";
job1.verbose = true;

job1.buildQuery = function( runSpec ){
    if( runSpec.incremental ){
        // This is an incremental job, fetch only the new documents
        return { createdDate: { $gt: runSpec.runDate } };
    }else{
        // This is a full job, fetch all the things
        return {}; 
    }
};

job1.map = function(){
    var MS_IN_DAY = 24*60*60*1000;
    
    var startDate = new Date( this.openedDate.getFullYear(), this.openedDate.getMonth(), this.openedDate.getDate(), 0, 0, 0, 0 );
    var endDate = new Date( this.closedDate.getFullYear(), this.closedDate.getMonth(), this.closedDate.getDate(), 0, 0, 0, 0 );
    var currentDate = startDate;
    
    while( currentDate <= endDate ){
        var dayString = currentDate.getFullYear() + "-" + currentDate.getMonth() + "-" + currentDate.getDate();
        if( currentDate.getTime() === endDate.getTime() ){
            emit( dayString, { open: 0, closed: 1 } );
        }else{
            emit( dayString, { open: 1, closed: 0 } );
        }
        currentDate = new Date( currentDate.getTime() + MS_IN_DAY );
    }
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

```

The job object has the following customizable properties:
* **buildQuery( runSpec )** - Required. The build query should return a mongoose query based on the passed in `runSpec`. The `runSpec` has an `incremental` property which is a boolean for whether or not a full run is needed. Your query should use the `runSpec.runDate` property to build a query to return the subset of records for your incremental job when `runSpec.incremental` is true.
* **map** - Required. The map function which will run inside mongo. The map function is responsible for calling `emit( key, value )` zero or more times for each record. The map function is called once per record and the current record is the `this` object. [more info](http://docs.mongodb.org/manual/reference/command/mapReduce/#requirements-for-the-map-function)
* **reduce( key, values )** - Required. The reduce function which will run inside mongo. The reduce function is responsible for returning some aggregate value for the passed in values array. [more info](http://docs.mongodb.org/manual/reference/command/mapReduce/#requirements-for-the-reduce-function)
* **finalize( key, value )** - Optional. The finalize function which will run inside mongo. The finalize function should return a modified object from the passed in reducedValue. [more info](http://docs.mongodb.org/manual/reference/command/mapReduce/#requirements-for-the-finalize-function)
* **out** - Optional. This can be the name of your output collection as a string or an object which specifies a mongo map-reduce action. [more info](http://docs.mongodb.org/manual/reference/command/mapReduce/#out-options)
* **limit** - Optional. The maximum number of records to map-reduce.
* **scope** - Optional. An object whose properties will be available in the global scope of the map, reduce, & finalize functions when run inside mongo.
* **scope** - Optional. An object whose properties will be available in the global scope of the map, reduce, & finalize functions when run inside mongo. [more info](http://docs.mongodb.org/manual/reference/command/mapReduce)
* **verbose** - Optional. When true, mongo will output additional info to its log.


## Running Map Reduce Jobs

This plugin adds a `performIncrementalMapReduceJob` function to your models. Run a job by calling `performIncrementalMapReduceJob` with the proper job name. Be sure you have already defined your jobs by the time your try to run one.

When you call `performIncrementalMapReduceJob`, the plugin will query to see if the job has ever run before. If the job has been run, the `buildQuery` function will be called with a runSpec that has `runSpec.incremental` set to true and
`runSpec.runDate` equal to the last date the job was run.

```
Task.performIncrementalMapReduceJob( "job1", function( error, results ){
    // console.log( "GOT RESULTS", results, error ); // This won't work because it is run inside of mongo
});
```


## Testing Map Reduce Jobs

This plugin adds a `debugIncrementalMapReduceJob` function to your models. Test a job by calling `debugIncrementalMapReduceJob` with the proper job name. Be sure you have already defined your jobs by the time your try to test one.

```
Task.debugIncrementalMapReduceJob( "job1", function( error, results ){
    console.log( "GOT RESULTS", results, error ); // THIS WORKS!
});
```

Since the job tests are not run inside of mongo you can set breakpoints and use `console.log`.


##Example

You can find an example of testing a job using mocha in the /test/main.test.js file. To run the test download this project and run `grunt test`. Note: You'll need to have mongodb running when you run the tests.