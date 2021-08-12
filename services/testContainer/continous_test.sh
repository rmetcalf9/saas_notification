#!/bin/bash

echo 'continous test for testContainer'
echo 'e.g. sudo ./continous_test.sh wip'
echo ' you must run localbuild container. saas_notification defaults to port 8095'

export TESTPARAM_EXPECTED_CONTAINER_VERSION=$(cat ../../VERSION)
export TESTPARAM_ENDPOINTURL=http://localhost:8095
export TESTPARAM_THROUGHKONG="False"

if [ $# -eq 0 ]; then
  until ack -f --python ./test | entr -d nosetests --rednose; do sleep 1; done
else
  if [ $# -eq 1 ]; then
    echo "Testing ${1}"
    until ack -f --python ./test | entr -d nosetests -a ${1} --rednose; do sleep 1; done
  else
    echo "Testing ${1} with verbose option (Single Run)"
    nosetests -v -a ${1} --rednose
  fi
fi
