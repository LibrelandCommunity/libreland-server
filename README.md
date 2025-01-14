# Libreland Game Server

This is an open source game server for the now defunct game [Anyland](https://anyland.com).

### **This server is freely available under the [AGPL-3.0 license](https://www.gnu.org/licenses/agpl-3.0.en.html). This license requires that if you run this server and allow users to access it over any network, you must make the complete source code available to those users - including both the original code and any modifications you make. If you are not comfortable with this, do not use this server or any of the code in this repository.**

## About

This server is built on the original work started by Cyel. Thank you Cyel for coming out of nowhere and helping this community to cross the finish line in the final hours. Not all heroes wear capes, but many of them have anime profile pictures.

## Goals

The goal of this project is to provide a long-term solution for current and future explorers to access the Anyland archive.

Currently the server is in a very early stage of development and is not yet ready for regular use.

However the plan is to provide a fully functional server that can be easily self-hosted allowing anyone to run their own singleplayer or multiplayer Anyland server.

## Content Status

* Available Areas: 31,879
* Available Thing Defs: Still needs to be calculated

## Development Status

The server has been **significantly** refactored from the original codebase to be more modular and easier to understand.

There are Swagger docs available at `/swagger` on for each server:

* [API Server - http://localhost:8000/swagger](http://localhost:8000/swagger)
* [Area Bundles Server - http://localhost:8001/swagger](http://localhost:8001/swagger)
* [Thing Defs Server - http://localhost:8002/swagger](http://localhost:8002/swagger)
* [UGC Images Server - http://localhost:8003/swagger](http://localhost:8003/swagger)

You can find the current API implementation status in [Implemented.md](./Implemented.md).

Generated documentation on the various data types and relationships can be found in the [docs](./docs) directory:

* [Data Structure Overview](./docs/data-structure.md)
* [Data Relationships](./docs/data-relationships.md)
* [API Endpoints](./docs/api-endpoints.md)
* [Area Format (Original)](./docs/area-format-original.md)
* [Area Structure](./docs/archive-area-structure.md)
* [Forum Structure](./docs/archive-forum-structure.md)
* [Placement Structure](./docs/archive-placement-structure.md)
* [Thing Structure](./docs/archive-thing-structure.md)
* [Thing Format](./docs/thing-format.md)
* [Thing Format (Original)](./docs/thing-format-original.md)
* [User Structure](./docs/archive-user-structure.md)

## Development

To run the server, you need to have Bun and Caddy installed.

First modify your HOSTS file to include the following:

```
127.0.0.1  app.anyland.com
127.0.0.1  anyland.com
127.0.0.1  d6ccx151yatz6.cloudfront.net
127.0.0.1  d26e4xubm8adxu.cloudfront.net
127.0.0.1  steamuserimages-a.akamaihd.net
```

Then start the reverse proxy server:

```bash
caddy run --config ./Caddyfile
```

And then finally start the API servers:

```bash
bun run src/index.ts
```

### Running in Docker

You will need to first modify your HOSTS file to include the following:

```
127.0.0.1  app.anyland.com
127.0.0.1  anyland.com
127.0.0.1  d6ccx151yatz6.cloudfront.net
127.0.0.1  d26e4xubm8adxu.cloudfront.net
127.0.0.1  steamuserimages-a.akamaihd.net
```

Then run the following command:

```bash
docker compose up
```

This will start the reverse proxy server and the API servers.


## TODO

* Add documentation for using the [Goldberg Emulator](https://mr_goldberg.gitlab.io/goldberg_emulator/)
* Start documenting PUN endpoints, look into forcing websocket mode and running captures