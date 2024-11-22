import React from 'react';

export default function Chat({ title }) {
  return (
    <div style={styles.chatContainer}>
      <h2>{title || "Chat Room"}</h2>
      <p>Welcome to the chat!</p>
    </div>
  );
}

const styles = {
  chatContainer: {
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    width: "300px",
    margin: "20px auto",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f9f9f9",
  },
};
