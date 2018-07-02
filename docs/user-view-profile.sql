CREATE OR REPLACE VIEW view-user-profile AS 
SELECT
  "keyTable"."key"
, "lastLogin"."value" "LastLogin"
, "firstName"."value" "FirstName"
, "lastName"."value" "LastName"
FROM
  ((((
   SELECT DISTINCT "key" "key"
   FROM
     user.latestvalues
   WHERE ("table" = 'user-profile')
)  "keyTable"
LEFT JOIN (
   SELECT
     "value"
   , "key"
   FROM
     user.latestvalues
   WHERE ("attribute" = 'LastLogin')
)  "lastLogin" ON ("keyTable"."key" = "lastLogin"."key"))
LEFT JOIN (
   SELECT
     "value"
   , "key"
   FROM
     user.latestvalues
   WHERE ("attribute" = 'FirstName')
)  "firstName" ON ("keyTable"."key" = "firstName"."key"))
LEFT JOIN (
   SELECT
     "value"
   , "key"
   FROM
     user.latestvalues
   WHERE ("attribute" = 'LastName')
)  "lastName" ON ("keyTable"."key" = "lastName"."key"))
