// src/content.ts
interface EnvVariable {
  name: string;
  environments: string[];
}

function crawlVercelPage(): EnvVariable[] {
  const variables: EnvVariable[] = [];
  const rows = document.querySelectorAll('.env-var-row');

  rows.forEach((row) => {
    const name = row.querySelector('.env-var-name')?.textContent?.trim() || '';
    const environments = Array.from(row.querySelectorAll('.env-var-environment'))
      .map(env => env.textContent?.trim() || '')
      .filter(env => env !== '');

    variables.push({ name, environments });
  });

  return variables;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'crawlPage') {
    const variables = crawlVercelPage();
    sendResponse({ variables });
  }
});