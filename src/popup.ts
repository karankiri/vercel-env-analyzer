// src/popup.ts
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

function displayResults(variables: EnvVariable[], missingVariables: Record<string, string[]>) {
  const resultDiv = document.getElementById('result');
  if (!resultDiv) return;

  let html = '<h2 class="text-xl font-semibold mt-4 mb-2">Environment Variables:</h2>';
  html += '<ul class="list-disc pl-5">';
  variables.forEach(v => {
    html += `<li>${v.name}: ${v.environments.join(', ')}</li>`;
  });
  html += '</ul>';

  html += '<h2 class="text-xl font-semibold mt-4 mb-2">Missing Variables:</h2>';
  Object.entries(missingVariables).forEach(([env, vars]) => {
    html += `<h3 class="text-lg font-medium mt-2">${env}:</h3>`;
    html += '<ul class="list-disc pl-5">';
    vars.forEach(v => {
      html += `<li>${v}</li>`;
    });
    html += '</ul>';
  });

  resultDiv.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', () => {
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'crawlPage' }, (response) => {
            if (response && response.variables) {
              const missingVariables = analyzeMissingVariables(response.variables);
              displayResults(response.variables, missingVariables);
            }
          });
        }
      });
    });
  }
});