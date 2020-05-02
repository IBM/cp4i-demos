#!/bin/sh

curl --insecure \
     --user "$cp4iuser:$cp4ipw" \
     --request POST \
     --url "$cp4ibasepath/CarRepairClaim" \
     --header "X-IBM-Client-Id:$cp4iclientid" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data '{
         "Name":"Vernon Barker",
         "eMail":"to@epiope.my",
         "LicensePlate":"tepuru",
         "DescriptionOfDamage":"58",
         "PhotoOfCar":"'$(base64 chicken.jpg)'",
         "ContactID":"8897796795006976"
         }'
