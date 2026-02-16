function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  delay: number,
) {
  let timeoutTimer: ReturnType<typeof setTimeout>;

  return (...args: T) => {
    clearTimeout(timeoutTimer);
    timeoutTimer = setTimeout(() => fn(...args), delay);
  };
}

export let counter = 0;

export function hasRequestsInProgress() {
  return counter >= 1;
}

export function setUpFetchInterceptor(
  onChanged: (inProgress: boolean) => void,
) {
  const onChangedDebounced = debounce(onChanged, 100);
  const { fetch: originalFetch } = window;
  window.fetch = async (...args) => {
    let [resource, config] = args;
    counter += 1;
    onChangedDebounced(hasRequestsInProgress());
    let response = await originalFetch(resource, config);
    counter -= counter > 0 ? 1 : 0;
    onChangedDebounced(hasRequestsInProgress());
    return response;
  };
}
