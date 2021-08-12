#!/bin/bash

#Not used by codefresh as I am using build container instead

#working directory is always templateservicename root
GITROOT=$(pwd)
DOCKER_USERNAME=metcarob
DOCKER_IMAGENAME=templateservicename
VERSIONNUM=$(cat ./VERSION)
QUASARBUILDIMAGE="metcarob/docker-build-quasar-app:0.0.12"

#could be spa or pwa
QUASARBUILDMODE=pwa

docker image inspect ${DOCKER_USERNAME}/${DOCKER_IMAGENAME}:${VERSIONNUM}_localbuild > /dev/null
RES=$?
if [ ${RES} -eq 0 ]; then
  docker rmi ${DOCKER_USERNAME}/${DOCKER_IMAGENAME}:${VERSIONNUM}_localbuild
  RES2=$?
  if [ ${RES2} -ne 0 ]; then
    echo "Image exists and delete failed"
    exit 1
  fi
fi

docker run --rm --name docker_build_quasar_app --mount type=bind,source=${GITROOT}/frontend,target=/ext_volume ${QUASARBUILDIMAGE} -c "build_quasar_app /ext_volume ${QUASARBUILDMODE} \"local_build_${VERSIONNUM}\""
RES=$?
if [ ${RES} -ne 0 ]; then
  exit 1
fi

if [ ! -d ${GITROOT}/frontend/dist/${QUASARBUILDMODE} ]; then
  echo "ERROR - build command didn't create ${GITROOT}/frontend/dist/${QUASARBUILDMODE} directory"
  cd ${GITROOT}
  exit 1
fi

echo "Build docker container (VERSIONNUM=${VERSIONNUM})"
#This file does no version bumping
cd ${GITROOT}
eval docker build . -t ${DOCKER_USERNAME}/${DOCKER_IMAGENAME}:${VERSIONNUM}_localbuild
RES=$?
if [ ${RES} -ne 0 ]; then
  echo ""
  echo "Docker build failed"
  exit 1
fi

exit 0
