import React from "react";

class Flightlogs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      selectedFile: ""
    };

    this.selectedFile = '';

  }

  componentDidMount() {
    console.log('Loaded');
  }

  setSelectedFile(event) {
    this.selectedFile = event;
    console.log(event);
  }

  onSubmitMessage(event) {
    event.preventDefault(); // prevent navigation

    // reset
    this.setState((_state) => ({
      message: "",
    }));
  }

  render() {
    return (
      <React.Fragment>
      <section className="hero is-info">
        <div className="hero-body">
          <p className="title">
            Primary hero
          </p>
          <p className="subtitle">
            Primary subtitle
          </p>
        </div>
      </section>
      <div id="file-js-example" className="file has-name">
        <label className="file-label">
          <input className="file-input" type="file" name="resume" value={this.state.selectedFile} onClick={(e) => this.setSelectedFile(e.target.files[0])}/>
          <span className="file-cta">
            <span className="file-icon">
              <i className="fas fa-upload"></i>
            </span>
            <span className="file-label">
              Import Flight Log
            </span>
          </span>
          <span className="file-name">
            No file uploaded
          </span>
        </label>
      </div>
      <section>
      <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th>ID</th>
              <th>File name</th>
              <th>Flight Date</th>
              <th>Import date</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="flightLogs">

            <tr>
              <th>1</th>
              <td>Tacview-20221104-123129-DCS-Georgia At War v3</td>
              <td>November 4th, 2022 @ 12:31:29</td>
              <td>November 20th, 2022 @ 19:46:13</td>
              <td>
                <button type="button" className="button is-danger">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fillRule="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
                  </svg>
                </button>
              </td>
            </tr>

          </tbody>
        </table>
      </section>


      <div className="notification is-success is-light">
        <button className="delete"></button>
        Primar lorem ipsum dolor sit amet, consectetur
        adipiscing elit lorem ipsum dolor. <strong>Pellentesque risus mi</strong>, tempus quis placerat ut, porta nec nulla. Vestibulum rhoncus ac ex sit amet fringilla. Nullam gravida purus diam, et dictum <a>felis venenatis</a> efficitur.
      </div>
      </React.Fragment>
    );
  }
}

export default Flightlogs;
