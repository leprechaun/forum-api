#!/usr/bin/env bash

curl 'https://gocd.k8s.fscker.org/go/api/admin/encrypt' \
-u 'automaton:Changeme@001' \
-H 'Accept: application/vnd.go.cd.v1+json' \
-H 'Content-Type: application/json' \
-X POST -d '{
  "value": "8de1071579e036628724b77babb38da288760852"
}'
