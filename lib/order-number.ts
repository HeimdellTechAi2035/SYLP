/** Human-friendly order references, e.g. HM-1042. Not used as a security token — Order.id (cuid) is. */
export function generateOrderNumber(sequence: number): string {
  return `HM-${1000 + sequence}`;
}
