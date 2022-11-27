import React from "react";
import ROUTES from "Constants/routes";
import { Link } from "react-router-dom";

class Welcome extends React.Component {
  render() {
    return (
      <React.Fragment>
        <section className="section">
          <div className="container">
            <section className="hero is-info">
              <div className="hero-body">
                <p className="title">
                  Welcome to DCS War Room!
                </p>
                <p className="subtitle">
                  This is a tacview powered system used to generate statistics and data based on tacview recorded flights either by yourself or with your DCS flight group.
                </p>
              </div>
            </section>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <h2 className="title is-2">Samples!</h2>
            <div>
              <Link to={ROUTES.MOTD}>Using the Electron store.</Link> <br />
              <Link to={ROUTES.LOCALIZATION}>Changing locales.</Link> <br />
              <Link to={ROUTES.UNDOREDO}>Undo/redoing actions.</Link> <br />
              <Link to={ROUTES.CONTEXTMENU}>Custom context menu.</Link> <br />
              <Link to={ROUTES.IMAGE}>Sample image loaded.</Link> <br />
            </div>
          </div>
        </section>
      </React.Fragment>
    );
  }
}

export default Welcome;
