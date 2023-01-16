# Service-config-follower

Service that subscribes to and propagates Pryv.io component configuration changes from [service-config-leader](https://github.com/pryv/service-config-leader).


## Installation

Prerequisites: [Node.js](https://nodejs.org/en/download/) 16, [just](https://github.com/casey/just#installation)

Then:
1. `just setup-dev-env`
2. `just install` to install node modules

Running `just` with no argument displays the available commands (defined in `justfile`).


## Testing

```
just test [...params]
```
- Extra parameters at the end are passed on to [Mocha](https://mochajs.org/) (default settings are defined in `.mocharc.js`)
- Replace `test` with `test-detailed`, `test-debug`, `test-cover` for common presets


## License

[UNLICENSED](LICENSE)
