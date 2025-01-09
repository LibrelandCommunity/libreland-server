import { NetRequest, mkWriter } from "./nsq";
import { headersToObject } from "./utils";


//const ANYLAND_ROOT =  "https://app.anyland.com"
const ANYLAND_ROOT =  "https://alhttps.offlineland.io" // This proxies to http://app.anyland.com because the SSL cert is for manyland.com



export const mkApiReqs = async (sendNetRequest: (req: NetRequest) => void) => {
    

    // These functions abstract the API calls, headers, and send the req/res to NSQ for future reference or in case I mess something up in the archival process.

    const get = async (reason: string, path: string) => {
        const now = new Date();
        const url = ANYLAND_ROOT + path;
        const headers = {
            'User-Agent': 'UnityPlayer/2018.1.0f2 (UnityWebRequest/1.0, libcurl/7.51.0-DEV)',
            'Accept': '*/*',
            'Accept-Encoding': 'identity',
            'X-Unity-Version': '2018.1.0f2',
            'Cookie': process.env.ANYLAND_COOKIE!,
        }

        const res = await fetch(url, { headers })

        const bodyTxt = await res.clone().text();
        sendNetRequest({
            ts: now.valueOf(),
            ts_iso: now.toISOString(),
            url,
            reason,
            method: "GET",
            reqHeaders: headers,
            reqbody: null,
            resCode: res.status,
            resHeaders: headersToObject(res.headers),
            resText: bodyTxt,
        })


        return res;
    }

    // Takes an URL instead of a path. Used for CDNs
    const getUrl = async (reason: string, url: string) => {
        const now = new Date();
        const headers = {
            'User-Agent': 'UnityPlayer/2018.1.0f2 (UnityWebRequest/1.0, libcurl/7.51.0-DEV)',
            'Accept': '*/*',
            'Accept-Encoding': 'identity',
            'X-Unity-Version': '2018.1.0f2',
            'Cookie': process.env.ANYLAND_COOKIE!,
        }

        const res = await fetch(url, { headers })

        const bodyTxt = await res.clone().text();
        sendNetRequest({
            ts: now.valueOf(),
            ts_iso: now.toISOString(),
            url,
            reason,
            method: "GET",
            reqHeaders: headers,
            reqbody: null,
            resCode: res.status,
            resHeaders: headersToObject(res.headers),
            resText: bodyTxt,
        })


        return res;
    }


    const post = async (reason: string, path: string, body: string) => {
        const now = new Date();
        const url = ANYLAND_ROOT + path;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'UnityPlayer/2018.1.0f2 (UnityWebRequest/1.0, libcurl/7.51.0-DEV)',
            'Accept': '*/*',
            'Accept-Encoding': 'identity',
            'X-Unity-Version': '2018.1.0f2',
            'Cookie': process.env.ANYLAND_COOKIE!,
        }

        const res = await fetch(url, {
            method: "POST",
            headers: headers,
            body,
        })

        const bodyTxt = await res.clone().text();
        sendNetRequest({
            ts: now.valueOf(),
            ts_iso: now.toISOString(),
            url,
            reason,
            method: "POST",
            reqHeaders: headers,
            reqbody: body,
            resCode: res.status,
            resHeaders: headersToObject(res.headers),
            resText: bodyTxt,
        })


        return res;
    }


    const bumpToken = async () => {
    const response = await post("token keepalive", "/p", "");
    if (response.status !== 200) console.log('Token response:', response.status);
    //console.log('Token response:', response.status);
    }



    return { get, getUrl, post, bumpToken }
}


// Dirty copy-paste where get and post expect to be given a cookie. This is used for the proxy-server only
export const mkApiReqs_cookie = async (sendNetRequest: (req: NetRequest) => void) => {
    

    // These functions abstract the API calls, headers, and send the req/res to NSQ for future reference or in case I mess something up in the archival process.

    const get = async (reason: string, path: string, cookie: string | null) => {
        const now = new Date();
        const url = ANYLAND_ROOT + path;
        const headers = {
            'User-Agent': 'UnityPlayer/2018.1.0f2 (UnityWebRequest/1.0, libcurl/7.51.0-DEV)',
            'Accept': '*/*',
            'Accept-Encoding': 'identity',
            'X-Unity-Version': '2018.1.0f2',
        }

        if (cookie) {
            // @ts-ignore
            headers['Cookie'] = cookie;
        }

        const res = await fetch(url, { headers })

        const bodyTxt = await res.clone().text();
        sendNetRequest({
            ts: now.valueOf(),
            ts_iso: now.toISOString(),
            url,
            reason,
            method: "GET",
            reqHeaders: headers,
            reqbody: null,
            resCode: res.status,
            resHeaders: headersToObject(res.headers),
            resText: bodyTxt,
        })


        return res;
    }


    const getUrl = async (reason: string, url: string, cookie: string | null) => {
        const now = new Date();
        const headers = {
            'User-Agent': 'UnityPlayer/2018.1.0f2 (UnityWebRequest/1.0, libcurl/7.51.0-DEV)',
            'Accept': '*/*',
            'Accept-Encoding': 'identity',
            'X-Unity-Version': '2018.1.0f2',
        }

        if (cookie) {
            // @ts-ignore
            headers['Cookie'] = cookie;
        }

        const res = await fetch(url, { headers })

        const bodyTxt = await res.clone().text();
        sendNetRequest({
            ts: now.valueOf(),
            ts_iso: now.toISOString(),
            url,
            reason,
            method: "GET",
            reqHeaders: headers,
            reqbody: null,
            resCode: res.status,
            resHeaders: headersToObject(res.headers),
            resText: bodyTxt,
        })


        return res;
    }


    const post = async (reason: string, path: string, body: string, cookie: string | null) => {
        const now = new Date();
        const url = ANYLAND_ROOT + path;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'UnityPlayer/2018.1.0f2 (UnityWebRequest/1.0, libcurl/7.51.0-DEV)',
            'Accept': '*/*',
            'Accept-Encoding': 'identity',
            'X-Unity-Version': '2018.1.0f2',
        }

        if (cookie) {
            // @ts-ignore
            headers['Cookie'] = cookie;
        }

        const res = await fetch(url, {
            method: "POST",
            headers: headers,
            body,
        })

        const bodyTxt = await res.clone().text();
        sendNetRequest({
            ts: now.valueOf(),
            ts_iso: now.toISOString(),
            url,
            reason,
            method: "POST",
            reqHeaders: headers,
            reqbody: body,
            resCode: res.status,
            resHeaders: headersToObject(res.headers),
            resText: bodyTxt,
        })


        return res;
    }


    return { get, getUrl, post }
}