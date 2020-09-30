import React, { useState, useEffect, useRef } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import axios from "axios";

import "./Assistant.scss";

import { pFileReader } from "../utils/pFileReader";
import { imageApiCall } from "../utils/imageApiCall"
import { MultiInput } from "./";


// handle messages and multiple responses from Watson Assistant
const Message = ({ msg }) => {
  const tempContents = msg.input || (msg.output && msg.output.generic);
  const contents = Array.isArray(tempContents) ? tempContents : [tempContents];
  return contents.map((content) => {
    if (content.response_type === "image") {
      return (
        <figure className="assistant__message">
          <img
            src={content.source}
            alt={content.description}
            className="assistant__message-image"
          />
          <figcaption className="assistant__message-caption">
            {content.title}
          </figcaption>
        </figure>
      );
    } else {
      return <div>{content.text}</div>;
    }
  });
};

// proxy in packages.json amends baseApi
const assistant_url = process.env.REACT_APP_ASSISTANT_URL;

const url_array = assistant_url.match(/http[s]?:\/\/[^/]*\/(.*)/)
const baseApi = '/' + url_array[1]
//console.log("baseApi: " + baseApi);

const getSessionUrl = `${baseApi}?version=${process.env.REACT_APP_VDATE}`;
const sendMsgUrl = (session) =>
  `${baseApi}/${session}/message?version=${process.env.REACT_APP_VDATE}`;

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
};

export const Assistant = ({ mobile }) => {
  const imageTypes = ["jpg", "jpeg", "png", "gif"];
  const acceptImageTypes = imageTypes.map((item) => `.${item}`).join(",");
  let messageRefs = useRef([]);
  const [initialized, setInitialized] = useState(false);
  // const [step, setStep] = useState(0); // used as part of fake API
  const [conversation, setConversation] = useState([]);
  const [session, setSession] = useState(null);

  const getAxiosConfig = (url) => ({
    method: "post",
    url,
    headers: headers,
    auth: {
      username: "apiKey",
      password: process.env.REACT_APP_ASSISTANT_API_KEY,
    },
  });

  const getAndSetSessionUrl = () => {
    axios(getAxiosConfig(getSessionUrl))
      .then((res) => {
        // console.log("then");
        setSession(res.data.session_id);
      })
      .finally(() => {
        // console.log("finally");
        setInitialized(true);
      });
  };

  useEffect(() => {
    if (initialized) {
      sendUserMessage({ input: { text: "" } }).then((res) => {
        setConversation((prevState) => [...prevState, res.data]);
      });
      // setConversation(dataConversation.slice(0, step + 1)); // fake API start
    }
  }, [initialized]);

  const sendUserMessage = (msg) => {
    const config = getAxiosConfig(sendMsgUrl(session));
    config.data = msg;
    return axios(config);
  };

  useEffect(() => {
    getAndSetSessionUrl();
  }, []);

  // useEffect(() => { // part of fake api
  //   if (initialized && !session) {
  //     setConversation(conversation.concat(dataConversation[step]));
  //   }
  // }, [initialized, session, step]);

  useEffect(() => {
    if (messageRefs.current.length > 0) {
      messageRefs.current[messageRefs.current.length - 1].scrollIntoView();
    }
  }, [conversation]);

  messageRefs.current = [];
  const addMessageRef = (el) => {
    if (el && !messageRefs.current.includes(el)) {
      messageRefs.current.push(el);
    }
  };

  // const handleClick = () => { // used for fake API progress
  //   if (initialized && !session) {
  //     setStep(step + 1);
  //   }
  // };

  const handleInput = (msg) => {
    // // eslint-disable-next-line
    // console.log("Input");
    // // eslint-disable-next-line
    // console.dir(msg);
  };

  const addUserMessage = (msg) => {
    setConversation((prevState) => [...prevState, msg]);
  };

  // const addResponse = (responseText) => { // fake API response addition
  //   setConversation((prevState) => [
  //     ...prevState,
  //     {
  //       output: {
  //         intents: [],
  //         entities: [],
  //         generic: [
  //           {
  //             response_type: "text",
  //             text: responseText,
  //           },
  //         ],
  //       },
  //     },
  //   ]);
  // };

  const handleSubmit = (submittedMsg) => {
    let msg;
    if (submittedMsg.files.length) {
      let filesProcessed = 0;
      const filesRead = [];
      const notImageFiles = [];

      for (let file of submittedMsg.files) {
        filesProcessed += 1;
        const fileType = file.type.split("/");
        if (fileType[0] === "image" && imageTypes.includes(fileType[1])) {
          filesRead.push(pFileReader(file));
        } else {
          notImageFiles.push(file.name);
        }
      }

      Promise.allSettled(filesRead).then((results) => {
        const good = [];
        const bad = [];
        for (let result of results) {
          if (result.status === "rejected") {
            bad.push(result.reason.file.name);
          } else {
            good.push(result.value.file.name);

            // Rob P vvvvvvvvvvvvvvvvvvvvvvvvv
            const last_assistant_response=conversation[conversation.length-1]
            //console.log("At 1:")
            //console.log(JSON.stringify(last_assistant_response))
            imageApiCall(result.value.data, last_assistant_response).then(
              (response) => {
                //addUserMessage(response)

                sendUserMessage(response)
                  .then((res) => {
                    //console.log("At 2:")
                    //console.log(JSON.stringify(res.data, null, 2))
                    setConversation((prevState) => [...prevState, res.data]);
                  })
                  .catch((err) => {
                    console.dir(err);
                  });
              }
            )
            // Rob P ^^^^^^^^^^^^^^^^^^^^^^^^^
            addUserMessage({
              input: {
                title: result.value.file.name,
                source: `${result.value.data}`,
                response_type: "image",
                description: "An image you sent",
              },
            });
          }
        }

        const result = {
          rejected_reads: bad,
          not_image_files: notImageFiles,
          read_images: good,
        };
        if (bad.length || notImageFiles.length) {
          msg = {
            response_type: "text",
            input: {
              options: { return_context: true },  // we need the chat context
              text:
                bad.length + notImageFiles.length + good.length > 1
                  ? "file: uploads failed"
                  : "file: upload failed",
            },
          };
        } else {
          msg = {
            response_type: "text",
            input: {
              options: { return_context: true },  // we need the chat context
              text:
                  good.length > 1
                  ? "file: uploads successful"
                  : "file: upload successful",
            },
          };
        }
        addUserMessage(msg);
        sendUserMessage(msg)
          .then((res) => {
            setConversation((prevState) => [...prevState, res.data]);
          })
          .catch((err) => {
            console.dir(err);
          });
      });
    } else {
      msg = {
        input: {
          options: { return_context: true},  // we need the chat context
          response_type: "text",
          text: submittedMsg.text,
        },
      };
      addUserMessage(msg);
      sendUserMessage(msg)
        .then((res) => {
          setConversation((prevState) => [...prevState, res.data]);
          //console.log("At 3:")
          //console.log(JSON.stringify(conversation[conversation.length-1], null, 2))
        })
        .catch((err) => {
          console.dir(err);
        });
      // addResponse("test: Ooh, that's new. Stumped me."); // fake API response
    }
  };

  return (
    <div className={`assistant ${mobile ? "assistant--mobile" : ""}`}>
      <h1 className="assistant__heading">Storm Insurance Auto-assist</h1>
      <ReactCSSTransitionGroup
        component="div"
        className="assistant__conversation"
        transitionName="example"
        transitionEnterTimeout={300}
        transitionLeave={false}
      >
        {conversation.map((msg, index) => {
          return (
            <div
              className={[
                "assistant__message",
                index === conversation.length - 1
                  ? "assistant__message--last"
                  : "",
                msg.output
                  ? "assistant__message--output"
                  : "assistant__message--input",
              ].join(" ")}
              key={`msg-${index}`}
              ref={addMessageRef}
            >
              <div className="assistant__message-content">
                <Message msg={msg} />
              </div>
            </div>
          );
        })}
        {conversation[conversation.length - 1]?.input ? (
          <div className="assistant__conversation--dots" ref={addMessageRef}>
            <div className="assistant__conversation--dot"></div>
            <div className="assistant__conversation--dot"></div>
            <div className="assistant__conversation--dot"></div>
          </div>
        ) : null}
      </ReactCSSTransitionGroup>
      <MultiInput
        className="assistant__input"
        acceptFileTypes={acceptImageTypes}
        handleInput={handleInput}
        handleSubmit={handleSubmit}
        id="my-input"
        labelClearButton="Clear message"
        labelFileInput="Send file or image"
        labelTextInput="Chat here..."
        labelSubmitButton="Submit"
        mobile={mobile}
        placeholder={mobile ? `How can i help?` : `Add your message here.`}
      />
    </div>
  );
};
