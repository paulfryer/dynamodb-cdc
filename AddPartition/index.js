var AWS = require('aws-sdk');
var glue = new AWS.Glue();

exports.handler = async (event, context) => {


  
  var key = event.Records[0].s3.object.key;
  
  var keyParts = key.split('/');

  //console.log("EVENT", event);

var year = keyParts[0];
var month = keyParts[1];
var day = keyParts[2];
var hour = keyParts[3];
var bucket = event.Records[0].s3.bucket.name;
var location = "s3://" + bucket + "/" + year + "/" + month + "/" + day + "/" + hour + "/";
var partition = year + "-" + month + "-" + day + "-" + hour;
  
  
    console.log("Searching for partition: " + partition);
    
    var partitionExists = false;
    
    try {
      await glue.getPartition({
        DatabaseName: 'user',
        TableName: 'user-change',
        PartitionValues: [partition]
        }).promise();    
      console.log("Existing partition found.");
      partitionExists = true;
    } catch (error) {
      if (error.code == 'EntityNotFoundException')
        partitionExists = false;
      else throw error;
    }

    if (!partitionExists)
    {
        console.log("Partition not found, adding now.");
         var params = {
          DatabaseName: 'user', 
          PartitionInput: { 
            StorageDescriptor: {
              SerdeInfo: {
                SerializationLibrary : 'org.apache.hadoop.hive.ql.io.parquet.serde.ParquetHiveSerDe'
              },
              Location: location,
              InputFormat: 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetInputFormat',
              OutputFormat: 'org.apache.hadoop.hive.ql.io.parquet.MapredParquetOutputFormat'
            },
            Values: [partition]
          },
          TableName: 'user-change'
        };
        await glue.createPartition(params).promise();    
    }
};