import React, { useState } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import '../styles/code.scss';

export default function Code() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [input, setInput] = useState(""); 
  const [output, setOutput] = useState("");
  const [jobId, setJobId] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState(""); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("PENDING");
    setOutput("");

    try{
      const response = await axios.post('https://compilerbackend-qkvcy69k.b4a.run/compile', {
        language: language,
        code: code,
        input: input
      });

      const jobId = response.data.jobId;
      setJobId(jobId);

      const intervalId = setInterval(async () => {
        try {
          const responsedata = await axios.get(`https://compilerbackend-qkvcy69k.b4a.run/status/${jobId}`);
          const { success, error, job } = responsedata.data;

          if (success) {
            const { status: jobStatus, output: jobOutput } = job;
            setStatus(jobStatus);
            if (jobStatus !== "PENDING") {
              setOutput(jobOutput);
              clearInterval(intervalId);
            }
          } else {
            setStatus("ERROR");
            setOutput(`Error: ${error}`);
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error("Interval Error:", err);
          setStatus("ERROR");
          setOutput(`Error: ${err.message}`);
          clearInterval(intervalId);
        }
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      setStatus("ERROR");
      if (error.response) {
        setError(error.response.data.error || "Unknown error occurred");
      } else {
        setError(error.message);
      }
    }
  }

  return (
    <div>
      <div className="code-container">
      <div className="code-editor">
        <h1>Write your Code</h1>
        <form onSubmit={handleSubmit}>
          <div className="editor-label">Language</div>
          <select name="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
          </select>

          <div className="editor-label">Code</div>
          <Editor
            className='Editor'
            height="80vh"
            width="120vh"
            defaultPath="code.cpp"
            language={language}
            value={code}
            onChange={(value) => setCode(value)}
            theme="vs-dark"
          />

          <div className="editor-label">Input</div>
          <textarea name="input" value={input} onChange={(e) => setInput(e.target.value)} />
          <br />
          <button className="button" type="submit">Submit</button>
        </form>
      </div>
      </div>

      <div className="output-container">
        <div className="status-container">
          <h2 className="subtitle">Status</h2>
          <p className="status">{status}</p>
          {error && <p className="error">Error: {error}</p>}
        </div>

        {/* <div className="job-id-container">
          <h2 className="subtitle">Job ID</h2>
          <p className="job-id">{jobId && `JobId: ${jobId}`}</p>
        </div> */}

        <div className="output">
          <h2 className="subtitle">Output</h2>
          {status === "SUCCESS" && <pre>{output}</pre>}
        </div>
      </div>
    </div>
  );
}
