# azuredevopsext
Azure DevOps Extension


## How to Start

Make sure all required modules are installed (run this inside the src folder):
 ###
    npm install -g typescript
    npm install azure-devops-extension-sdk azure-devops-extension-api requirejs



## How to Package

Go to the root folder first compile the typescript file to create the javascript file. For this run the command

###
    tsc

Afterwards you can package with the following command. Make sure you increment the Version in the [vss-extension.json](./vss-extension.json) and the [package.json](./package.json) file.

###
    npx tfx-cli extension create --manifest-globs vss-extension.json


## How to Debug:

**1. Install http-server**

###
    npm install -g http-server

**2. Run http-server:**

###
    http-server


<br />

**3. Open Browser**

### http://localhost:8080

