export const API_URL = import.meta.env.VITE_API_ROOT || "";
export const PROXY_ENABLED =
  import.meta.env.VITE_PROXY_ENABLED === "TRUE" || false;
export const STATS_DATASETS_URL = import.meta.env.VITE_STATS_DATASETS_URL || "";
export const MH_PLOT_DATA_URL = import.meta.env.VITE_MH_PLOT_DATA_URL || "";
export const LANDING_PAGE_DATA_URL =
  import.meta.env.VITE_LANDING_PAGE_DATA_URL || "";
export const PROTOTYPE_API_URL = import.meta.env.VITE_PROTOTYPE_API_ROOT || "";
export const DEV_API_ROOT = import.meta.env.VITE_DEV_API_ROOT || "";
export const PROD_API_ROOT = import.meta.env.VITE_PROD_API_ROOT || "";
export const PUBLICATIONS_ENDPOINT_URL =
  import.meta.env.VITE_PUBLICATIONS_ENDPOINT_URL || "";
export const GENOME_BROWSER_DATA_URL =
  import.meta.env.VITE_GENOME_BROWSER_DATA_URL || "";

export const PROTOTYPE_DATA_ROOT =
  import.meta.env.VITE_PROTOTYPE_DATA_ROOT || "";

const WEBSITE_ENV = import.meta.env.WEBSITE_ENV || "production";

const httpCodesError500 = [500, 501, 502, 503, 504, 506];

export async function fetchURL<T>(endpointURL: string): Promise<T> {
  if (WEBSITE_ENV === "local") {
    console.log(`fetching data from ${endpointURL}`);
  }
  try {
    const response = await fetch(endpointURL);
    if (response.status === 204 || response.status === 404) {
      return Promise.reject("No content");
    }
    if (httpCodesError500.includes(response.status)) {
      return Promise.reject(`500 error - ${response.status}`);
    }
    if (!response.ok) {
      return Promise.reject(`An error has occured: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    return Promise.reject("Error: " + error);
  }
}

export async function fetchAPI<T>(query: string): Promise<T> {
  let domain: string;
  if (location.hostname === "nginx.mousephenotype-dev.org") {
    domain = PROTOTYPE_API_URL;
  } else if (location.hostname === "dev.mousephenotype.org") {
    domain = DEV_API_ROOT;
  } else if (location.hostname === "nginx.mousephenotype-prod.org") {
    domain = PROD_API_ROOT;
  } else if (location.hostname === "mousephenotype.org") {
    domain = PROD_API_ROOT;
  } else {
    domain = PROXY_ENABLED ? "http://localhost:5173/proxy" : API_URL;
  }
  const endpointURL = domain + query;
  return await fetchURL(endpointURL);
}

export async function fetchData<T>(path: string): Promise<T> {
  const endpointURL = PROTOTYPE_DATA_ROOT + path;
  try {
    const response = await fetch(endpointURL);
    if (response.status === 204 || response.status === 404) {
      return Promise.reject("No content");
    }
    return await response.json();
  } catch (error) {
    return Promise.reject("Error: " + error);
  }
}

export async function fetchDatasetFromS3(datasetId: string) {
  const response = await fetch(`${STATS_DATASETS_URL}/${datasetId}.json`);
  if (!response.ok) {
    return Promise.reject(`An error has occured: ${response.status}`);
  }
  return await response.json();
}

export async function fetchMHPlotDataFromS3(mpId: string) {
  const response = await fetch(`${MH_PLOT_DATA_URL}/${mpId}.json`);
  if (!response.ok) {
    return Promise.reject(`An error has occured: ${response.status}`);
  }
  return await response.json();
}

export async function fetchLandingPageData(
  landingPageId: string,
  fetchOpts = {},
) {
  const response = await fetch(
    `${LANDING_PAGE_DATA_URL}/${landingPageId}.json`,
    fetchOpts,
  );
  if (!response.ok) {
    return Promise.reject(`An error has occured: ${response.status}`);
  }
  return await response.json();
}

export async function fetchPublicationEndpoint(query: string) {
  const endpointURL = PUBLICATIONS_ENDPOINT_URL + query;
  return await fetchURL(endpointURL);
}
