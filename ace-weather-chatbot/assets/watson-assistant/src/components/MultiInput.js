import React, { useState, useEffect, useRef } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import "./MultiInput.scss";
import { Button } from "carbon-components-react";
import { Add16, ArrowRight16, Close16 } from "@carbon/icons-react";

export const MultiInput = ({
  acceptFileTypes,
  className,
  id,
  labelClearButton,
  labelFileInput,
  labelTextInput,
  labelSubmitButton,
  handleInput,
  handleSubmit,
  mobile,
  placeholder,
  value,
}) => {
  const [msg, setMessage] = useState({ text: "", files: [] });
  const [expectingDrop, setExpectingDrop] = useState(false);
  const theInput = useRef();

  useEffect(() => {
    if (value) {
      if (typeof value === "string") {
        setMessage({
          text: value,
        });
      } else {
        setMessage(value);
      }
    }
  }, []);

  const handleClick = () => {
    handleSubmit(msg);
    setMessage({ text: "", files: [] });
    theInput.current.focus();
  };

  const handleFileChange = (ev) => {
    if (ev.target.files.length > 0) {
      const newMsg = {
        ...msg,
        files: ev.target.files,
      };
      handleSubmit(newMsg);
      setMessage({ text: "", files: [] });
      theInput.current.focus();
    }
  };

  const handleTextInput = (ev) => {
    const newMsg = {
      ...msg,
      text: ev.target.value,
    };
    setMessage(newMsg);
    handleInput(newMsg);
  };

  const handleTextChange = (ev) => {
    // no need to do anything here, but does prevent warning
    // console.log("change", ev.target.value);
  };

  const handleKeyDown = (ev) => {
    if (ev.key === "Enter") {
      handleSubmit(msg);
      setMessage({ text: "", files: [] });
    } else if (ev.key === "Escape") {
      setMessage({ text: "", files: [] });
    }
  };

  const handleDragEnd = (ev) => {
    setExpectingDrop(false);
  };

  const handleDragOver = (ev) => {
    ev.preventDefault();
    setExpectingDrop(true);
  };

  const handleDrop = (ev) => {
    ev.preventDefault();

    // Use DataTransfer interface to access the file(s)
    if (ev.dataTransfer.files) {
      const newMsg = {
        ...msg,
        files: ev.dataTransfer.files,
      };
      handleSubmit(newMsg);
      setMessage({ text: "", files: [] });
    }

    theInput.current.focus();
  };

  const handleClear = () => {
    const newMsg = {
      text: "",
      files: [],
    };
    setMessage(newMsg);
    handleInput(newMsg);

    theInput.current.focus();
  };

  return (
    <div
      className={`multi-input ${
        expectingDrop ? "multi-input--expecting-drop" : ""
      } ${className} ${mobile ? "multi-input--mobile" : ""}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      onDragLeave={handleDragEnd}
    >
      <div className="multi-input__file-container">
        <label
          tabIndex="0"
          aria-disabled="false"
          className="multi-input__file bx--btn bx--btn--tertiary bx--btn--icon-only bx--tooltip__trigger bx--tooltip--a11y bx--tooltip--top bx--tooltip--align-start"
          aria-label={labelFileInput}
          htmlFor={`file-input-${id}`}
        >
          <Add16 />
          <span className="bx--assistive-text">{labelFileInput}</span>
        </label>
        <input
          id={`file-input-${id}`}
          className="bx--visually-hidden"
          type="file"
          tabIndex="-1"
          accept={acceptFileTypes}
          onChange={handleFileChange}
        />
      </div>
      <div className="multi-input__message">
        <label
          className={`multi-input__message-label${
            mobile ? " bx--visually-hidden" : ""
          }`}
          htmlFor={id}
        >
          {labelTextInput}
        </label>
        <input
          className={`multi-input__message-input bx--text-input ${
            mobile ? "bx--text-input--light" : ""
          }`}
          id={id}
          type="text"
          placeholder={placeholder}
          onInput={handleTextInput}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          value={msg.text}
          ref={theInput}
        />
        <Button
          className="multi-input__clear bx--btn--icon-only"
          kind="ghost"
          hidden={!msg.text && (!msg.files || msg.files.length === 0)}
          type="button"
          renderIcon={Close16}
          iconDescription="Clear icon button"
          aria-label={labelClearButton}
          onClick={handleClear}
        />
      </div>
      <Button
        className="multi-input__submit"
        kind="primary"
        disabled={!msg.text && (!msg.files || msg.files.length === 0)}
        type="button"
        hasIconOnly
        renderIcon={ArrowRight16}
        tooltipAlignment="end"
        tooltipPosition="top"
        iconDescription={labelSubmitButton}
        onClick={handleClick}
      />
    </div>
  );
};
