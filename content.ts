// src/content.ts
interface EnvVariable {
  name: string;
  environments: string[];
}

async function crawlVercelPage(): Promise<EnvVariable[]> {
  const variables: EnvVariable[] = [];

  const listContainer = document.querySelector('[data-testid="env-vars-table/container"]');
  if (!listContainer) return variables;

  // Function to extract data from a single row
  const extractRowData = (row: Element): EnvVariable | null => {
    const name = row.querySelector('[class*="env-variables-table_varName"]')?.textContent?.trim() || '';
    const environments = row.querySelector('[class*="entity_description"]')?.textContent?.trim()?.split(", ")
      .filter(env => env !== '');
    return name ? { name, environments: environments ?? [] } : null;
  };

  // Function to scroll the list by a certain distance and wait for rendering
  const scrollList = (distance: number): Promise<void> => {
    return new Promise(resolve => {
      window.scrollBy(0, distance);
      setTimeout(resolve, 500); // Adjusted timeout to allow the content to load
    });
  };

  let lastIndex = -1;
  let consecutiveNoNewRows = 0;
  const maxConsecutiveNoNewRows = 5; // Stop after no new rows are found in a few scrolls
  const maxScrollAttempts = 50; // Avoid infinite loop
  let scrollAttempts = 0;

  while (consecutiveNoNewRows < maxConsecutiveNoNewRows && scrollAttempts < maxScrollAttempts) {
    const rows = listContainer.querySelectorAll('[class*="env-variables-table_resultRow"]');
    let newRowFound = false;

    for (const row of Array.from(rows)) {
      const index = parseInt(row.getAttribute('data-index') || '-1');
      if (index > lastIndex) {
        const rowData = extractRowData(row);
        if (rowData) {
          // Check if the variable already exists
          const existingVar = variables.find(v => v.name === rowData.name);
          if (existingVar) {
            // Combine environments
            existingVar.environments = Array.from(new Set([...existingVar.environments, ...rowData.environments]));
          } else {
            variables.push(rowData);
          }
          lastIndex = index;
          newRowFound = true;
        }
      }
    }

    if (newRowFound) {
      consecutiveNoNewRows = 0;
    } else {
      consecutiveNoNewRows++;
    }

    await scrollList(500); // Scroll down by 1000px
    scrollAttempts++;
  }

  // Ensure scrolling back to the top (if necessary)
  window.scrollTo(0, 0);

  return variables;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'crawlPage') {
    const variables = crawlVercelPage();
    variables.then((res) => {
      console.log("🚀 ~ variables.then ~ res:", res)
      sendResponse({ variables: res });
    })
    return true;
  }
});