import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./style.css";

interface EnvVariable {
  name: string;
  environments: string[];
}

function analyzeMissingVariables(variables: EnvVariable[]): Record<string, string[]> {
  const environments = ['Production', 'Preview', 'Development'];
  const missingVariables: Record<string, string[]> = {};

  environments.forEach(env => {
    missingVariables[env] = variables
      .filter(v => !v.environments.includes(env))
      .map(v => v.name);
  });

  return missingVariables;
}

function DisplayResults({ variables, missingVariables }: { variables: EnvVariable[], missingVariables: Record<string, string[]> }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mt-4 mb-2">Missing Variables:</h2>
      {Object.entries(missingVariables).map(([env, vars]) => (
        <div key={env}>
          <h3 className="text-lg font-medium mt-2">{env}:</h3>
          <ul className="list-disc pl-5">
            {vars.map(v => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2 className="text-2xl font-semibold mt-4 mb-2">Environment Variables:</h2>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium text-gray-700">Name</th>
            <th className="px-6 py-3 border-b border-gray-300 text-left text-sm font-medium text-gray-700">Environments</th>
          </tr>
        </thead>
        <tbody>
          {variables.map(v => (
            <tr key={v.name} className="hover:bg-gray-100">
              <td className="border px-6 py-4">{v.name}</td>
              <td className="border px-6 py-4">{v.environments.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IndexPopup() {
  const [data, setData] = useState("");
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [missingVariables, setMissingVariables] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false); // {{ edit_1 }}

  const handleAnalyzeClick = () => {
    setLoading(true); // {{ edit_2 }}
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'crawlPage' }, (response) => {
          setLoading(false); // {{ edit_3 }}
          if (response && response.variables) {
            const missingVars = analyzeMissingVariables(response.variables);
            setVariables(response.variables);
            setMissingVariables(missingVars);
          }
        });
      }
    });
  }

  return (
    <div className="p-10 min-w-[500px]"> {/* {{ edit_1 }} */}
      <h1 className="text-2xl font-bold mb-4">Vercel Env Analyzer</h1>
      <button id="analyzeBtn" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={handleAnalyzeClick}>
        Analyze Variables
      </button>
      {loading && <div className="loader">Loading...</div>} {/* {{ edit_4 }} */}
      {
        variables.length > 0 ?
          <DisplayResults variables={variables} missingVariables={missingVariables} />
          : null
      }
    </div>
  );
}

export default IndexPopup;
