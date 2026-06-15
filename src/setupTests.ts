import '@testing-library/jest-dom'

// pdfjs-dist (pulled in transitively via parseUpload) references DOMMatrix at
// module load time, which jsdom does not provide. Stub it so component tests
// that import parseUpload can load without crashing.
if (typeof (globalThis as { DOMMatrix?: unknown }).DOMMatrix === 'undefined') {
  ;(globalThis as { DOMMatrix?: unknown }).DOMMatrix = class {}
}
