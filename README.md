# Phone number format reference

Country calling codes, national dialing prefixes and mobile number lengths for 245 regions, in CSV, JSON and Markdown.

Typing a phone number into a sign-up form goes wrong in a small number of predictable ways: a leading `0` that should have been dropped, a country code entered twice, or the wrong number of digits. This table lists what each region expects so you can check before you submit.

Generated 2026-10-02 from [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js) 1.13.14.

## Quick reference

| Region | ISO | Calling code | National prefix | Mobile digits | Example (international) |
|---|---|---|---|---|---|
| United States ([guide](https://usphonegen.com/us-nums)) | US | +1 | 1 | 10* | +1 201 555 0123 |
| United Kingdom ([guide](https://usphonegen.com/uk-nums)) | GB | +44 | 0 | 10 | +44 7400 123456 |
| France ([guide](https://usphonegen.com/fr-nums)) | FR | +33 | 0 | 9 | +33 6 12 34 56 78 |
| India ([guide](https://usphonegen.com/in-nums)) | IN | +91 | 0 | 10 | +91 81234 56789 |
| Indonesia ([guide](https://usphonegen.com/id-nums)) | ID | +62 | 0 | 9-12 | +62 812 345 678 |
| Brazil ([guide](https://usphonegen.com/br-nums)) | BR | +55 | 0 | 10-11 | +55 11 96123 4567 |
| Spain ([guide](https://usphonegen.com/es-nums)) | ES | +34 | - | 9 | +34 612 34 56 78 |
| Russia ([guide](https://usphonegen.com/ru-nums)) | RU | +7 | 8 | 10 | +7 912 345 67 89 |
| Thailand ([guide](https://usphonegen.com/th-nums)) | TH | +66 | 0 | 9 | +66 81 234 5678 |
| Malaysia ([guide](https://usphonegen.com/my-nums)) | MY | +60 | 0 | 9-10 | +60 12 345 6789 |
| Hong Kong SAR China ([guide](https://usphonegen.com/hk-nums)) | HK | +852 | - | 8 | +852 5123 4567 |
| Israel ([guide](https://usphonegen.com/il-nums)) | IL | +972 | 0 | 9 | +972 50 234 5678 |

`*` mobile and landline numbers share the same ranges in this region, so the length applies to every number (North American Numbering Plan).

The full table is in [docs/COUNTRIES.md](docs/COUNTRIES.md). Machine-readable copies: [data/countries.csv](data/countries.csv) and [data/countries.json](data/countries.json).

## How to read the columns

- **Calling code**: the prefix you dial from abroad, written with `+`.
- **National prefix**: the digit you dial before a number inside the same country, for example `0` in the UK or France. **Drop it** when you write the number with the calling code. `06 12 34 56 78` in France becomes `+33 6 12 34 56 78`, and `07400 123456` in the UK becomes `+44 7400 123456`. The US and Canada use `1`, which is the same digit as the calling code.
- **Mobile digits**: the number of digits after the calling code (and without the national prefix) that a mobile number can have. A range such as `9-12` means more than one length is valid.
- **Example**: a sample number from libphonenumber for formatting purposes. It is not a real subscriber. Do not call or text it.

## Rules of thumb

1. **Use E.164** when you store or send a number: `+`, the calling code, then the digits, with no spaces, no brackets and no national prefix. The whole thing has at most 15 digits.
2. **Do not type the calling code twice.** If the form already shows a country selector, enter only the national digits.
3. **A calling code can belong to several regions.** `+1` covers the US, Canada and many Caribbean countries, and `+7` covers Russia and Kazakhstan. See [docs/SHARED-CALLING-CODES.md](docs/SHARED-CALLING-CODES.md).
4. **Length is only a syntax check.** A number can have the right length and still be unassigned, and a number can be valid but belong to a line type that a service refuses, such as a VoIP line.

## Related

Country guides on number format and what each country's services expect:

- [United States](https://usphonegen.com/us-nums)
- [United Kingdom](https://usphonegen.com/uk-nums)
- [France](https://usphonegen.com/fr-nums)
- [India](https://usphonegen.com/in-nums)
- [Indonesia](https://usphonegen.com/id-nums)
- [Brazil](https://usphonegen.com/br-nums)
- [Spain](https://usphonegen.com/es-nums)
- [Russia](https://usphonegen.com/ru-nums)
- [Thailand](https://usphonegen.com/th-nums)
- [Malaysia](https://usphonegen.com/my-nums)
- [Hong Kong SAR China](https://usphonegen.com/hk-nums)
- [Israel](https://usphonegen.com/il-nums)

Also: [Non-VoIP vs VoIP numbers for SMS verification](https://usphonegen.com/blog/non-voip-vs-voip-numbers-for-sms-verification).

## Regenerate

```bash
pnpm install
pnpm generate
```

Output is deterministic for a given libphonenumber-js version. To update, change the version in `package.json` and run the command again.

## Data source and license

The tables are generated from the metadata in [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js) (MIT), which is derived from Google's [libphonenumber](https://github.com/google/libphonenumber) (Apache-2.0). Country names come from the Unicode CLDR through the runtime's `Intl.DisplayNames`. See [NOTICE](NOTICE).

The scripts and generated files in this repository are released under the [MIT License](LICENSE). Phone number rules change; check the upstream project for the latest data.
