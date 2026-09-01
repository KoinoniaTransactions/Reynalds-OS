import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const sourceDir = join(
  process.cwd(),
  "02_Companies/Koinonia/04_Departments/Marketing/Content/03_Source_Assets/T01_ANIMATIC"
);
const draftDir = join(
  process.cwd(),
  "02_Companies/Koinonia/04_Departments/Marketing/Content/04_Drafts/T01_ANIMATIC"
);
const renderDir = join(draftDir, "frames");

const cream = "#F7F3EC";
const black = "#171717";
const gold = "#B88A44";
const muted = "#625D55";
const card = "#FFFDFC";

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function lines(items, { x = 92, y = 460, size = 94, gap = 116, fill = black, anchor = "start" } = {}) {
  return items
    .map(
      (item, index) =>
        `<text x="${x}" y="${y + index * gap}" text-anchor="${anchor}" font-family="Georgia, 'DejaVu Serif', serif" font-size="${size}" font-weight="700" fill="${fill}">${escapeXml(item)}</text>`
    )
    .join("\n");
}

function caption(items) {
  return `
    <rect x="64" y="1575" width="952" height="246" rx="38" fill="#171717"/>
    ${items
      .map(
        (item, index) =>
          `<text x="540" y="${1664 + index * 58}" text-anchor="middle" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="38" font-weight="700" fill="#FFFFFF">${escapeXml(item)}</text>`
      )
      .join("\n")}`;
}

function logo({ x = 884, y = 126, radius = 70 } = {}) {
  return `
    <circle cx="${x}" cy="${y}" r="${radius}" fill="${black}"/>
    <circle cx="${x}" cy="${y}" r="${radius - 21}" fill="none" stroke="${gold}" stroke-width="6"/>
    <text x="${x}" y="${y + 27}" text-anchor="middle" font-family="Georgia, 'DejaVu Serif', serif" font-size="72" font-weight="700" fill="${gold}">K</text>`;
}

function base({ title, description, body, final = false }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" role="img" aria-label="${escapeXml(description)}">
  <title>${escapeXml(title)}</title>
  <rect width="1080" height="1920" fill="${cream}"/>
  ${final ? `<rect width="1080" height="28" fill="${gold}"/>` : ""}
  <text x="92" y="138" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="24" font-weight="700" letter-spacing="5" fill="#986C2C">REAL ESTATE OPERATIONS SUPPORT</text>
  ${logo()}
  ${body}
  </svg>`;
}

const scenes = [
  base({
    title: "More closings",
    description: "More closings create more opportunity.",
    body: `
      ${lines(["MORE", "CLOSINGS."], { y: 510, size: 132, gap: 150 })}
      <rect x="92" y="885" width="720" height="132" rx="28" fill="${card}"/>
      <rect x="126" y="917" width="22" height="68" rx="11" fill="${gold}"/>
      <text x="184" y="969" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="46" font-weight="700" fill="${black}">More opportunity.</text>
      ${caption(["More closings are supposed to create", "more opportunity."])}`
  }),
  base({
    title: "More moving pieces",
    description: "Deadlines, documents, showings, and follow-up increase with more clients.",
    body: `
      ${lines(["MORE CLIENTS", "MEANS MORE"], { y: 400, size: 92, gap: 112 })}
      ${[
        [92, 700, "DEADLINES", "MON  •  5:00 PM"],
        [556, 700, "DOCUMENTS", "REVIEW  •  SEND"],
        [92, 925, "SHOWINGS", "CLIENT  •  ACCESS"],
        [556, 925, "FOLLOW-UP", "CALL  •  UPDATE"]
      ]
        .map(
          ([x, y, heading, detail]) => `
            <rect x="${x}" y="${y}" width="400" height="174" rx="30" fill="${card}" stroke="#E4D8C5" stroke-width="3"/>
            <circle cx="${x + 58}" cy="${y + 58}" r="22" fill="${gold}"/>
            <text x="${x + 100}" y="${y + 68}" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="30" font-weight="700" fill="${black}">${heading}</text>
            <text x="${x + 40}" y="${y + 130}" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="23" letter-spacing="2" fill="${muted}">${detail}</text>`
        )
        .join("\n")}
      ${caption(["More deadlines. More documents.", "More showings. More follow-up."])}`
  }),
  base({
    title: "Opportunity, not chaos",
    description: "Opportunity should not become operational chaos.",
    body: `
      ${lines(["OPPORTUNITY", "SHOULD NOT", "BECOME", "CHAOS."], { y: 450, size: 100, gap: 125 })}
      <rect x="92" y="1035" width="896" height="208" rx="36" fill="${card}" stroke="#E4D8C5" stroke-width="3"/>
      <text x="540" y="1120" text-anchor="middle" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="30" font-weight="700" fill="${muted}">GROWTH SHOULD CREATE CAPACITY</text>
      <text x="540" y="1186" text-anchor="middle" font-family="Georgia, 'DejaVu Serif', serif" font-size="54" font-weight="700" fill="${gold}">not more pressure.</text>
      ${caption(["The little things only become urgent", "when they get missed."])}`
  }),
  base({
    title: "Not always another hire",
    description: "The answer is not always hiring another full-time employee.",
    body: `
      <circle cx="540" cy="520" r="88" fill="${black}"/>
      <path d="M360 840C360 700 440 630 540 630C640 630 720 700 720 840V900H360Z" fill="${black}"/>
      <rect x="300" y="1020" width="480" height="112" rx="56" fill="${gold}"/>
      <text x="540" y="1092" text-anchor="middle" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="34" font-weight="700" fill="#FFFFFF">FULL-TIME HIRE?</text>
      ${lines(["NOT ALWAYS."], { x: 540, y: 1320, size: 92, anchor: "middle" })}
      ${caption(["The answer is not always hiring", "another full-time person."])}`
  }),
  base({
    title: "Carry the operation",
    description: "Koinonia carries operational work while the Realtor focuses on clients.",
    body: `
      <rect x="68" y="390" width="418" height="900" rx="42" fill="${card}" stroke="#E4D8C5" stroke-width="3"/>
      <rect x="594" y="390" width="418" height="900" rx="42" fill="${black}"/>
      <text x="277" y="490" text-anchor="middle" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="28" font-weight="700" letter-spacing="3" fill="${muted}">YOUR LANE</text>
      <text x="803" y="490" text-anchor="middle" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="28" font-weight="700" letter-spacing="3" fill="${gold}">KOINONIA LANE</text>
      ${lines(["CLIENTS", "ADVICE", "DECISIONS"], { x: 277, y: 670, size: 48, gap: 120, anchor: "middle" })}
      ${lines(["DEADLINES", "DOCUMENTS", "FOLLOW-UP", "COORDINATION"], { x: 803, y: 630, size: 42, gap: 118, fill: "#FFFFFF", anchor: "middle" })}
      <circle cx="540" cy="842" r="60" fill="${gold}"/>
      <text x="540" y="863" text-anchor="middle" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="58" font-weight="700" fill="#FFFFFF">›</text>
      ${caption(["Carry the operation competing", "with your client time."])}`
  }),
  base({
    title: "Koinonia Transactions",
    description: "Koinonia Transactions brand frame and call to action.",
    final: true,
    body: `
      ${lines(["REAL ESTATE", "OPERATIONS", "SUPPORT."], { y: 525, size: 104, gap: 128 })}
      <text x="92" y="1040" font-family="Georgia, 'DejaVu Serif', serif" font-size="56" font-weight="700" fill="${black}">Koinonia Transactions</text>
      <text x="92" y="1110" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="33" fill="${muted}">Real Estate Operations. Elevated.</text>
      <rect x="92" y="1260" width="896" height="190" rx="38" fill="${black}"/>
      <text x="540" y="1340" text-anchor="middle" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="34" font-weight="700" fill="#FFFFFF">WHICH PART OF THE OPERATION</text>
      <text x="540" y="1394" text-anchor="middle" font-family="Arial, 'Nimbus Sans', sans-serif" font-size="34" font-weight="700" fill="${gold}">IS STEALING THE MOST TIME?</text>
      ${caption(["Send a message and tell us", "which part is stealing the most time."])}`
  })
];

await mkdir(sourceDir, { recursive: true });
await mkdir(renderDir, { recursive: true });

for (const [index, svg] of scenes.entries()) {
  const number = String(index + 1).padStart(2, "0");
  const svgPath = join(sourceDir, `T01_SCENE_${number}.svg`);
  const pngPath = join(renderDir, `T01_SCENE_${number}.png`);
  const normalizedSvg = `${svg
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")}\n`;
  await writeFile(svgPath, normalizedSvg);
  await sharp(Buffer.from(normalizedSvg)).png().toFile(pngPath);
}

await sharp(Buffer.from(scenes[5]))
  .png()
  .toFile(join(draftDir, "DRAFT_TT_IG_T01_MORE_CLOSINGS_POSTER_v01.png"));

console.log(`Rendered ${scenes.length} T01 scenes.`);
