// 从 libphonenumber-js 的元数据生成各国号码格式参考表。
// 用法：pnpm install && pnpm generate
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getCountries,
  getExampleNumber,
  Metadata,
} from 'libphonenumber-js/max';
import metadata from 'libphonenumber-js/metadata.max.json';
import examples from 'libphonenumber-js/examples.mobile.json';

const ROOT = process.env.OUT_DIR || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(
  fs.readFileSync(new URL('../node_modules/libphonenumber-js/package.json', import.meta.url), 'utf8')
);

const meta = new Metadata(metadata);
const namesEn = new Intl.DisplayNames(['en'], { type: 'region' });
const namesZh = new Intl.DisplayNames(['zh-Hans'], { type: 'region' });

// 本站（USPhoneGen）已有国家指南的地区：ISO 代码 -> 页面 slug
const GUIDES = { US: 'us', GB: 'uk', ID: 'id', RU: 'ru', HK: 'hk', ES: 'es', MY: 'my', FR: 'fr', BR: 'br', IL: 'il', TH: 'th', IN: 'in' };

function lengthText(lens) {
  if (!lens || !lens.length) return '';
  const sorted = [...lens].sort((a, b) => a - b);
  const contiguous = sorted.every((n, i) => i === 0 || n === sorted[i - 1] + 1);
  if (sorted.length === 1) return String(sorted[0]);
  return contiguous ? `${sorted[0]}-${sorted[sorted.length - 1]}` : sorted.join(', ');
}

const rows = [];
for (const iso of getCountries()) {
  meta.selectNumberingPlan(iso);
  const np = meta.numberingPlan;
  const mobile = np.type('MOBILE');
  const ex = getExampleNumber(iso, examples);
  const prefix = np.nationalPrefix();
  rows.push({
    iso,
    name_en: namesEn.of(iso) ?? iso,
    name_zh: namesZh.of(iso) ?? '',
    calling_code: '+' + np.callingCode(),
    national_prefix: prefix ? String(prefix) : '',
    mobile_lengths: mobile?.possibleLengths?.() ?? [],
    mobile_length_text: lengthText(mobile?.possibleLengths?.()),
    // NANP 等地区手机与座机号段相同，libphonenumber 无法区分
    mobile_same_as_fixed: ex ? ex.getType() === 'FIXED_LINE_OR_MOBILE' : false,
    example_national: ex ? ex.formatNational() : '',
    example_international: ex ? ex.formatInternational() : '',
    example_e164: ex ? ex.number : '',
    guide: GUIDES[iso] ? `https://usphonegen.com/${GUIDES[iso]}-nums` : '',
  });
}
rows.sort((a, b) => a.name_en.localeCompare(b.name_en, 'en'));

// ---------- 共用区号
const byCode = new Map();
for (const r of rows) {
  if (!byCode.has(r.calling_code)) byCode.set(r.calling_code, []);
  byCode.get(r.calling_code).push(r);
}
const shared = [...byCode.entries()]
  .filter(([, v]) => v.length > 1)
  .sort((a, b) => b[1].length - a[1].length);

// ---------- 输出
const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });

fs.writeFileSync(path.join(ROOT, 'data/countries.json'), JSON.stringify(rows.map(({ mobile_length_text, guide, ...r }) => r), null, 2) + '\n');
const header = ['iso', 'name_en', 'name_zh', 'calling_code', 'national_prefix', 'mobile_lengths', 'mobile_same_as_fixed', 'example_national', 'example_international', 'example_e164'];
fs.writeFileSync(
  path.join(ROOT, 'data/countries.csv'),
  '﻿' + header.join(',') + '\n' +
    rows.map((r) => [r.iso, q(r.name_en), q(r.name_zh), r.calling_code, q(r.national_prefix), q(r.mobile_length_text), r.mobile_same_as_fixed, q(r.example_national), q(r.example_international), r.example_e164].join(',')).join('\n') + '\n'
);

const date = new Date().toISOString().slice(0, 10);
const md = (r) => `| ${r.name_en}${r.guide ? ` ([guide](${r.guide}))` : ''} | ${r.iso} | ${r.calling_code} | ${r.national_prefix || '-'} | ${r.mobile_length_text || '-'}${r.mobile_same_as_fixed ? '*' : ''} | ${r.example_international || '-'} |`;
const tableHead = '| Region | ISO | Calling code | National prefix | Mobile digits | Example (international) |\n|---|---|---|---|---|---|\n';

fs.writeFileSync(
  path.join(ROOT, 'docs/COUNTRIES.md'),
  `# All regions\n\n${rows.length} regions, generated ${date} from libphonenumber-js ${pkg.version}.\n\n` +
    `\`*\` mobile and landline numbers share the same ranges, so the length applies to all numbers in that region (for example the North American Numbering Plan).\n\n` +
    tableHead + rows.map(md).join('\n') + '\n'
);

fs.writeFileSync(
  path.join(ROOT, 'docs/SHARED-CALLING-CODES.md'),
  `# Calling codes shared by several regions\n\n` +
    `A calling code alone does not identify a country. These codes are used by more than one region, so a form that picks the country from the prefix needs more digits to decide.\n\n` +
    '| Calling code | Regions |\n|---|---|\n' +
    shared.map(([code, v]) => `| ${code} | ${v.map((r) => `${r.name_en} (${r.iso})`).join(', ')} |`).join('\n') + '\n'
);

const pick = (iso) => rows.find((r) => r.iso === iso);
const featured = ['US', 'GB', 'FR', 'IN', 'ID', 'BR', 'ES', 'RU', 'TH', 'MY', 'HK', 'IL'].map(pick);
const guides = featured.filter((r) => r?.guide);

fs.writeFileSync(
  path.join(ROOT, 'README.md'),
`# Phone number format reference

Country calling codes, national dialing prefixes and mobile number lengths for ${rows.length} regions, in CSV, JSON and Markdown.

Typing a phone number into a sign-up form goes wrong in a small number of predictable ways: a leading \`0\` that should have been dropped, a country code entered twice, or the wrong number of digits. This table lists what each region expects so you can check before you submit.

Generated ${date} from [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js) ${pkg.version}.

## Quick reference

${tableHead}${featured.map(md).join('\n')}

\`*\` mobile and landline numbers share the same ranges in this region, so the length applies to every number (North American Numbering Plan).

The full table is in [docs/COUNTRIES.md](docs/COUNTRIES.md). Machine-readable copies: [data/countries.csv](data/countries.csv) and [data/countries.json](data/countries.json).

## How to read the columns

- **Calling code**: the prefix you dial from abroad, written with \`+\`.
- **National prefix**: the digit you dial before a number inside the same country, for example \`0\` in the UK or France. **Drop it** when you write the number with the calling code. \`06 12 34 56 78\` in France becomes \`+33 6 12 34 56 78\`, and \`07400 123456\` in the UK becomes \`+44 7400 123456\`. The US and Canada use \`1\`, which is the same digit as the calling code.
- **Mobile digits**: the number of digits after the calling code (and without the national prefix) that a mobile number can have. A range such as \`9-12\` means more than one length is valid.
- **Example**: a sample number from libphonenumber for formatting purposes. It is not a real subscriber. Do not call or text it.

## Rules of thumb

1. **Use E.164** when you store or send a number: \`+\`, the calling code, then the digits, with no spaces, no brackets and no national prefix. The whole thing has at most 15 digits.
2. **Do not type the calling code twice.** If the form already shows a country selector, enter only the national digits.
3. **A calling code can belong to several regions.** \`+1\` covers the US, Canada and many Caribbean countries, and \`+7\` covers Russia and Kazakhstan. See [docs/SHARED-CALLING-CODES.md](docs/SHARED-CALLING-CODES.md).
4. **Length is only a syntax check.** A number can have the right length and still be unassigned, and a number can be valid but belong to a line type that a service refuses, such as a VoIP line.

## Related

Country guides on number format and what each country's services expect:

${guides.map((r) => `- [${r.name_en}](${r.guide})`).join('\n')}

Also: [Non-VoIP vs VoIP numbers for SMS verification](https://usphonegen.com/blog/non-voip-vs-voip-numbers-for-sms-verification).

## Regenerate

\`\`\`bash
pnpm install
pnpm generate
\`\`\`

Output is deterministic for a given libphonenumber-js version. To update, change the version in \`package.json\` and run the command again.

## Data source and license

The tables are generated from the metadata in [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js) (MIT), which is derived from Google's [libphonenumber](https://github.com/google/libphonenumber) (Apache-2.0). Country names come from the Unicode CLDR through the runtime's \`Intl.DisplayNames\`. See [NOTICE](NOTICE).

The scripts and generated files in this repository are released under the [MIT License](LICENSE). Phone number rules change; check the upstream project for the latest data.
`
);
console.log(`regions=${rows.length} shared-codes=${shared.length} guides=${guides.length} version=${pkg.version}`);
