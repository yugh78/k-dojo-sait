"""Read-only smoke checks against a running Docker deployment."""

import argparse
import json
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
from urllib.request import HTTPRedirectHandler, build_opener
from xml.etree import ElementTree


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://localhost:8080")
    args = parser.parse_args()
    base = args.url.rstrip("/")
    opener = build_opener(NoRedirect)

    def get(path, expected=200):
        try:
            response = opener.open(base + path, timeout=20)
        except HTTPError as error:
            response = error
        with response:
            body = response.read().decode("utf-8")
            if response.status != expected:
                raise RuntimeError(f"{path}: expected {expected}, got {response.status}")
            return body, response.headers

    get("/api/health/")
    programs = json.loads(get("/api/programs/")[0])
    if not programs:
        raise RuntimeError("No published programs to verify SSR")
    for path in ["/", "/schedule", "/pricing", "/contacts"] + [f"/{p['slug']}" for p in programs]:
        body, _ = get(path)
        if "Не удалось загрузить данные" in body or "undefined в Королёве" in body:
            raise RuntimeError(f"{path}: server-rendered page contains an API error")
    for path in ["/admin", "/api"]:
        _, headers = get(path, 301)
        if urlsplit(urljoin(base, headers.get("Location", ""))).path != path + "/":
            raise RuntimeError(f"{path}: incorrect trailing-slash redirect")
    get("/admin/login/")
    get("/static/admin/css/base.css")
    get("/does-not-exist", 404)
    get("/coaches/does-not-exist", 404)
    get("/events/does-not-exist", 404)
    sitemap = ElementTree.fromstring(get("/sitemap.xml")[0])
    paths = {
        urlsplit(node.text).path for node in sitemap.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")
    }
    coaches = json.loads(get("/api/coaches/")[0])
    for coach in coaches:
        if f"/coaches/{coach['slug']}" not in paths:
            raise RuntimeError("Sitemap is missing a published coach")
    print("PASS: Docker HTTP routes, SSR data, admin, static files, 404 and sitemap")


if __name__ == "__main__":
    main()
