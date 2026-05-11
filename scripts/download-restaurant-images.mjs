/**
 * Скачивает по одному JPEG на каждый bulk-ресторан в `public/images/restaurants/<slug>.jpg`.
 * Источник — Unsplash (CC0 / Unsplash License). Photo ID-ы подобраны вручную под кухню/тему.
 *
 * Запуск:  node scripts/download-restaurant-images.mjs
 */
import { mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public', 'images', 'restaurants');

/** slug → Unsplash photo ID (тематически подходит под кухню/атмосферу) */
const SLUG_TO_PHOTO = {
  // bulk-рестораны (43 шт.) — порядок и слаги совпадают с extra-restaurants.demo.ts
  'black-rabbit-gastro-burrow': '1647272196366-67e31b7ffbdc', // dim modern interior
  'taifas': '1551632436-cbf8dd35adfa',                        // cosy dining
  'popasul-dacilor': '1565650834520-0b48a5c83f43',            // traditional wood
  'fuior': '1538333581680-29dd4752ddf2',                      // calm empty hall
  'mi-piace': '1558138838-76294be30005',                      // italian / pizza
  'il-forno': '1632657606412-089f735aa87c',                   // pizza oven
  'creme-de-la-creme-chisinau': '1543745503-c03673999b29',    // patisserie / café
  'asian-street': '1696449241254-11cf7f18ce32',               // pan-asian counter
  'saperavi': '1538334421852-687c439c92f4',                   // wooden tables
  'gok-oguz': '1494346480775-936a9f0d0877',                   // people at table
  'andys-pizza-chisinau': '1600628421066-f6bda6a7b976',       // pizza on plate
  'caravan-actuell': '1517248135467-4c7edcad34c4',            // elegant pub
  'rozmarin': '1559339352-11d035aa65de',                      // mediterranean view
  'propaganda-cafe': '1469631423273-6995642a6a40',            // coffee machines
  'zaxi-grill-house': '1535850452425-140ee4a8dbae',           // pendant red lamps
  'berlin-pub': '1485872299829-c673f5194813',                 // pub crowd
  'draft-station': '1574879948818-1cfda7aa5b1a',              // pouring beer
  'osho-kitchen': '1579584425555-c3ce17fd4351',               // sushi / fusion
  'select-cafe': '1604552584409-44de624c9f57',                // marble cafe table
  'atypic': '1583354608715-177553a4035e',                     // fine round table
  'fusion-kitchen': '1725122194872-ace87e5a1a8d',             // restaurant w/ paintings
  'bucataria-mamei': '1613274554329-70f997f5789f',            // home dining
  'vatra-neamului': '1729394405518-eaf2a0203aa7',             // many tables hall
  'mamalyga': '1667388968964-4aa652df0a9b',                   // big traditional hall
  'supadupa': '1660203861072-318f2c468d94',                   // open kitchen / soup vibe
  'torro-grill': '1508424757105-b6d5ad9329d0',                // steakhouse group
  'frankos-chisinau': '1566843972142-a7fcb70de55a',           // baked pizza
  'pizza-mania': '1672856398893-2fb52d807874',                // pizza slice
  'molotov-rum-bar': '1605270012917-bf157c5a9541',            // pink cocktail
  'invino-enoteca': '1615887584283-91f1be7fdc34',             // wine sofa
  'grazie-mille': '1667388969250-1c7220bf3f37',               // italian room
  'trattoria-della-nonna': '1570560258879-af7f8e1447ac',      // people inside eatery
  'la-bettola': '1667020080976-9dfee090458e',                 // dining room w/ couch
  'green-hours': '1685718913827-4321d75a19cd',                // counter w/ plant
  'kiwi-organic-cafe': '1610478506931-12bcb8e5c5f8',          // cafe sign
  'salonas-je': '1572116469696-31de0f17cc34',                 // bar with bulbs
  'bendery-club': '1502364271109-0a9a75a2a9df',               // chef / grill
  'wine-house': '1569924995012-c4c706bfcd51',                 // woman at bar
  'beer-house-chisinau': '1642647916334-82e513d9cc48',        // counter
  'kellers': '1651977560863-ca39bfa5176f',                    // bar with tables
  'la-copac': '1676260808397-67ead2bbe666',                   // summer chairs lamps
  'tiramisu': '1547613816-3b707bf53e87',                      // patisserie storefront
  'krysha-sky-bar': '1597075687490-8f673c6c17f6',             // martini elegant
};

const PHOTO_PARAMS = '?w=1600&q=80&fm=jpg&fit=crop';

async function fileExists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function downloadOne(slug, photoId) {
  const url = `https://images.unsplash.com/photo-${photoId}${PHOTO_PARAMS}`;
  const dest = path.join(PUBLIC_DIR, `${slug}.jpg`);
  if (await fileExists(dest)) {
    return { slug, status: 'skip', dest };
  }
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/jpeg,image/*;q=0.8,*/*;q=0.7',
    },
    redirect: 'follow',
  });
  if (!res.ok) {
    return { slug, status: 'error', dest, code: res.status };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5_000) {
    return { slug, status: 'error', dest, code: `tiny ${buf.length}b` };
  }
  await writeFile(dest, buf);
  return { slug, status: 'ok', dest, bytes: buf.length };
}

async function main() {
  await mkdir(PUBLIC_DIR, { recursive: true });
  const entries = Object.entries(SLUG_TO_PHOTO);
  console.log(`Downloading ${entries.length} photos to ${PUBLIC_DIR}`);

  let ok = 0,
    skipped = 0,
    errors = 0;
  // Параллельная загрузка по 6 — Unsplash CDN это легко тянет.
  const queue = [...entries];
  const workers = Array.from({ length: 6 }, async () => {
    while (queue.length) {
      const next = queue.shift();
      if (!next) return;
      const [slug, photoId] = next;
      try {
        const r = await downloadOne(slug, photoId);
        if (r.status === 'ok') {
          ok += 1;
          console.log(`✓ ${slug.padEnd(36)} ${(r.bytes / 1024).toFixed(1)} KB`);
        } else if (r.status === 'skip') {
          skipped += 1;
          console.log(`· ${slug.padEnd(36)} (skip, exists)`);
        } else {
          errors += 1;
          console.log(`✗ ${slug.padEnd(36)} ${r.code}`);
        }
      } catch (e) {
        errors += 1;
        console.log(`✗ ${slug.padEnd(36)} ${e.message}`);
      }
    }
  });
  await Promise.all(workers);

  console.log(`\nDone. ok=${ok} skipped=${skipped} errors=${errors}`);
  if (errors) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
