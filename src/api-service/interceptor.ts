export let counter = 0;

export function hasRequestsInProgress() {
  return counter >= 1;
}

export function setUpFetchInterceptor(
  onChanged?: (inProgress: boolean) => void,
) {
  const { fetch: originalFetch } = window;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    counter += 1;
    onChanged?.(hasRequestsInProgress());
    let response = await originalFetch(resource, config);
    counter -= counter > 0 ? 1 : 0;
    onChanged?.(hasRequestsInProgress());
    return response;
  };
}
