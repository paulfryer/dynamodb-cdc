console.log('Loading function');

var AWS = require('aws-sdk');
var firehose = new AWS.Firehose();

exports.handler = async (event, context) => {
    
   // console.log('Received event:', JSON.stringify(event, null, 2));
    
    var records = [];
    var sequence = 0;
    var batchtime = new Date();
    
    event.Records.forEach((record) => {
        sequence = sequence + 1;
        if (record.eventName == "REMOVE")
        {
          Object.keys(record.dynamodb.OldImage).forEach(function(key) {
            var value = record.dynamodb.OldImage[key].S;
            var json = createAuditRecord(record, key, value, null, sequence);
            records.push({Data: json});
          });
        }
        if (record.eventName == "INSERT")
        {
          Object.keys(record.dynamodb.NewImage).forEach(function(key) {
            var value = record.dynamodb.NewImage[key].S;
            var json = createAuditRecord(record, key, null, value, sequence);
            records.push({Data: json});
          });
        }        
        if (record.eventName == "MODIFY")
        {
          getAllProperties(record).forEach(function(key) {
            var oldValue;
            var newValue;
            if (record.dynamodb.OldImage[key])
              oldValue = getValueAsString(record.dynamodb.OldImage[key]);
            if (record.dynamodb.NewImage[key])
              newValue = getValueAsString(record.dynamodb.NewImage[key]);
              
            if (oldValue != newValue)
            {
              var json = createAuditRecord(record, key, oldValue, newValue, sequence);
              records.push({Data: json});
            }
          });
        }
    });
    var params = {
      DeliveryStreamName: 'user-change',
      Records: records
    };
    await firehose.putRecordBatch(params).promise();
};

function getValueAsString(attribute){
  if (attribute.N)
    return attribute.N;
  if (attribute.S)
    return attribute.S;
  if (attribute.BOOL)
    return attribute.BOOL;
  Error("unsupported attribute type.");
}

function getAllProperties(record) {
  var x=Object.keys(record.dynamodb.OldImage);
  var y=Object.keys(record.dynamodb.NewImage);
  var obj = {};
  for (var i = x.length-1; i >= 0; -- i)
     obj[x[i]] = x[i];
  for (var i = y.length-1; i >= 0; -- i)
     obj[y[i]] = y[i];
  var res = [];
  for (var k in obj) {
    if (obj.hasOwnProperty(k))  // <-- optional
      res.push(obj[k]);
  }
  return res;
}

function createAuditRecord(record, attribute, oldValue, newValue, sequence) 
{ 
        var r =
        {
          sequence: sequence,
          attribute: attribute,
          oldvalue: oldValue,
          newValue: newValue,
          processtime: new Date(),
            eventtime: record.dynamodb.ApproximateCreationDateTime,
            eventId: record.eventID,
            eventtype: record.eventName,
            region: record.awsRegion,
            account: record.eventSourceARN.split(':')[4],
            table: record.eventSourceARN.split(':')[5].split('/')[1]  // arn:aws:dynamodb:us-west-2:989469592528:table/user-profile/stream/2018-06-23T12:52:28.632
        };
        
        Object.keys(record.dynamodb.Keys).forEach(function(key) {
          if (r.key)
            r.key = r.key + record.dynamodb.Keys[key].S;
          else 
            r.key = record.dynamodb.Keys[key].S;
        });
        
        var json = JSON.stringify(r);
        return json;
}
