#This dockerfile builds a container image with python and rednose installed so we can test
# another built container.
# it it is designed to be launched and linked to the running container to preform the tests

FROM alpine
MAINTAINER Robert Metcalf

COPY ./requirements.txt /requirements.txt
COPY ./run_tests_with_wait.sh /run_tests_with_wait.sh

RUN apk add --no-cache bash python3 curl python3-dev build-base linux-headers pcre-dev libffi-dev && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --upgrade pip setuptools && \
    rm -r /root/.cache && \
    pip3 install --upgrade pip && \
    pip3 install -r requirements.txt

COPY ./test /test

# Test this out locally:
# docker build . -t tmp
# docker run -e TESTPARAM_EXPECTED_CONTAINER_VERSION=0.0.127 -e TESTPARAM_ENDPOINTURL=http://${HOSTNAME}:8095 -e TESTPARAM_THROUGHKONG=False tmp:latest /run_tests_with_wait.sh

