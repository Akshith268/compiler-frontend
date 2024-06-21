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
  const [statusColor, setStatusColor] = useState("red");
  const [loadingImg, setLoadingImg] = useState(null);

  const loadingURL = 'https://media4.giphy.com/media/sSgvbe1m3n93G/200w.webp?cid=790b7611z0ipof4amwfgve7p7w2705wrgj9rq26lldnttf2x&ep=v1_gifs_search&rid=200w.webp&ct=g';
  const successURL = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQWN-SLzk5eeEuA9zBJKzsM0qbvtLsKDfJ-w&s';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setStatus("PENDING");
    setOutput("");
    setStatusColor("red");
    setLoadingImg(loadingURL);

    try {
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
              setStatusColor("green");
              setLoadingImg(successURL);
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
    <div className='code'>
      <div className="code-container">
        <div className="code-editor">
          <h1>WriteYourCode.com</h1>
          <form onSubmit={handleSubmit}>
            <div className="editor-label">Language</div>
            <select name="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="cpp">C++</option>
              <option value="python">Python</option>
            </select> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <button className="button" type="submit">Submit</button>
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
          <p className="status" style={{color: statusColor}}>
            {status}
            {loadingImg && <img src={loadingImg} alt="loading" style={{ width: '20px', height: '20px', marginLeft: '10px' }} />}
          </p>
          {error && <p className="error">Error: {error}</p>}
        </div>

        <div className="output">
          <h2 className="subtitle">Output</h2>
          {status === "SUCCESS" && <textarea className='output-area' readOnly value={output} />}
        </div>
      </div>
    </div>
  );
}
