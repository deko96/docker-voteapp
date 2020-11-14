# Frontend for the voting result app

## Getting started

```
git clone git@github.com:sourcemx-academy/voting-result-frontend.git
npm install
npm start
```

Go to http://localhost:4444

It expects that your `result` container is available at `http://localhost:5001` on the host, and returns JSON result in the format:
```json
{
    "candidates": {
        "JB": 12345,
        "DJT": 12345
    },
    "states": {
        "AL": {
            "JB": 12,
            "DJT": 12
        }
        ...
    }
}
```
