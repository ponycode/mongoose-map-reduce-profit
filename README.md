# mongoose-map-reduce-profit
A mongoose plugin to help ease mongo/mongoose incremental map-reduce jobs

Creating incremental map-reduce jobs is a pain because testing is difficult. This plugin helps you by creating a way to define a job and then offering a way to test your job outside of mongo where you can set breakpoints and use console.log. This plugin also
offers automatic job tracking so you don't have to save the last run date.

## Defining Map Reduce Jobs

You can define your job in your mongoose schema or in separate files. This plugin adds a `defineIncrementalMapReduceJob()` function to mongoose schemas. Start by calling `defineIncrementalMapReduceJob` with a job
name and then defining your job details with the returned `Job` object. You should define all of your jobs at the same time you define all of your mongoose models.

```javascript

var job1 = TaskSchema.defineIncrementalMapReduceJob( "job1" );
job1.out = "job1-results";
job1.verbose = true;

job1.buildQuery = function( runSpec ){
    if( runSpec.incremental ){
        return { createdDate: { $gt: runSpec.runDate } };
    }else{
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


## Running Map Reduce Jobs

This plugin adds a `performIncrementalMapReduceJob` function to your models. Run a job by calling `performIncrementalMapReduceJob` with the proper job name. Be sure you have already defined your jobs by the time your try to run one.

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