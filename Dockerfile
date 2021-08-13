FROM python:3.8-buster

#docker file for saas_notification microservice
# Using python buster as base image to make better python images
# I have built this as a single container microservice to ease versioning

#https://pythonspeed.com/articles/alpine-docker-python/
#https://github.com/tiangolo/uwsgi-nginx-docker/blob/master/docker-images/python3.8.dockerfile

MAINTAINER Robert Metcalf

ENV APP_DIR /app
##web dirs arealso configured in nginx conf
ENV APIAPP_FRONTEND /frontend
ENV APIAPP_FRONTEND_FRONTEND /frontend


ENV APIAPP_APIURL http://localhost:80/api
ENV APIAPP_APIDOCSURL http://localhost:80/apidocs
ENV APIAPP_FRONTENDURL http://localhost:80/frontend
ENV APIAPP_APIACCESSSECURITY '[]'

ENV APIAPP_DEFAULTMASTERTENANTJWTCOLLECTIONALLOWEDORIGINFIELD "http://localhost"

#Port for python app should always be 80 as this is is hardcoded in nginx config
ENV APIAPP_PORT 80

# APIAPP_MODE is now defined here instead of run_app_docker.sh
#  this is to enable dev mode containers (and avoid dev cors errors)
ENV APIAPP_MODE DOCKER

# APIAPP_VERSION is not definable here as it is read from the VERSION file inside the image

EXPOSE 80

COPY install-nginx-debian.sh /

RUN apt-get install ca-certificates && \
    bash /install-nginx-debian.sh && \
    mkdir ${APP_DIR} && \
    mkdir ${APIAPP_FRONTEND_FRONTEND} && \
    mkdir /var/log/uwsgi && \
    pip3 install uwsgi && \
    wget --ca-directory=/etc/ssl/certs https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem -O /rds-combined-ca-bundle.pem

#RUN apk add --no-cache bash python3 curl python3-dev build-base linux-headers pcre-dev libffi-dev openldap-dev libxml2 libxslt libxslt-dev libxml2-dev && \
#    python3 -m ensurepip && \
#    rm -r /usr/lib/python*/ensurepip && \
#    pip3 install --upgrade pip setuptools && \
#    rm -r /root/.cache && \
#    pip3 install --upgrade pip && \
#    mkdir ${APP_DIR} && \
#    mkdir ${APIAPP_FRONTEND_FRONTEND} && \
#    mkdir /var/log/uwsgi && \
#    pip3 install uwsgi && \
#    wget https://s3.amazonaws.com/rds-downloads/rds-combined-ca-bundle.pem -O /rds-combined-ca-bundle.pem

# lmxml build process always runs out of memory
#RUN pip3 install lxml==4.5.2

COPY ./services/src ${APP_DIR}
RUN pip3 install -r ${APP_DIR}/requirements.txt

COPY ./frontend/dist/pwa ${APIAPP_FRONTEND_FRONTEND}
COPY ./VERSION /VERSION
COPY ./services/run_app_docker.sh /run_app_docker.sh
COPY ./nginx_default.conf /etc/nginx/conf.d/default.conf
COPY ./uwsgi.ini /uwsgi.ini
COPY ./healthcheck.sh /healthcheck.sh

STOPSIGNAL SIGTERM


CMD ["/run_app_docker.sh"]

# Regular checks. Docker won't send traffic to container until it is healthy
#  and when it first starts it won't check the health until the interval so I can't have
#  a higher value without increasing the startup time
HEALTHCHECK --interval=30s --timeout=3s \
  CMD /healthcheck.sh

##to run see run_localbuild_container.sh
