import { z } from "zod";

export const AuthResponseSchema = z.object({
    code: z.string(),
    state: z.string().uuid()
})

export type AuthResponse = z.infer<typeof AuthResponseSchema>

export const CallbackAuthResponseSchema = z.object({
    state: z.string().uuid(),
    username: z.string().email(),
    access_token: z.string()
})

export type CallbackAuthResponse = z.infer<typeof CallbackAuthResponseSchema>

export enum PocketFavoriteKind {
    UnFavorited = "0",
    Favorited = "1"
}

export const PocketGetRequestSchema = z.object({
    consumer_key: z.string(),
    access_token: z.string(),
    state: z.enum(["unread", "archive", "all"]).optional(),
    favorite: z.nativeEnum(PocketFavoriteKind).optional(),
    tag: z.string().describe("If you inserted '_untagged_', it would return untagged items").optional(),
    contentType: z.enum(["article", "video", "image"]).optional(),
    sort: z.enum(["newest", "oldest", "title", "site"]).optional(),
    detailType: z.enum(["simple", "complete"]).optional(),
    search: z.string().url().or(z.string()).optional(),
    domain: z.string().url().optional(),
    since: z.number().describe("unixtime").optional(),
    count: z.number().positive().optional(),
    offset: z.number().positive().optional()
})

export type PocketGetRequest = z.infer<typeof PocketGetRequestSchema>

export const PocketGetResponseSchema = z.object({
    status: z.number(),
    complete: z.number(),
    list: z.record(z.string(), z.object({
        item_id: z.string(),
        resolved_id: z.string(),
        given_url: z.string().url(),
        given_title: z.string(),
        favorite: z.nativeEnum(PocketFavoriteKind),
        status: z.number(),
        time_added: z.number().describe("unixtime"),
        time_updated: z.number().describe("unixtime"),
        time_read: z.number().describe("unixtime"),
        time_favorited: z.number().describe("unixtime"),
        sort_id: z.number(),
        resolved_title: z.string(),
        resolved_url: z.string().url(),
        excerpt: z.string().optional(),
        is_article: z.boolean(),
        is_index: z.boolean(),
        has_video: z.boolean(),
        has_image: z.boolean(),
        word_count: z.number(),
        lang: z.string(),
        time_to_read: z.number(),
        listen_duration_estimate: z.number(),
        domain_metadata: z.any().optional(),
        top_image_url: z.string().url().optional(),
        images: z.record(z.string(), z.object({
            item_id: z.string(),
            image_id: z.string(),
            src: z.string().url(),
            width: z.number(),
            height: z.number(),
            credit: z.string(),
            caption: z.string()
        })).optional(),
        videos: z.record(z.string(), z.object({
            item_id: z.string(),
            video_id: z.string(),
            src: z.string().url(),
            width: z.number(),
            height: z.number(),
            type: z.number(),
            vid: z.string()
        })).optional()
    })),
    error: z.string().nullable(),
    since: z.string().describe("unixtime"),
    search_meta: z.object({
        search_type: z.string()
    })
})

export type PocketGetResponse = z.infer<typeof PocketGetResponseSchema>
