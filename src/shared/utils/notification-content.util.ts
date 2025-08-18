export function buildBatchContent(notifications: Array<any>): string {
  const items = notifications
    .map((n) => {
      if (n.channel === 'SYSTEM' && (n.systemData || n.system)) {
        return `<li>${n.systemData?.content ?? n.system?.content}</li>`;
      }
      return '';
    })
    .join('');

  return `<ul>${items}</ul>`;
}