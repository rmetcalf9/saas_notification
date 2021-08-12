#!/bin/bash

# Script to start a local version of the saas user management service
#  will terminate if already running

# Service should be accessable at http://localhost:8098/public/web/frontend/
# (Chrome dosen't like that so use http://127.0.0.1:8098/public/web/frontend/
# API DOCS: http://127.0.0.1:8098/public/web/apidocs
# API's at http://127.0.0.1:8098/public/api/info/serverinfo
# API's at http://127.0.0.1:8098/public/api/login/linkvis/authproviders

## UI Login: http://127.0.0.1:8099/public/web/adminfrontend/
# admin/admin
## DON'T forget the end slash because the rediect will drop the port number

EXPNUMPARAM=6
if [ $# -ne ${EXPNUMPARAM} ]; then
  echo "Must supply ${EXPNUMPARAM} params"
  exit 1
fi

LOCALSERVICENAME=devlocal_saasuser_management
RJM_IMAGE_TO_RUN=${1}
APIAPP_JWTSECRET=${2}
IEXTURL=${3}
IEXTPORT=${4}
IEXTPORT80=${5}
APIAPP_MASTERPASSWORDFORPASSHASH=${6}

# image existance check
if [ $(docker image inspect ${1} >/dev/null 2>&1 && echo yes || echo no) == 'no' ]; then
  echo "Image ${1} dosen't exist"
  echo "  try"
  echo "    docker pull ${1}"
  exit 1
fi

docker service inspect ${LOCALSERVICENAME} >/dev/null 2>&1
RES=$?
if [ ${RES} -eq 0 ]; then
  echo "Docker service is already running, use"
  echo " docker service rm ${LOCALSERVICENAME}"
  echo "   if you want to stop it"
  exit 0
fi

EXTRAOPTS=""

##Fast token change (2 seconds and 30 seconds) to test tokenswapping
#EXTRAOPTS="${EXTRAOPTS} -e APIAPP_JWT_TOKEN_TIMEOUT=2 -e APIAPP_REFRESH_TOKEN_TIMEOUT=30"

docker service create --name ${LOCALSERVICENAME} \
--network main_net \
-e APIAPP_JWTSECRET=${APIAPP_JWTSECRET} \
-e APIAPP_DEFAULTHOMEADMINPASSWORD=admin \
-e APIAPP_DEFAULTHOMEADMINUSERNAME=admin \
-e APIAPP_APIURL=${IEXTURL}:${IEXTPORT80}/api \
-e APIAPP_APIDOCSURL=${IEXTURL}:${IEXTPORT80}/public/web/apidocs \
-e APIAPP_FRONTENDURL=${IEXTURL}:${IEXTPORT80}/public/web/frontend \
-e APIAPP_DEFAULTMASTERTENANTJWTCOLLECTIONALLOWEDORIGINFIELD="http://localhost" \
-e APIAPP_MASTERPASSWORDFORPASSHASH=${APIAPP_MASTERPASSWORDFORPASSHASH} \
-e APIAP_MODE=DEVELOPER \
-e APIAPP_DEFAULTMASTERTENANTJWTCOLLECTIONALLOWEDORIGINFIELD="http://127.0.0.1:8099" \
-e APIAPP_AUTOCONFIGFILE=/hostservices/_start_local_saas_user_management_service_config.json \
${EXTRAOPTS} \
--mount type=bind,source=$(pwd)/,destination=/hostservices/,readonly \
--publish ${IEXTPORT80}:80 \
${RJM_IMAGE_TO_RUN}

##http://127.0.0.1:8099

#-e APIAPP_GATEWAYINTERFACECONFIGFILE=/run/secrets/saas_user_management_system_gateway_config \
#-e APIAPP_MASTERPASSWORDFORPASSHASHFILE=/run/secrets/saas_user_management_system_objectstore_hashpw \

RES=$?
if [ ${RES} -ne 0 ]; then
  echo "Failed to start service"
  echo ""
  exit 1
fi

exit 0
