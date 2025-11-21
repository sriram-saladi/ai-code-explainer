import { useState } from "react";
import { processCode } from "../api";

export default function Explainer() {
    const [code, setCode] = useState("");
    const [action, setAction] = useState("");
    const [result, setResult] = useState(null);

    async function sendCode() {
        const data = await processCode(code, action);
        setResult(data.result);
    }

    return (
        <div>
            <h2>Code Explainer</h2>

            <textarea
                rows={5}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste code here"
            />
            <input
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="explain / optimize"
            />
            <button onClick={sendCode}>Process</button>

            {result && (
                <div className="output">
                    <h3>Code</h3>
                    <pre>{result.code}</pre>

                    <h3>What it Does</h3>
                    <pre>{result.what_it_does}</pre>

                    <h3>Visual Flow</h3>
                    <pre>{result.visual_flow}</pre>

                    <h3>Steps</h3>
                    <pre>{result.steps}</pre>

                    <h3>Key Idea</h3>
                    <pre>{result.key_idea}</pre>

                    <h3>Output</h3>
                    <pre>{result.output}</pre>
                </div>
            )}
        </div>
    );
}
