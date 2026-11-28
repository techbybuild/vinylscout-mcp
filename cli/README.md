# Vinylscout CLI

Read Dutch vinyl and turntable prices from the public [Vinylscout API](https://vinylscout.nl/docs). The CLI writes JSON to stdout and errors to stderr. No API key is required.

```sh
brew tap techbybuild/vinylscout-mcp https://github.com/techbybuild/vinylscout-mcp.git
brew install techbybuild/vinylscout-mcp/vinylscout
vinylscout search 'Fleetwood Mac Rumours' --limit 1
vinylscout deals --max-price 25 --sort saved
vinylscout search studio --sandbox
```

Run `vinylscout --help` for all commands. The CLI requires Node.js 22 or later.

For testing against a local deployment, set `VINYLSCOUT_BASE_URL` to its origin.

Licensed under the MIT License.
