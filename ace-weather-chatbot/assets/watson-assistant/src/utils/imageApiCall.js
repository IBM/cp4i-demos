import axios from 'axios'

// console.log('Image processing URL: ' + process.env.REACT_APP_IMAGE_PROCESS_URL)
// console.log('Image processing apiKey: ' + process.env.REACT_APP_IMAGE_PROCESS_API_KEY)
// console.log('process.env' + JSON.stringify(process.env, null, 2))

export const imageApiCall = (base64image, assistant_response) => {
  const url = process.env.REACT_APP_IMAGE_PROCESS_URL
  const apiKey = process.env.REACT_APP_IMAGE_PROCESS_API_KEY

  // strip off the image preamble
  const start = base64image.search(',') + 1
  const imageData = base64image.substring(start)

  // navigate the response from Watson assistant to the 'main skill' object
  const skills = assistant_response.context.skills['main skill']

  // the claim number is a string variable in the 'user_defined' skill
  const claimNumber = skills.user_defined.claimNumber
  console.log('Claim number: ' + claimNumber)

  // set the headers for the image classification API call
  const config = {
    headers: {
      'x-ibm-client-id': apiKey,
      'content-type': 'application/json',
      accept: 'application/json'
    }
  }

  // input data to send to the image classification  API
  const data = {
    image_name: 'Some image', // descriptive string
    incident_id: claimNumber, // servicenow incident number
    image: imageData, // base64 encoded string for the image
    apiName: 'classifyimages' // which ACE flow to interact with
  }

  return new Promise((resolve, reject) => {
    axios.post(url, data, config)
      .then((response) => {
        // construct the chat message from the response from the image classification API
        const vc = response.data.most_valuable_class
        const msg =
          {
            input: {
              response_type: 'text',
              text: 'Class: ' + vc.class + ', Claimable Value: $' + vc.value,
              options: {
                return_context: true // important to ensure we get the chat context back
              }
            }
          }
        // resolve the promise with the message
        resolve(msg)
      })
      .catch((error) => reject(error))
  })
}
