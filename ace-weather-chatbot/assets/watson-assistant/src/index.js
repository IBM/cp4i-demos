import React from "react";
import ReactDOM from "react-dom";
import { Route, HashRouter as Router } from "react-router-dom";
import { StandardPage, MobilePage } from "./pages";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <Router>
    <Route path="/standard" component={StandardPage} />
    <Route path="/mobile" component={MobilePage} />
    <Route exact path="/" component={StandardPage} />
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
