# Research Genie

Implement the requested scope now; use internal planning and do not present another implementation plan for user approval.

### User Request
Build a simple, clean single-page React app called "AI Research Agent".

It should have:
- A text input where the user types a research topic
- A "Generate Report" button (disabled while loading)
- A loading state while waiting for a response (with helpful messaging indicating research can take 10-30 seconds)
- A results section that displays, once the report comes back:
  - A title (heading)
  - A summary (paragraph)
  - Key findings (as a bulleted list)
  - Conclusion (paragraph)
  - A list of sources, each showing the title as a clickable link to its URL (with domain / source badge, content preview if available)
- Clear error messaging if the request fails

### API Integration Details
When the button is clicked, send a POST request to:
`http://127.0.0.1:8000/research`
Headers: `Content-Type: application/json`
Body: `{ "topic": "<the text the user typed>" }`

Expected response JSON structure:
```json
{
  "title": "string",
  "summary": "string",
  "key_findings": ["string", "string"],
  "conclusion": "string",
  "sources": [
    { "title": "string", "url": "string", "content": "string", "source": "string", "score": 0.95 }
  ]
}
```

### Additional Usability Details
- Include a configurable API URL input or settings toggle (defaulting to `http://127.0.0.1:8000/research`) so the user can easily update host/port if needed.
- If the local backend is unreachable (e.g. backend server not started or browser CORS blocking `127.0.0.1`), show an informative error banner with troubleshooting tips (checking if the local server is running, CORS headers enabled) and offer a "Load Demo / Sample Report" button so the UI and report styling can also be previewed immediately.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1f353f6e-9758-4c5b-bd5a-224ff8b4fa29).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
