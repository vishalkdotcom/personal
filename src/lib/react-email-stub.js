// Stub for @react-email/render to prevent Cloudflare bundling issues
// This package is not needed since we only use simple HTML/text emails with Resend

export function render() {
  throw new Error("@react-email/render is not available in this environment. Use simple HTML/text emails instead.");
}

export default { render };