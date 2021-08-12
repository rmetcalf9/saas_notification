# Template Repo

I use templates for my personal projects with standard setup to connect to
my personal app infrastructure.

This Template repo has a simple app with a flask python backend, a quasar frontend, docker image build and codefresh deployment.
I have also extended it for with my standard Terraform setup.

## Pre-deploy setup

Find and replace service name occurrences (templateservicename -> new name):

 - codefresh.yml
 - Dockerfile
 - run localbuild
 - frontend/saasClientAPI
 - terraform main
 - local_terraform
 - testContainer

In codefresh.yml update the versions of build containers I use:
 - RJM_BUILDQUASARAPP_IMAGE
 - RJM_DOCKERWSCALLER_IMAGE

Run commands in new repo root:
 - mkdir /services/objectstoredata
 - in /frontend run npm install
 - in /frontend run npm audit fix

 - Check coderelease.props is correct github/gitlab

 - Check the python app requirements are the latest
 - Check the python app dependencies match the test container

# Pre-DeployTesting

 - ./services/continous_test.sh works
 - ./services/run_app_developer.sh works
 - /frontend run quasar dev works
 - ./run_all_parts_on_dev_machine.sh - check serverinfo is being read correctly
 - ./compile_frontend_and_build_container.sh works
 - ./run_localbuild_container.sh works and serverinfo is read correctly

## Deploy Setup

- Create secret (saas_templateservicename_objectstore_config_dynamodb_cached) in infrastructure
(Note maybe for AWS I want to create a user for this service)
```
docker secret create saas_templateservicename_objectstore_config_dynamodb_cached - <<EOF
{
 "Type": "Caching",
 "DefaultPolicy": {
   "cache": true,
   "maxCacheSize": 40,
   "cullToSize": 30,
   "timeout": 60000
 },
 "ObjectTypeOverride": {},
 "Main": {
   "Type": "DynamoDB",
   "aws_access_key_id": "xx",
   "aws_secret_access_key": "yy",
   "region_name": "eu-west-2",
   "endpoint_url": "None",
   "single_table_mode": "True",
   "objectPrefix": "templateservicename"
 }
}
EOF
```

Setup project in codefresh

Change clone step in codefresh so it has either github or gitlab.

## Deploy testing

If the deployment works we should be good!

 - https://api.metcarob.com/templateservicename/v0/public/web/frontend/#/ works and loads serverinfo
 - curl https://api.metcarob.com/templateservicename/v0/public/api/info/serverinfo works

## Finally

 - Add endpoint to my service monitoring. (At least serverinfo and index pages)

