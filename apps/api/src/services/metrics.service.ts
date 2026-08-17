export function calculateUptimePercentage(totalChecks: number, successfulChecks: number) {
  if (totalChecks <= 0) return 0;
  return Number(((successfulChecks / totalChecks) * 100).toFixed(2));
}
