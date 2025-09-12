// Stub for @react-email/render to prevent Cloudflare bundling issues
// This package is not needed since we only use simple HTML/text emails

export function render() {
  throw new Error("@react-email/render is not available in Cloudflare Workers. Use simple HTML/text emails instead.");
}

export default { render };