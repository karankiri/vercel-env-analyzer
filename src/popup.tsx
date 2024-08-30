import React from 'react';
import ReactDOM from 'react-dom';

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
      <h2 className="text-xl font-semibold mt-4 mb-2" > Environment Variables: </h2>
      <table className="min-w-full" >
        <thead>
          <tr>
            <th>Name </th>
            <th> Environments </th>
          </tr>
        </thead>
        <tbody>
          {
            variables.map(v => (
              <tr key={v.name} >
                <td>{v.name} </td>
                < td > {v.environments.join(', ')} </td>
              </tr>
            ))
          }
        </tbody>
      </table>

      < h2 className="text-xl font-semibold mt-4 mb-2" > Missing Variables: </h2>
      {
        Object.entries(missingVariables).map(([env, vars]) => (
          <div key={env} >
            <h3 className="text-lg font-medium mt-2" > {env}: </h3>
            < ul className="list-disc pl-5" >
              {
                vars.map(v => (
                  <li key={v}> {v} </li>
                ))
              }
            </ul>
          </div>
        ))
      }
    </div>
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'crawlPage' }, (response) => {
            console.log("🚀 ~ chrome.tabs.sendMessage ~ response:", response)
            if (response && response.variables) {
              const missingVariables = analyzeMissingVariables(response.variables);
              ReactDOM.render(<DisplayResults variables={response.variables} missingVariables={missingVariables} />, document.getElementById('result'));
            }
          });
        }
      });
    });
  }
});

// Render React component
// ReactDOM.render(<App />, document.getElementById('root'));