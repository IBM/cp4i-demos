import React from "react";

import { Assistant } from "../components";
import "./StandardPage.scss";

export const StandardPage = ({ children, ...props }) => {
  return (
    <div className="standard-page">
      <Assistant />
    </div>
  );
};
