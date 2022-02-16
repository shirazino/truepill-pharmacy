import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import Nav from "./navbar";
import "./style/style.css";

ReactDOM.render(
  <React.StrictMode>
    <Nav />
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
