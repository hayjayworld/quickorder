let counter = 1000;

export function generateOrderNumber(): string {
  counter += 1;
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `#QO-${timestamp}${random}`;
}