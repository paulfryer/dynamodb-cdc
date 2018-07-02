DynamoDB Change Data Capture (CDC)

Use this code as a reference architectual model for recording changes to DynamDB records.

This works by sending all changes to a DynamoDB stream that is processed by a Lambda function which will submit the changed values to a Kinesis Firehose. 
The Firehose will transform the rows into Parquet format.

As new parteqt files are dropped on S3, they will be added to the glue schema by triggering a lambda "on S3 create" event.

From Authena you can submit queries see all changes in the audit log, or build views to reconstruct the current values for querying.


### Glue Schema for CDC Table

![Glue Schema for CDC Table](/docs/changeSchema.png)