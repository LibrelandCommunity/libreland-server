# Archive2
This is mostly a superset of `../archiver/`. All the data in `./data` is straight off the API, without any transformation. It is as complete as I could get it.

`game-server.ts` is a simple HTTP API to serve some parts of this content. It is read-only for now, and all data is read from the flat .json files.

All the other code is for crawling the API, and `./lib/schemas.ts` has a bunch of Zod schemas



## How to play Anyland now that it's closed?
I host a `game-server.ts` instance with all the data in this repo. The end goal is to have a mod to set these, but for now you can play Anyland by editing your `hosts` file and adding these lines:
```
57.128.83.145 app.anyland.com
57.128.83.145 d6ccx151yatz6.cloudfront.net
57.128.83.145 d26e4xubm8adxu.cloudfront.net
#57.128.83.145 steamuserimages-a.akamaihd.net
```

This makes your computer redirect all API calls headed for those domains to my server (57.128.83.145) instead.

(You might want to keep the `steamuserimages` one commented when you stop playing Anyland as it might break other games)


How to edit your `hosts` file (Windows): see https://docs.rackspace.com/docs/modify-your-hosts-file
How to edit your `hosts` file (Linux): `sudo nano /etc/hosts`



## Hosting the game-server.ts
You just need to run the code using `bun` (I just run it ad-hoc in a docker container) and reverse-proxy the correct domains to the correct ports.


Here is how I run it with Caddy:
```Caddyfile
# al-gameserver is the networked docker container name
# NOTE: Anyland calls the server via http:
# NOTE: don't try to set `https://` for domains you don't own, since Caddy won't be able to get the certs

http://al-readonly-api.offlineland.io, https://al-readonly-api.offlineland.io, http://app.anyland.com {
        header -server

        reverse_proxy http://al-gameserver:8000
}

http://al-cdn-thingdefs.offlineland.io, https://al-cdn-thingdefs.offlineland.io, http://d6ccx151yatz6.cloudfront.net {
        header -server

        reverse_proxy http://al-gameserver:8001
}

http://al-cdn-areabundles.offlineland.io, https://al-cdn-areabundles.offlineland.io, http://d26e4xubm8adxu.cloudfront.net {
        header -server

        reverse_proxy http://al-gameserver:8002
}

http://al-cdn-steamuserimages.offlineland.io, https://al-cdn-steamuserimages.offlineland.io, http://steamuserimages-a.akamaihd.net {
        header -server

        reverse_proxy http://al-gameserver:8003
}
```



## Contributing
There are three main things to do here:
- making a read-write API server
- modding the game to set the server domains so that people don't have to edit their `hosts` file
- modding the game to re-write the multiplayer (voice & position syncing)

Hit us on the [Anyland Community Discord](https://discord.gg/ahAs7U3) if you want to help!


### Making a read-write API server
You'll need to:
- Load all of this repo's data into a proper database
- Implement all the API endpoints
This is mostly tedium, but nothing too hard. The game client is pretty forgiving for HTTP calls that fail, we have most of the HTTP API documented, and full network logs along with a video recording for anything that isn't explicitely documented.

The current `game-server.ts` listens on 4 different ports because it handles all 4 endpoints at once (API, 2 thingdefs CDN, areabundle CDNs, steamuserimages CDN), and the webserver lib I use isn't really built with virtual hosts (apache's vhosts, nginx's server blocks) in mind, and Caddy doesn't handle reverse-proxying to a host+path (ie. no `reverse_proxy http://al-gameserver:8000/cdn-thingdefs/`). This is an implementation detail, feel free to go at it differently


### Modding the server domains
Look for a way to replace these values. 
- `app.anyland.com`  => `al-readonly-api.offlineland.io`
- `d6ccx151yatz6.cloudfront.net` => `al-cdn-thingdefs.onlineland.io`
- `d26e4xubm8adxu.cloudfront.net` => `al-cdn-areabundles.offlineland.io`
- `steamuserimages-a.akamaihd.net` => `al-cdn-steamuserimages.offlineland.io`
Ideally you'd provide a pre-launcher where the user can set these, but either reading them from a text file or hardcoding them is fine too.


### Rewriting the multiplayer
No clues about that, the game uses PUN and we want to rip it out, which involves decompiling the game (Unity) and making a mod (probably with bepInEx). We could go full P2P or write our own OpenSource Anyland Multiplayer Server, whichever strikes your fancy.

