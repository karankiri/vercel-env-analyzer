// src/content.ts
interface EnvVariable {
  name: string;
  environments: string[];
}

function crawlVercelPage(): EnvVariable[] {
  const variables: EnvVariable[] = [];
  const rows = document.querySelectorAll('[class^="env-variables-table_resultRow"]');
  console.log("🚀 ~ crawlVercelPage ~ rows:", rows)

  rows.forEach((row) => {
    const name = row.querySelector('[class^="env-variables-table_varName"]')?.textContent?.trim() || '';
    console.log("🚀 ~ rows.forEach ~ name:", name)
    const environments = row.querySelector('[class^="entity_description"]')?.textContent?.trim()?.split(", ")
      .filter(env => env !== '');
    console.log("🚀 ~ rows.forEach ~ environments:", environments)

    variables.push({ name, environments: environments ?? [] });
  });

  return variables;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'crawlPage') {
    const variables = crawlVercelPage();
    sendResponse({ variables });
  }
});