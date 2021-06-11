# Mueller Splashpad

Is the splash pad open? I built this crowdsourcing site to answer that question. 
[https://www.muellersplashpad.com/](www.muellersplashpad.com)

How it works:

The status is updated when people vote on whether the park is working or not. Votes are active for 1 hour and people that are within .2km of the park get 2 votes (because they can presumably see if it’s on or not). 

Ideally this would linked to the physical switch, but this might work for now. Reach out if you’re interested in other features or helping.

## Running Locally 

### Install Elm 

Visit Elm Install Page https://guide.elm-lang.org/install/elm.html

### Install Node 

Visit https://nodejs.org/en/download/ or use https://github.com/nvm-sh/nvm

### Install Node dependencies
    ```bash
    npm i
    ```

### Run build Elm app and start backend
    ```bash
    npm run startDev
    ```

### Debugging 
    1. Open `chrome://inspect` in Chrome
    1. Click `Configure`
    1. Add  `localhost:9229` and click Done (when node is started with --inspect, a Node.js process listens for a debugging client at port 9229)
    1. Click `Open dedicated DevTools for Node`
    1. Add a debugger statement (e.g. add debugger to /status endpoint in index.js)
    1. Run `npm run startDev` and debug!