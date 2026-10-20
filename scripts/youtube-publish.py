#!/usr/bin/env python3
"""Publish the rendered shorts to YouTube.

    python3 scripts/youtube-publish.py                 # dry run: print what would be sent
    python3 scripts/youtube-publish.py --upload        # upload every video not yet uploaded
    python3 scripts/youtube-publish.py --upload --only short-01-hook
    python3 scripts/youtube-publish.py --captions-only # (re)write the .srt files, no upload
    python3 scripts/youtube-publish.py --update        # rewrite titles/descriptions of uploaded videos

Reads video/youtube.json (titles, blurbs, music, privacy, schedule), builds each
description from video/DESCRIPTION.md and the track's credit (video/music/CREDITS.md),
uploads output/videos/<take>.mp4 with the YouTube Data API v3, adds it to the playlist,
sets the take's still (public/narration/<take>/thumb.jpg) as the thumbnail and uploads
English captions made from the take's word timings. Uploaded IDs go to
video/youtube-uploads.json, so a video is never uploaded twice (--force re-uploads).

Setup, once:
  1. Google Cloud console: a project with "YouTube Data API v3" enabled, and an OAuth
     client of type "Desktop app". Download its JSON as
     ~/.config/youtube-upload/client_secret.json (or set YT_CLIENT_SECRETS). The Google
     project and client aren't Triangle-specific: name them for any upload project.
  2. pip install google-api-python-client google-auth-oauthlib
  3. The first --upload opens a browser to sign in to the channel; the token is kept in
     ~/.config/youtube-upload/token-<channel>.json (YT_CHANNEL, default "default").
Quota: an upload costs 1,600 of the default 10,000 units a day, so about six videos a
day. Videos start private (youtube.json "privacy"); "publishAt" schedules them.
"""
import argparse, datetime, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# Shared by any project that uploads to YouTube (not Triangle-specific): the OAuth
# client, and one sign-in token per channel (YT_CHANNEL picks which, default "default").
CONF = os.path.expanduser(os.environ.get("YT_CONFIG_DIR", "~/.config/youtube-upload"))
SECRETS = os.path.expanduser(os.environ.get("YT_CLIENT_SECRETS", os.path.join(CONF, "client_secret.json")))
TOKEN = os.path.join(CONF, f"token-{os.environ.get('YT_CHANNEL', 'default')}.json")
SCOPES = ["https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube.force-ssl"]   # playlists, captions, thumbnails
MANIFEST = os.path.join(ROOT, "video", "youtube.json")
STATE = os.path.join(ROOT, "video", "youtube-uploads.json")
MANIFEST_DEFAULTS = {}   # youtube.json "defaults", set in main()
VIDEOS = os.path.join(ROOT, "output", "videos")


def load(p, default=None):
    try:
        return json.load(open(p))
    except FileNotFoundError:
        return default


# ---------- description ----------
def description(v):
    """The blurb, then video/DESCRIPTION.md with the track filled in, then the
    incompetech credit block for the track."""
    src = open(os.path.join(ROOT, "video", "DESCRIPTION.md")).read()
    body = src.split("\n\n", 2)[2] if src.startswith("#") else src      # drop the file's own title and note
    body = body.replace("<track>", v["music"])
    body = re.sub(r"\n\(tracks per video[^)]*\)", "", body)
    body = re.sub(r"\*\*(.+?)\*\*", r"\1", body)                          # no markdown on YouTube
    body = re.sub(r"\nMusic: [^\n]*(\n[^\n]+CC BY 4\.0)?", "", body)        # the full credit block follows
    # one line per paragraph (the file is hard-wrapped), keeping the credit lines apart
    paras = []
    for para in body.strip().split("\n\n"):
        lines = para.split("\n")
        if lines[0] == "The Triangle of Everything":
            paras.append("\n".join([lines[0]] + [" ".join(lines[1:])]).replace(" Inspired by", "\nInspired by"))
        else:
            paras.append(" ".join(lines))
    body = "\n\n".join(paras)
    credit = (f'Music: "{v["music"]}" Kevin MacLeod (incompetech.com)\n'
              "Licensed under Creative Commons: By Attribution 4.0\n"
              "https://creativecommons.org/licenses/by/4.0/")
    full = v.get("fullVideo", MANIFEST_DEFAULTS.get("fullVideo"))
    watch = f"\n\nWatch the full video: {full}" if full else ""
    return f'{v["blurb"]}{watch}\n\n{body.strip()}\n\n{credit}\n'


# ---------- captions ----------
def srt(take):
    """English captions from the take's word timings: short lines that break at
    sentence ends and commas, as in the player."""
    t = load(os.path.join(ROOT, "public", "narration", take, "words.json"))
    words, cues, cur = t["words"], [], []
    for w in words:
        cur.append(w)
        text = w[0]
        if text[-1:] in ".?!" or (text[-1:] in ",;:" and len(cur) >= 4) or len(cur) >= 10:
            cues.append(cur); cur = []
    if cur: cues.append(cur)
    stamp = lambda s: "%02d:%02d:%02d,%03d" % (s // 3600, s % 3600 // 60, s % 60, round(s % 1 * 1000) % 1000)
    out = []
    for i, c in enumerate(cues, 1):
        out.append(f"{i}\n{stamp(c[0][1])} --> {stamp(c[-1][2])}\n{' '.join(w[0] for w in c)}\n")
    return "\n".join(out)


# ---------- API ----------
def service():
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from google.auth.transport.requests import Request
        from googleapiclient.discovery import build
    except ImportError:
        sys.exit("pip install google-api-python-client google-auth-oauthlib")
    creds = Credentials.from_authorized_user_file(TOKEN, SCOPES) if os.path.exists(TOKEN) else None
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(SECRETS):
                sys.exit(f"no OAuth client at {SECRETS} (see the setup notes at the top of this script)")
            creds = InstalledAppFlow.from_client_secrets_file(SECRETS, SCOPES).run_local_server(port=0)
        os.makedirs(CONF, exist_ok=True)
        fd = os.open(TOKEN, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)   # the token is a secret too
        with os.fdopen(fd, "w") as f: f.write(creds.to_json())
    return build("youtube", "v3", credentials=creds)


def playlist_id(yt, title, privacy):
    req = yt.playlists().list(part="snippet", mine=True, maxResults=50)
    while req:
        res = req.execute()
        for p in res.get("items", []):
            if p["snippet"]["title"] == title:
                return p["id"]
        req = yt.playlists().list_next(req, res)
    p = yt.playlists().insert(part="snippet,status", body={
        "snippet": {"title": title, "description": "Every object that can exist, by mass and size. triangleofeverything.com"},
        "status": {"privacyStatus": privacy}}).execute()
    print(f"  created playlist {title}: {p['id']}")
    return p["id"]


def upload(yt, v, path, cfg):
    from googleapiclient.http import MediaFileUpload
    status = {"privacyStatus": v.get("privacy", cfg["privacy"]), "selfDeclaredMadeForKids": cfg["madeForKids"]}
    if v.get("publishAt"):
        status.update(privacyStatus="private", publishAt=v["publishAt"])
    body = {"snippet": {"title": v["title"], "description": description(v), "tags": v.get("tags", cfg["tags"]),
                        "categoryId": cfg["categoryId"], "defaultLanguage": cfg["language"],
                        "defaultAudioLanguage": cfg["language"]},
            "status": status}
    req = yt.videos().insert(part="snippet,status", body=body,
                             media_body=MediaFileUpload(path, mimetype="video/mp4", chunksize=8 << 20, resumable=True))
    res = None
    while res is None:
        st, res = req.next_chunk()
        if st: print(f"  {int(st.progress() * 100)}%", end="\r", flush=True)
    return res["id"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--upload", action="store_true", help="really upload (default: dry run)")
    ap.add_argument("--only", action="append", help="just this take (repeatable)")
    ap.add_argument("--force", action="store_true", help="upload again even if already uploaded")
    ap.add_argument("--captions-only", action="store_true", help="write output/videos/<take>.srt and stop")
    ap.add_argument("--update", action="store_true",
                    help="rewrite title, description and tags of videos already uploaded (after editing youtube.json or DESCRIPTION.md)")
    a = ap.parse_args()
    m = load(MANIFEST)
    cfg, state = m["defaults"], load(STATE, {})
    MANIFEST_DEFAULTS.update(cfg)
    todo = [v for v in m["videos"] if not a.only or v["take"] in a.only]
    if a.update:
        yt = service()
        for v in todo:
            if v["take"] not in state:
                print(f"{v['take']}: not uploaded yet"); continue
            vid = state[v["take"]]["id"]
            cur = yt.videos().list(part="snippet", id=vid).execute()["items"][0]["snippet"]
            cur.update(title=v["title"], description=description(v), tags=v.get("tags", cfg["tags"]))
            yt.videos().update(part="snippet", body={"id": vid, "snippet": cur}).execute()
            print(f"{v['take']}: updated https://youtu.be/{vid}")
        return
    yt = service() if a.upload and not a.captions_only else None
    for v in todo:
        take, path = v["take"], os.path.join(VIDEOS, v["take"] + ".mp4")
        os.makedirs(VIDEOS, exist_ok=True)
        open(os.path.join(VIDEOS, take + ".srt"), "w").write(srt(take))
        if a.captions_only:
            print(f"{take}: captions written"); continue
        print(f"\n=== {take}: {v['title']}")
        if take in state and not a.force:
            print(f"  already uploaded: https://youtu.be/{state[take]['id']}"); continue
        if not os.path.exists(path):
            print(f"  missing {path}: render it first (scripts/narration-render-all.sh {take})"); continue
        if not yt:
            print(f"  file: {path} ({os.path.getsize(path) / 1e6:.1f} MB)")
            print(f"  privacy: {v.get('privacy', cfg['privacy'])}" + (f", goes public {v['publishAt']}" if v.get("publishAt") else ""))
            print("  description:\n    " + description(v).replace("\n", "\n    "))
            continue
        vid = upload(yt, v, path, cfg)
        print(f"  uploaded: https://youtu.be/{vid}")
        state[take] = {"id": vid, "title": v["title"], "uploadedAt": datetime.datetime.now().isoformat(timespec="seconds")}
        json.dump(state, open(STATE, "w"), indent=2)
        from googleapiclient.http import MediaFileUpload
        thumb = os.path.join(ROOT, "public", "narration", take, "thumb.jpg")
        if os.path.exists(thumb):
            try:
                yt.thumbnails().set(videoId=vid, media_body=MediaFileUpload(thumb, mimetype="image/jpeg")).execute()
            except Exception as e:   # needs a verified channel; Shorts may ignore it
                print(f"  thumbnail skipped: {e}")
        yt.captions().insert(part="snippet", body={"snippet": {"videoId": vid, "language": cfg["language"], "name": "English"}},
                             media_body=MediaFileUpload(os.path.join(VIDEOS, take + ".srt"), mimetype="application/octet-stream")).execute()
        if cfg.get("playlist"):
            pl = playlist_id(yt, cfg["playlist"], cfg["privacy"])
            yt.playlistItems().insert(part="snippet", body={"snippet": {"playlistId": pl,
                                      "resourceId": {"kind": "youtube#video", "videoId": vid}}}).execute()
        print("  thumbnail, captions and playlist done")


if __name__ == "__main__":
    main()
