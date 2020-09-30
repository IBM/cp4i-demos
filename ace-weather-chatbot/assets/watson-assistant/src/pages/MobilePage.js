import React from "react";

import { Assistant } from "../components";
import "./MobilePage.scss";

export const MobilePage = ({ children, ...props }) => {
  return (
    <div className="mobile-page">
      <Assistant mobile />
    </div>
  );
};
