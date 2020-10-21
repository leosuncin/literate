FROM gitpod/workspace-mongodb:latest

USER root

# Install Cypress-base dependencies
RUN apt-get update &&\
    apt-get install -yq --no-install-recommends \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb &&\
    apt-get clean &&\
	  rm -rf /var/lib/apt/lists/*

RUN pip install httpie

USER gitpod

# Install custom tools, runtime, etc. using apt-get
# For example, the command below would install "bastet" - a command line tetris clone:
#
# RUN sudo apt-get -q update && #     sudo apt-get install -yq bastet && #     sudo rm -rf /var/lib/apt/lists/*
#
# More information: https://www.gitpod.io/docs/config-docker/

ENV MONGODB_URL=mongodb://localhost/admin
