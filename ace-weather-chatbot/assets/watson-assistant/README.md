# README.md

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Introduction
This project deploys a react application that connects to a Watson API.

NOTE: It currently runs only from localhost, this is because of CORS can be configured to use an automatic proxy (see proxy setting in package.json) when running locally. An express/node app could be used to manually configure a proxy on IBM Cloud.

The application deals with text and image responses only from the Watson assistant.

## Installation
0. Clone this repo
1. [install 'yarn'](https://classic.yarnpkg.com/en/docs/install): follow the instructions for your OS
   * Mac-specific: if you do not have it already, you will need to install xcode. [This article](https://medium.com/flawless-app-stories/gyp-no-xcode-or-clt-version-detected-macos-catalina-anansewaa-38b536389e8d) gives detailed instructionsd
2. Install the dependencies: `yarn install`

## Configuration
### Prereqs
This setup assumes that you have already followed the instructions on how to configure App Connect and Watson Assistant.

### Set access credentials in `.env.local`
The chatbot has the following immediate dependencies;
1. The API Credentials specific to your Watson Assistant
2. The credentials to access an image processing API, which is provided by an App Connect API Flow

The credentials for these are stored in the `.env.local` file, which you will need to create, in the same directory that you cloned this repo to. **We have supplied a sample `sample.env.local` that you should edit and rename to `.env.local`.**

* For your Watson assistant
  * The API URL for your Watson Assistant: `REACT_APP_ASSISTANT_URL`
  * The API key for accessing your Watson Assistant instance: `REACT_APP_ASSISTANT_API_KEY`
  * To get these;
    1. Browse to your list of assistants on assistant.watson.cloud.ibm.com
    2. Choose the assistant for this demo; from its overflow menu (**&vellip;**) select `Settings`
        * Select the 'API details' tab, where you will find "Assistant URL" and "API Key"
* For your App Connect Image Processing flow
  * The URL for your image processing API: `REACT_APP_IMAGE_PROCESS_URL`
  * The API Key for accessing your image processing API: `REACT_APP_IMAGE_PROCESS_API_KEY`

```.env.local
REACT_APP_ASSISTANT_URL="https://..."
REACT_APP_ASSISTANT_API_KEY="xxxYYYzzz"
REACT_APP_IMAGE_PROCESS_URL="https://...""
REACT_APP_IMAGE_PROCESS_API_KEY="xxxYYYzzz"
```

### Set the value of `proxy` in `package.json`
You must set the value of `proxy` in package.json. You need to do this to allow your client
to communicate with Watson assistant - which does not allow 'Cross Origin' requests.
This must be set to the **same value** as the base part of your `REACT_APP_ASSISTANT_URL`.
For example, if your `.env.local` has;
```.env.local
REACT_APP_ASSISTANT_URL="https://api.us-south.assistant.watson.cloud.ibm.com/instances/ffcc1122/..."
```
then your `package.json` should contain;
``` json
  ...
  "proxy": "https://api.us-south.assistant.watson.cloud.ibm.com",
  ...  
```



## File uploads

### File types

The Assistant.js component is currently configured to accept jpg, png and gif. Chagne the following line to updat ethat.

```js
const imageTypes = ["jpg", "jpeg", "png", "gif"];
```

### File processing code
The file is processed via code in [src/utils/imageApiCall.js](src/utils/imageApiCall.js).
The supplied implementation calls an API, and constructs a Watson Assistant message based on the response.

This code is called from within [src/components/Assistant.js](src/components/Assistant.js) using this code;
``` javascript
imageApiCall(result.value.data).then(
  (response) => {
    //addUserMessage(response)
    sendUserMessage(response)
      .then((res) => {
        console.log(JSON.stringify(res.data, null, 2))
        setConversation((prevState) => [...prevState, res.data]);
      })
      .catch((err) => {
        console.dir(err);
      });
  }
)
```
The current implementation sends the result of `imageApiCall` to Watson Assistant (`sendUserMessage`) but does not display is in the chat dialog.
The message can be displayed in the dialog by uncommenting the call to `addUserMessage`.


### The dialog

The dialog adds both images the user adds and a text message depending on the number of files uploaded.

- "file: uploads failed"
- "file: upload failed"
- "file: uploads successful"
- "file: upload successful"

Comment out the addUserMessage that follows these strings in `Assistant.js` to avoid displaying this string.

```js
addUserMessage(msg);
```

### Assistant response to files

The same text messages are sent to the Waston Assistant using `sendUserMessage(msg)`.

- "file: uploads failed"
- "file: upload failed"
- "file: uploads successful"
- "file: upload successful"

These need to ben configured as intents in the Watson assistant with responses in the dialog.

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.
