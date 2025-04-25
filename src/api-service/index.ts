export const API_URL = process.env.NEXT_PUBLIC_API_ROOT || "";
export const PROXY_ENABLED =
  process.env.NEXT_PUBLIC_PROXY_ENABLED === "TRUE" || false;
export const STATS_DATASETS_URL =
  process.env.NEXT_PUBLIC_STATS_DATASETS_URL || "";
export const MH_PLOT_DATA_URL = process.env.NEXT_PUBLIC_MH_PLOT_DATA_URL || "";
export const LANDING_PAGE_DATA_URL =
  process.env.NEXT_PUBLIC_LANDING_PAGE_DATA_URL || "";
export const PROTOTYPE_API_URL =
  process.env.NEXT_PUBLIC_PROTOTYPE_API_ROOT || "";
export const DEV_API_ROOT = process.env.NEXT_PUBLIC_DEV_API_ROOT || "";
export const PROD_API_ROOT = process.env.NEXT_PUBLIC_PROD_API_ROOT || "";
export const DATA_RELEASE_VERSION =
  process.env.NEXT_PUBLIC_DATA_RELEASE_VERSION || "";
export const PUBLICATIONS_ENDPOINT_URL =
  process.env.NEXT_PUBLIC_PUBLICATIONS_ENDPOINT_URL || "";

const WEBSITE_ENV = process.env.WEBSITE_ENV || "production";

export * from "./server";

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
    domain = PROXY_ENABLED ? "http://localhost:8010/proxy" : API_URL;
  }
  const endpointURL = domain + query;
  return await fetchURL(endpointURL);
}

export async function fetchAPIFromServer<T>(query: string): Promise<T> {
  const SERVER_API_ROOT = process.env.SERVER_API_ROOT;
  const DOMAIN_URL = SERVER_API_ROOT ? SERVER_API_ROOT : API_URL;
  let domain = PROXY_ENABLED ? "http://localhost:8010/proxy" : DOMAIN_URL;
  const endpointURL = domain + query;
  return await fetchURL(endpointURL);
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

export async function fetchReleaseNotesData(releaseTag: string) {
  const response = await fetch(
    `${LANDING_PAGE_DATA_URL.replace(
      DATA_RELEASE_VERSION,
      releaseTag,
    )}/release_metadata.json`,
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
