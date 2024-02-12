import { Hono } from 'hono'
import { Bindings } from './bindings'
import * as uuid from "uuid";
import { Feed } from 'feed';
import { AuthResponse, CallbackAuthResponse, PocketGetResponse } from './schema';

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => {
    return c.text('Hello Pocket2Rss!')
})

app.get("/signin", async (c) => {
    const state = uuid.v4();
    const res = await fetch("https://getpocket.com/v3/oauth/request", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "X-Accept": "application/json"
        },
        body: JSON.stringify({
            consumer_key: c.env.POCKET_KEY,
            redirect_uri: c.env.HOST + "/callback",
            state: state
        })
    })
    const j: AuthResponse = await res.json();
    const code = j.code;
    await c.env.STORE_KV.put("state", code);
    return c.redirect(`https://getpocket.com/auth/authorize?request_token=${code}&redirect_uri=${c.env.HOST + "/callback"}`, 302)
})

app.get("/callback", async (c) => {
    const code = await c.env.STORE_KV.get("state")
    const res = await fetch("https://getpocket.com/v3/oauth/authorize", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "X-Accept": "application/json"
        },
        body: JSON.stringify({
            consumer_key: c.env.POCKET_KEY,
            code: code
        })
    })
    const token: CallbackAuthResponse = await res.json()
    c.env.STORE_KV.put("token", token.access_token)
    return c.json({ status: "secsess" })
})


app.get("/rss", async (c) => {
    const token = await c.env.STORE_KV.get("token")
    const data = await fetch("https://getpocket.com/v3/get", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "X-Accept": "application/json"
        },
        body: JSON.stringify({
            consumer_key: c.env.POCKET_KEY,
            access_token: token,
            count: 10
        })
    })

    const json: PocketGetResponse = await data.json()
    const feed = new Feed({
        title: "Pocket2Rss",
        description: "Saved pocket articles feed for you!!",
        id: c.env.HOST,
        copyright: "-2024, Kaniya Simeji",
        language: "ja"
    })

    const values = Object.values(json.list)
    values.forEach((v) => {
        feed.addItem({
            title: v.resolved_title,
            date: new Date(v.time_updated),
            link: v.resolved_url,
            id: v.resolved_id,
        })
    })

    return c.body(feed.rss2(), 200, {
        'Content-Type': 'application/rss+xml; charset=UTF-8',
    })
})

export default app
