# NEURONE: oNlinE inqUiry expeRimentatiON systEm [![Build Status](https://travis-ci.com/dgacitua/neurone.svg?token=bybFYGq2vZ5sYMfosTqM&branch=master)](https://travis-ci.com/dgacitua/neurone)

Created by Daniel Gacitúa

## Install Instructions

### Development

1. Install Node.js 4.5.0+, MongoDB 3.2+ and Meteor 1.4.2+
2. Clone this repository
3. Open a terminal in NEURONE's root directory, run `meteor npm install` and then run `meteor`

### Production

**NOTE:** A Linux Virtual Private Server (VPS) or a Linux local machine with SSH access is needed to run this project in production mode.

#### Quick deploy (through Meteor Up)

1. Install Node.js 4.5.0+, MongoDB 3.2+ and Meteor 1.4.2+ on your development machine
2. Install Meteor Up with `npm install -g mup` on your development machine
3. Clone this repository
4. Set the following environment variables in your development machine (replace values with the ones of your production machine)

        export MUP_SERVER_HOST='192.168.1.2'
        export MUP_SERVER_USERNAME='root'
        export MUP_SERVER_PASSWORD='password'
        export MUP_ROOT_URL='http://192.168.1.2'
        export MUP_MONGO_URL='mongodb://192.168.1.2/meteor'

5. Open a terminal in NEURONE's root directory, run `cd .deploy`
6. Run `mup setup`
7. Run `mup deploy`

#### Advanced deploy (through Passenger and Nginx)

1. Install Node.js 4.5.0+, MongoDB 3.2+ and Meteor 1.4.2+ on your development machine
2. Clone this repository
3. Follow instructions available on [Deploying a Meteor app with Passenger to production](https://www.phusionpassenger.com/library/walkthroughs/deploy/meteor/). In that walkthrough, select **Nginx** as integration mode, **Open Source** as Passenger edition and Meteor version **>=1.4**.
4. After your first successful deploy, you can use the automatic deployment scripts for Passenger available in this repo by setting the following environment variables (in your development machine):

        # Replace values with your server's SSH configuration
        export PASSENGER_SERVER_HOST='192.168.1.2'
        export PASSENGER_SERVER_USERNAME='root'

5. For running an automatic deploy to your Passenger server, enter to NEURONE's root directory in your terminal and run `./passenger/init.sh`

### Deploy with Docker

#### Build image locally

1. Install Docker in your development machine and add your current user to `docker` group
2. Open a terminal and run `./dockerBuild.sh`
3. You will get a local image to deploy

#### Run image locally

TODO