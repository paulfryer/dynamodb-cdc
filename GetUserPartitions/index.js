
var AWS = require('aws-sdk');
var athena = new AWS.Athena();

exports.handler = async (event, context) => {
    

event.FileView = `files_${event.Account}_${event.Region}_${event.Table}_${event.Key}`;

var matchingFilesSql = `
create view "user"."${event.FileView}" as
select distinct "$path" 
from    "user"."user-change" 
where   "account" = ${event.Account}
and     "region" = '${event.Region}'
and     "table" = '${event.Table}'
and     "key" = '${event.Key}'`;
    
var params = {
  QueryString: matchingFilesSql, 
  ResultConfiguration: { 
    OutputLocation: event.OutputLocation,
    EncryptionConfiguration: {
      EncryptionOption: 'SSE_S3'
    }
  }
};

    
var queryResult = await athena.startQueryExecution(params).promise();
    
    event.QueryExecutionId = queryResult.QueryExecutionId;
    
    return event;
};