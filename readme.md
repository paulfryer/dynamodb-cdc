DynamoDB Change Data Capture (CDC)

Use this code as a reference architectual model for recording changes to DynamDB records.

This works by sending all changes to a DynamoDB stream that is processed by a Lambda function which will submit the changed values to a Kinesis Firehose. 
The Firehose will transform the rows into Parquet format.

As new parteqt files are dropped on S3, they will be added to the glue schema by triggering a lambda "on S3 create" event.

From Athena you can submit queries to see all changes in the audit log, or build views to reconstruct the current values for querying.


### Glue Schema for CDC Table

![Glue Schema for CDC Table](/docs/changeSchema.png)


### User Change Query Example

![Glue Schema for CDC Table](/docs/userChangesQuery.png)


Now that you can query the full audit/event log you can start to join information to gether if you need recreate a view of what the table looks like with latest values for example. Urn this query to create a view that returns the latest values.
[GetLastestValue.sql](/docs/latestvalues.sql)

Next you can build a table specific view like this:
![UserProfile.sql](/docs/user-view-profile.sql)

Now you can query table specific views like the "user-profile" one for example:

![Querying User Profile View](/docs/filteringLatestValuesOnView.png)

Warning: these views don't take the Partition Key into the query, which they should if you are going to get servious about implementing this pattern. Also this is highly experimenatal and has not been tested at scale, so performance testing is critical here.
