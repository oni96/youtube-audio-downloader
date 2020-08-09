import React, { Component } from "react";
import axios from "axios";
import openSocket from "socket.io-client";
import "./App.css";
import {
  Container,
  Row,
  Button,
  Input,
  Form,
  Col,
  Progress,
  Jumbotron,
} from "reactstrap";

const URL = "/";
const socket = openSocket(URL);

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      urlText: "",
      respData: "",
      percentage: "",
      dataToBeDownloaded: 0,
      dataDownloaded: 0,
      blobData: null,
      videoName: "",
      videoUploader: "",
    };
  }

  handleSubmit = (e) => {
    e.preventDefault();

    axios
      .post(
        URL,
        { url: this.state.urlText },
        {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            // console.log(progressEvent);
            this.setState({ dataDownloaded: progressEvent.loaded });
          },
        }
      )
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        this.setState({ blobData: url });
      });
  };

  handleTextChange = (e) => {
    this.setState({ urlText: e.target.value });
  };

  componentDidMount() {
    socket.on("progressEventSocket", (data) => {
      this.setState({ percentage: data[0] });
    });

    socket.on("downloadCompletedServer", (data) => {
      // console.log(data[0]);
      this.setState({ dataToBeDownloaded: data[0] });
    });

    socket.on("videoDetails", (data) => {
      this.setState({ videoName: data[0] });
      this.setState({ videoUploader: data[1] });
    });
  }

  render() {
    return (
      <Container>
        <Form onSubmit={(e) => this.handleSubmit(e)}>
          <Row>
            <Col>
              <Input
                required
                type="text"
                placeholder="URL"
                value={this.state.urlText}
                onChange={(e) => this.handleTextChange(e)}
              ></Input>
            </Col>
          </Row>
          <Row style={{ textAlign: "center", marginTop: "10px" }}>
            <Col>
              <Button type="submit" color="primary" size="lg">
                Start Process
              </Button>
            </Col>
          </Row>
        </Form>

        <Row>
          <Col>
            {this.state.videoName !== "" ? (
              <Jumbotron style={{ marginTop: "10px" }}>
                <h1>Title:{this.state.videoName}</h1>
                <p>Uploaded By: {this.state.videoUploader}</p>
              </Jumbotron>
            ) : (
              ""
            )}
          </Col>
        </Row>

        <Row className="progressBarRow">
          <Col xs="12">
            <Progress
              animated={this.state.percentage === 100 ? false : true}
              value={this.state.percentage}
            >
              Warming up the router
            </Progress>
          </Col>
        </Row>

        <Row className="progressBarRow">
          <Col xs="12">
            <Progress
              animated={
                (this.state.dataDownloaded * 100) /
                  this.state.dataToBeDownloaded ===
                100
                  ? false
                  : true
              }
              color="success"
              value={
                this.state.dataToBeDownloaded > 0
                  ? (this.state.dataDownloaded * 100) /
                    this.state.dataToBeDownloaded
                  : 0
              }
            >
              You're Hacking Now. Be Patient :)
            </Progress>
          </Col>
        </Row>

        <Row className="downloadButton">
          <Col>
            {this.state.blobData !== null ? (
              <div>
                <p>Congratulations! You've hacked into the Pentagon</p>
                <a
                  href={this.state.blobData}
                  download={this.state.videoName + ".mp3"}
                >
                  <Button color="danger" size="lg">
                    Download
                  </Button>
                </a>
              </div>
            ) : (
              ""
            )}
          </Col>
        </Row>
      </Container>
    );
  }
}
