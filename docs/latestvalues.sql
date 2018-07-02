CREATE OR REPLACE VIEW latestvalues AS 
SELECT
  "t"."table"
, "t"."attribute"
, "t"."key"
, "max"("newvalue") "value"
FROM
  (user."user-change" t
INNER JOIN (
   SELECT
     "table"
   , "attribute"
   , "key"
   , "max"("processtime") "processtime"
   , "max"("sequence") "sequence"
   FROM
     user."user-change"
   WHERE (("table" = 'user-profile') AND ("eventtype" IN ('INSERT', 'MODIFY')))
   GROUP BY "key", "attribute", "table"
)  t1 ON ((("t"."key" = "t1"."key") AND ("t"."processtime" = "t1"."processtime")) AND ("t"."sequence" = "t1"."sequence")))
WHERE ("eventtype" IN ('INSERT', 'MODIFY'))
GROUP BY "t"."key", "t"."attribute", "t"."table"
