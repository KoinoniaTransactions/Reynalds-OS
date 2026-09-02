#!/usr/bin/env node

/**
 * Koinonia Transactions — DORA Front Range Prospect Universe
 *
 * Pulls active individual Colorado real-estate broker records from the
 * official Colorado Information Marketplace (Socrata), filters them to the
 * Koinonia Boulder-to-Pueblo Front Range operating corridor, and writes the
 * result ONLY to the gitignored .local workspace.
 *
 * Person-level records must never be committed to this public repository.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const DATASET_ID = '4zse-6bnw';
const API_BASE = `https://data.colorado.gov/resource/${DATASET_ID}.json`;
const PAGE_SIZE = 50000;
const OUT_DIR = path.resolve('.local/koinonia/marketing/prospects');
const OUT_JSON = path.join(OUT_DIR, 'dora_front_range_active_brokers.json');
const OUT_CSV = path.join(OUT_DIR, 'dora_front_range_active_brokers.csv');
const OUT_SUMMARY = path.join(OUT_DIR, 'dora_front_range_summary.json');

// DORA individual broker prefixes. Company/entity licenses are intentionally
// excluded from the person-level prospect universe.
const BROKER_PREFIXES = ['FA', 'EA', 'IA', 'II', 'EI', 'IR', 'ER'];

// Corridor matching is intentionally broader than the former 17-city list.
// Canonical business rule: BRAIN/KOINONIA_SERVICE_AREA.md
const CORRIDOR = new Map([
  // Boulder / Broomfield / Northwest Metro
  ['BOULDER', 'Boulder / Broomfield / Northwest Metro'],
  ['BROOMFIELD', 'Boulder / Broomfield / Northwest Metro'],
  ['LOUISVILLE', 'Boulder / Broomfield / Northwest Metro'],
  ['LAFAYETTE', 'Boulder / Broomfield / Northwest Metro'],
  ['SUPERIOR', 'Boulder / Broomfield / Northwest Metro'],
  ['ERIE', 'Boulder / Broomfield / Northwest Metro'],
  ['WESTMINSTER', 'Boulder / Broomfield / Northwest Metro'],
  ['ARVADA', 'Boulder / Broomfield / Northwest Metro'],
  ['THORNTON', 'Boulder / Broomfield / Northwest Metro'],
  ['NORTHGLENN', 'Boulder / Broomfield / Northwest Metro'],
  ['FEDERAL HEIGHTS', 'Boulder / Broomfield / Northwest Metro'],

  // Denver / Central Metro
  ['DENVER', 'Denver / Central Metro'],
  ['LAKEWOOD', 'Denver / Central Metro'],
  ['GOLDEN', 'Denver / Central Metro'],
  ['WHEAT RIDGE', 'Denver / Central Metro'],
  ['EDGEWATER', 'Denver / Central Metro'],
  ['MORRISON', 'Denver / Central Metro'],
  ['COMMERCE CITY', 'Denver / Central Metro'],
  ['BRIGHTON', 'Denver / Central Metro'],

  // Aurora / East & Southeast Metro
  ['AURORA', 'Aurora / East & Southeast Metro'],
  ['ENGLEWOOD', 'Aurora / East & Southeast Metro'],
  ['GREENWOOD VILLAGE', 'Aurora / East & Southeast Metro'],
  ['CHERRY HILLS VILLAGE', 'Aurora / East & Southeast Metro'],
  ['CENTENNIAL', 'Aurora / East & Southeast Metro'],
  ['SHERIDAN', 'Aurora / East & Southeast Metro'],
  ['LITTLETON', 'Aurora / East & Southeast Metro'],

  // South Metro / Parker / Douglas County
  ['HIGHLANDS RANCH', 'South Metro / Parker / Douglas County'],
  ['LONE TREE', 'South Metro / Parker / Douglas County'],
  ['PARKER', 'South Metro / Parker / Douglas County'],
  ['CASTLE PINES', 'South Metro / Parker / Douglas County'],
  ['CASTLE ROCK', 'South Metro / Parker / Douglas County'],
  ['FRANKTOWN', 'South Metro / Parker / Douglas County'],
  ['SEDALIA', 'South Metro / Parker / Douglas County'],
  ['LARKSPUR', 'South Metro / Parker / Douglas County'],
  ['ELIZABETH', 'South Metro / Parker / Douglas County'],

  // Pikes Peak / Colorado Springs
  ['MONUMENT', 'Monument / Colorado Springs / Pikes Peak'],
  ['PALMER LAKE', 'Monument / Colorado Springs / Pikes Peak'],
  ['COLORADO SPRINGS', 'Monument / Colorado Springs / Pikes Peak'],
  ['MANITOU SPRINGS', 'Monument / Colorado Springs / Pikes Peak'],
  ['FALCON', 'Monument / Colorado Springs / Pikes Peak'],
  ['PEYTON', 'Monument / Colorado Springs / Pikes Peak'],
  ['BLACK FOREST', 'Monument / Colorado Springs / Pikes Peak'],
  ['FOUNTAIN', 'Monument / Colorado Springs / Pikes Peak'],
  ['SECURITY', 'Monument / Colorado Springs / Pikes Peak'],
  ['SECURITY-WIDEFIELD', 'Monument / Colorado Springs / Pikes Peak'],
  ['WIDEFIELD', 'Monument / Colorado Springs / Pikes Peak'],
  ['WOODLAND PARK', 'Monument / Colorado Springs / Pikes Peak'],

  // Pueblo / Southern Corridor
  ['PUEBLO', 'Pueblo / Southern Corridor'],
  ['PUEBLO WEST', 'Pueblo / Southern Corridor'],
]);

const SELECT_FIELDS = [
  'licenselastreneweddate',
  'licensefirstissuedate',
  'state',
  'zipcode',
  'middlename',
  'verifylicense',
  'suffix',
  'licensestatus',
  'licensetype',
  'licensenumber',
  'city',
  'entityname',
  'licenseexpirationdate',
  'licenseprefix',
  'firstname',
  'lastname',
];

function normalizeCity(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function fetchPage(offset) {
  const where = `licensestatus='Active' AND licenseprefix in(${BROKER_PREFIXES.map((p) => `'${p}'`).join(',')})`;
  const params = new URLSearchParams({
    '$limit': String(PAGE_SIZE),
    '$offset': String(offset),
    '$select': SELECT_FIELDS.join(','),
    '$where': where,
    '$order': 'city,lastname,firstname,licensenumber',
  });

  const url = `${API_BASE}?${params.toString()}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'KoinoniaTransactions-ReynaldsOS/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`DORA request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const all = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await fetchPage(offset);
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
  }

  const corridor = all
    .map((row) => {
      const normalizedCity = normalizeCity(row.city);
      const segment = CORRIDOR.get(normalizedCity);
      if (!segment) return null;
      return {
        ...row,
        koinonia_service_area: 'YES',
        koinonia_segment: segment,
        koinonia_city_normalized: normalizedCity,
        enrichment_status: 'PENDING',
        campaign_status: 'NOT YET SELECTED',
      };
    })
    .filter(Boolean);

  // License number is the stable person-license key for deduplication here.
  const dedupedMap = new Map();
  for (const row of corridor) {
    const key = row.licensenumber || `${row.firstname}|${row.lastname}|${row.city}|${row.zipcode}`;
    dedupedMap.set(key, row);
  }
  const deduped = [...dedupedMap.values()];

  const segmentCounts = {};
  const cityCounts = {};
  const prefixCounts = {};

  for (const row of deduped) {
    segmentCounts[row.koinonia_segment] = (segmentCounts[row.koinonia_segment] || 0) + 1;
    cityCounts[row.koinonia_city_normalized] = (cityCounts[row.koinonia_city_normalized] || 0) + 1;
    prefixCounts[row.licenseprefix] = (prefixCounts[row.licenseprefix] || 0) + 1;
  }

  const summary = {
    generated_at: new Date().toISOString(),
    source: 'Colorado DORA / Colorado Information Marketplace',
    dataset_id: DATASET_ID,
    statewide_active_individual_broker_records_pulled: all.length,
    front_range_corridor_records_before_dedupe: corridor.length,
    front_range_unique_active_broker_prospects: deduped.length,
    segments: Object.fromEntries(Object.entries(segmentCounts).sort((a, b) => b[1] - a[1])),
    cities: Object.fromEntries(Object.entries(cityCounts).sort((a, b) => b[1] - a[1])),
    license_prefixes: Object.fromEntries(Object.entries(prefixCounts).sort((a, b) => b[1] - a[1])),
    note: 'This is the licensing universe, not the send list. Contact enrichment, residential-practice qualification, email validation, suppression, and campaign scoring come next.',
  };

  const csvColumns = [
    'firstname',
    'middlename',
    'lastname',
    'suffix',
    'licensenumber',
    'licenseprefix',
    'licensetype',
    'licensestatus',
    'licensefirstissuedate',
    'licenselastreneweddate',
    'licenseexpirationdate',
    'entityname',
    'city',
    'state',
    'zipcode',
    'verifylicense',
    'koinonia_segment',
    'koinonia_service_area',
    'enrichment_status',
    'campaign_status',
  ];

  const csv = [
    csvColumns.join(','),
    ...deduped.map((row) => csvColumns.map((column) => csvEscape(row[column])).join(',')),
  ].join('\n');

  await Promise.all([
    fs.writeFile(OUT_JSON, JSON.stringify(deduped, null, 2), 'utf8'),
    fs.writeFile(OUT_CSV, csv, 'utf8'),
    fs.writeFile(OUT_SUMMARY, JSON.stringify(summary, null, 2), 'utf8'),
  ]);

  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nPrivate outputs written to:\n- ${OUT_CSV}\n- ${OUT_JSON}\n- ${OUT_SUMMARY}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
