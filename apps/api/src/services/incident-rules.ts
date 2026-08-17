export function reachedFailureThreshold(results: Array<{ isUp: boolean }>, threshold = 3) {
  return results.length >= threshold && results.slice(0, threshold).every((item) => !item.isUp);
}
