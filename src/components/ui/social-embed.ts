import { Node as TiptapNode } from "@tiptap/react";

// One editor node for YouTube / X / Instagram / Facebook embeds. The stored HTML is exactly what the
// BE sanitizer keeps and the FE renders (YouTube + Facebook plugin iframes, twitter-tweet and
// instagram-media blockquotes), so it survives a save and a reload unchanged.

export type EmbedKind = "youtube" | "x" | "instagram" | "facebook";
export type EmbedAttrs = { kind: EmbedKind; url: string };

export const EMBED_LABEL: Record<EmbedKind, string> = {
  youtube: "YouTube",
  x: "X (Twitter)",
  instagram: "Instagram",
  facebook: "Facebook",
};

const YT_ID = /^[\w-]{6,20}$/;

/** A pasted/typed link -> its canonical embeddable form, or null when it isn't a supported post. */
export function parseEmbedUrl(input: string): EmbedAttrs | null {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  const host = u.hostname.toLowerCase().replace(/^(www|m|mobile|web)\./, "");
  const parts = u.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" && YT_ID.test(parts[0] ?? "")) {
    return { kind: "youtube", url: `https://www.youtube.com/embed/${parts[0]}` };
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const id = parts[0] === "watch" ? u.searchParams.get("v") : ["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : null;
    if (id && YT_ID.test(id)) return { kind: "youtube", url: `https://www.youtube.com/embed/${id}` };
    return null;
  }
  if (host === "twitter.com" || host === "x.com") {
    if (parts[1] === "status" && /^\d+$/.test(parts[2] ?? "")) {
      return { kind: "x", url: `https://twitter.com/${parts[0]}/status/${parts[2]}` };
    }
    return null;
  }
  if (host === "instagram.com") {
    // /p/ID, /reel/ID, /tv/ID, or /username/p/ID
    const i = ["p", "reel", "tv"].indexOf(parts[0]) >= 0 ? 0 : ["p", "reel", "tv"].indexOf(parts[1]) >= 0 ? 1 : -1;
    if (i >= 0 && /^[\w-]{1,64}$/.test(parts[i + 1] ?? "")) {
      return { kind: "instagram", url: `https://www.instagram.com/${parts[i]}/${parts[i + 1]}/` };
    }
    return null;
  }
  if (host === "facebook.com") {
    return parts.length ? { kind: "facebook", url: `https://www.facebook.com${u.pathname}${u.search}` } : null;
  }
  return null;
}

function facebookIframeSrc(url: string) {
  const isVideo = /\/(videos?|reel|watch)\b/.test(url);
  return `https://www.facebook.com/plugins/${isVideo ? "video" : "post"}.php?href=${encodeURIComponent(url)}&width=500&show_text=true`;
}

function fromIframe(src: string | null): EmbedAttrs | null {
  if (!src) return null;
  let u: URL;
  try {
    u = new URL(src);
  } catch {
    return null;
  }
  if (u.hostname === "www.facebook.com" && /^\/plugins\/(post|video)\.php$/.test(u.pathname)) {
    const href = parseEmbedUrl(u.searchParams.get("href") ?? "");
    return href?.kind === "facebook" ? href : null;
  }
  const yt = parseEmbedUrl(src);
  return yt?.kind === "youtube" ? yt : null;
}

function lastLinkOf(el: HTMLElement, kind: EmbedKind, permalink?: string | null): EmbedAttrs | null {
  const links = [...el.querySelectorAll("a[href]")].map((a) => a.getAttribute("href") ?? "");
  for (const href of [permalink ?? "", ...links.reverse()]) {
    const parsed = parseEmbedUrl(href);
    if (parsed?.kind === kind) return parsed;
  }
  return null;
}

export const SocialEmbed = TiptapNode.create({
  name: "socialEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return { kind: { default: "youtube" }, url: { default: "" } };
  },

  parseHTML() {
    return [
      { tag: "iframe[src]", priority: 1000, getAttrs: (el) => fromIframe((el as HTMLElement).getAttribute("src")) ?? false },
      { tag: "blockquote.twitter-tweet", priority: 1000, getAttrs: (el) => lastLinkOf(el as HTMLElement, "x") ?? false },
      {
        tag: "blockquote.instagram-media",
        priority: 1000,
        getAttrs: (el) =>
          lastLinkOf(el as HTMLElement, "instagram", (el as HTMLElement).getAttribute("data-instgrm-permalink")) ?? false,
      },
    ];
  },

  renderHTML({ node }) {
    const { kind, url } = node.attrs as EmbedAttrs;
    if (kind === "youtube") {
      return ["iframe", { src: url, width: "560", height: "315", title: "YouTube video", allowfullscreen: "true" }];
    }
    if (kind === "facebook") {
      return ["iframe", { src: facebookIframeSrc(url), width: "500", height: "600", title: "Facebook paylaşımı" }];
    }
    if (kind === "instagram") {
      return [
        "blockquote",
        { class: "instagram-media", "data-instgrm-permalink": url, "data-instgrm-version": "14" },
        ["a", { href: url }, url],
      ];
    }
    return ["blockquote", { class: "twitter-tweet" }, ["a", { href: url }, url]];
  },

  // The editor shows a compact card instead of loading four vendors' scripts/iframes while writing.
  addNodeView() {
    return ({ node }) => {
      const { kind, url } = node.attrs as EmbedAttrs;
      const dom = document.createElement("div");
      dom.className = "social-embed-card";
      dom.contentEditable = "false";
      const label = document.createElement("strong");
      label.textContent = `${EMBED_LABEL[kind]} gömülü içerik`;
      const link = document.createElement("span");
      link.textContent = url;
      dom.append(label, link);
      return { dom };
    };
  },
});
