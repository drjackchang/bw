// 從 ORCID 公開 API 抓取 Brett Williams 的著作清單，把尚未收錄的新項目加進 data/publications.json
// 在 GitHub Actions（Node 20+，內建 fetch）以伺服器端執行，不受瀏覽器 CORS 限制。
"use strict";

const fs = require("fs");
const path = require("path");

const ORCID_ID = "0000-0001-6307-1779";
const PUB_PATH = path.join(__dirname, "..", "data", "publications.json");

function normalize(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function main() {
  const res = await fetch(`https://pub.orcid.org/v3.0/${ORCID_ID}/works`, {
    headers: { Accept: "application/json" }
  });
  if (!res.ok) {
    throw new Error(`ORCID API 回應錯誤: ${res.status}`);
  }
  const body = await res.json();
  const groups = body.group || [];

  const existing = JSON.parse(fs.readFileSync(PUB_PATH, "utf8"));
  const existingDois = new Set(
    existing.filter((p) => p.doi).map((p) => p.doi.toLowerCase())
  );
  const existingTitles = new Set(existing.map((p) => normalize(p.title)));

  let added = 0;

  groups.forEach((group) => {
    const summary = (group["work-summary"] || [])[0];
    if (!summary) return;

    const title = summary.title && summary.title.title && summary.title.title.value;
    if (!title) return;

    let doi = "";
    (group["external-ids"] && group["external-ids"]["external-id"] || []).forEach((ext) => {
      if (ext["external-id-type"] === "doi" && !doi) {
        doi = ext["external-id-value"];
      }
    });

    const isDupeByDoi = doi && existingDois.has(doi.toLowerCase());
    const isDupeByTitle = existingTitles.has(normalize(title));
    if (isDupeByDoi || isDupeByTitle) return;

    const year =
      summary["publication-date"] &&
      summary["publication-date"].year &&
      Number(summary["publication-date"].year.value);

    const venue =
      (summary["journal-title"] && summary["journal-title"].value) || "";

    existing.push({
      id: `orcid-${summary["put-code"]}`,
      authors: "Williams B, et al.",
      title: title,
      venue: venue,
      year: year || null,
      doi: doi || undefined,
      source: "orcid-sync",
      needs_review: true
    });

    if (doi) existingDois.add(doi.toLowerCase());
    existingTitles.add(normalize(title));
    added += 1;
  });

  if (added > 0) {
    fs.writeFileSync(PUB_PATH, JSON.stringify(existing, null, 2) + "\n", "utf8");
    console.log(`新增了 ${added} 筆著作，author list 為預設值，建議之後手動核對完整作者順序。`);
  } else {
    console.log("沒有新的著作，publications.json 未變更。");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
