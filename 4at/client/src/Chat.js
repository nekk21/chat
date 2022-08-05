import React, { useState } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useMutation,
  useSubscription,
} from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";

import { Container, Form, Row, Col, Button } from "react-bootstrap";

const link = new WebSocketLink({
  uri: "ws://localhost:4000",
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link,
  uri: "http://localhost:4000/",
  cache: new InMemoryCache(),
});

const GET_MESSAGES = gql`
  subscription {
    messages {
      id
      user
      content
    }
  }
`;

const POST_MESSAGES = gql`
  mutation ($user: String!, $content: String!) {
    postMessage(user: $user, content: $content)
  }
`;

const Messages = ({ user }) => {
  const { data } = useSubscription(GET_MESSAGES);
  if (!data) return null;
  return (
    <>
      {data.messages.map(({ id, user: messageUser, content }) => (
        <div
          style={{
            display: "flex",
            justifyContent: user === messageUser ? "flex-end" : "flex-start",
            paddingBottom: "1em",
          }}
          key={id}
        >
          {user !== messageUser && (
            <div
              style={{
                height: 50,
                width: 50,
                marginRight: "0.5em",
                border: "2px solid #e5e6ea",
                borderRadius: 25,
                textAlign: "center",
                fontSize: "18pt",
                paddingTop: "5px",
              }}
            >
              {messageUser.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div
            style={{
              background: user === messageUser ? "#58bf65" : "#e5e6ea",
              color: user === messageUser ? "white" : "black",
              padding: "1em",
              borderRadius: "1em",
              maxWidth: "60%",
            }}
          >
            {content}
          </div>
        </div>
      ))}
    </>
  );
};

const Chat = () => {
  const [state, setState] = useState({
    user: "Max",
    content: "",
  });

  const [postMessage] = useMutation(POST_MESSAGES);

  const onSend = () => {
    if (state.content.length > 0) {
      postMessage({ variables: state });
    }

    setState({ ...state, content: "" });
  };

  return (
    <Container>
      <Messages user={state.user} />
      <Row>
        <Col xs={2}>
          <Form.Group className="mb-3" controlId="user">
            <Form.Label>User</Form.Label>
            <Form.Control
              placeholder="User"
              value={state.user}
              onChange={(e) => setState({ ...state, user: e.target.value })}
            />
          </Form.Group>
        </Col>
        <Col xs={8}>
          <Form.Group className="mb-3" controlId="content">
            <Form.Label>Content</Form.Label>
            <Form.Control
              placeholder="Content"
              value={state.content}
              onChange={(e) => setState({ ...state, content: e.target.value })}
              onKeyUp={(e) => {
                if (e.keyCode === 13) {
                  onSend();
                }
              }}
            />
          </Form.Group>
        </Col>
        <Col xs={2} style={{ display: "flex", alignItems: "end" }}>
          <Button
            className="mb-3"
            variant="primary"
            style={{ width: "100%" }}
            onClick={onSend}
          >
            Send message
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

const App = () => (
  <ApolloProvider client={client}>
    <Chat />
  </ApolloProvider>
)

export default App;

