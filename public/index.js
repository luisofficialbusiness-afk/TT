import Head from "next/head";
import Script from "next/script";

export default function Home() {
  return (
    <>
      <Head>
        <title>Terminal Talker V1</title>
      </Head>

      <div id="messages" style={{ padding: "10px", overflowY: "auto", height: "80vh" }}></div>
      <div id="typing-indicator" className="hidden" style={{ padding: "4px", fontStyle: "italic" }}>
        Someone is typing...
      </div>
      <input
        id="terminal-input"
        placeholder="Type your message or command..."
        style={{
          width: "100%",
          padding: "8px",
          border: "none",
          background: "#111",
          color: "#0f0",
          fontFamily: "monospace",
          fontSize: "14px"
        }}
      />
      <link rel="stylesheet" href="/style.css" />
      <Script src="/script.js" strategy="afterInteractive" />
    </>
  );
}
