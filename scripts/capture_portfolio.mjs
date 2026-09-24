import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
// Drop zone lives OUTSIDE public/: anything under public/ is copied verbatim
// into the production build, and the raw captures are ~16MB of source material
// that must never ship.
const RAW_DIR = path.join(ROOT_DIR, 'raw');

const PROJECTS = [
  // Order matches the Work page (1-14). Authenticated views (SDGs
  // /super-admin, Smart Test /user) are NOT captured: this launches a
  // fresh headless session with no login, so only public pages render.
  { id: 'p01', name: 'p01-sdgs', title: 'SDGs Universitas Brawijaya', url: 'https://silaras.sdgs.ub.ac.id/' },
  { id: 'p02', name: 'p02-brawijaya-multi-usaha', title: 'Brawijaya Multi Usaha', url: 'https://brawijayamultiusaha.co.id/id' },
  { id: 'p03', name: 'p03-brawijaya-core', title: 'Brawijaya Core', url: 'https://brawijayacore.com/' },
  { id: 'p04', name: 'p04-smart-test', title: 'Smart Test by Brawijaya Core', url: 'https://test.brawijayacore.com/' },
  { id: 'p05', name: 'p05-brawijaya-catering', title: 'Brawijaya Catering', url: 'http://localhost:3001/' },
  { id: 'p06', name: 'p06-brawijaya-tour-and-travel', title: 'Brawijaya Tour and Travel', url: 'https://brawijayatourandtravel.com/' },
  { id: 'p07', name: 'p07-depo-agro', title: 'Depo Agro', url: 'https://depoagro.id/' },
  { id: 'p08', name: 'p08-assets-bmu', title: 'Assets BMU', url: 'http://localhost:3000/' },
  { id: 'p09', name: 'p09-feedback-bmu', title: 'Feedback BMU', url: 'https://feedback.brawijayamultiusaha.co.id/' },
  { id: 'p10', name: 'p10-due-diligence-bmu', title: 'Due Diligence Form BMU', url: 'https://legal.brawijayamultiusaha.co.id/' },
  { id: 'p11', name: 'p11-coe-cbsa', title: 'CoE CBSA', url: 'https://stg-coecbsa.vercel.app/' },
  { id: 'p12', name: 'p12-kembara', title: 'Kembara.id', url: 'https://stg-kembara.vercel.app/' },
  { id: 'p13', name: 'p13-saku-mini-wallet', title: 'Saku Mini Wallet', url: 'https://stg-saku.vercel.app/' },
  { id: 'p14', name: 'p14-dibiedu-lms', title: 'DibiEdu LMS', url: 'https://dibiedu-lms.vercel.app/' },
];

// Helper to convert webm to mp4 via ffmpeg
function convertWebmToMp4(inputWebm, outputMp4) {
  try {
    console.log(`Converting ${path.basename(inputWebm)} to MP4...`);
    execSync(`ffmpeg -y -i "${inputWebm}" -c:v libx264 -pix_fmt yuv420p -preset fast -movflags +faststart "${outputMp4}"`, {
      stdio: 'pipe',
    });
    if (fs.existsSync(outputMp4)) {
      fs.unlinkSync(inputWebm);
      console.log(`Successfully generated ${path.basename(outputMp4)}`);
    }
  } catch (err) {
    console.error(`Failed to convert ${inputWebm} to mp4:`, err.message);
  }
}

async function safeScreenshot(page, filePath, timeoutMs = 20000) {
  try {
    await page.screenshot({ path: filePath, timeout: timeoutMs });
    console.log(`Saved ${path.basename(filePath)}`);
    return true;
  } catch (err) {
    console.log(`Initial screenshot issue for ${path.basename(filePath)}: ${err.message}. Retrying...`);
    try {
      await page.waitForTimeout(1000);
      await page.screenshot({ path: filePath, timeout: 15000 });
      console.log(`Saved ${path.basename(filePath)} on retry`);
      return true;
    } catch (e2) {
      console.error(`Failed to capture ${path.basename(filePath)}:`, e2.message);
      return false;
    }
  }
}

// Wait for any DDoS protection/browser check to complete
async function waitForProtectionChallenge(page) {
  for (let i = 0; i < 20; i++) {
    try {
      const text = await page.evaluate(() => document.body ? document.body.innerText : '');
      if (text.includes('Checking your browser') || text.includes('Please wait for up to 5 seconds') || text.includes('Just a moment') || text.includes('DDoS-Guard') || text.includes('Cloudflare')) {
        console.log('Waiting for browser verification challenge to pass...');
        await page.waitForTimeout(1500);
      } else {
        break;
      }
    } catch (_) {
      await page.waitForTimeout(1500);
    }
  }
  await page.waitForTimeout(2500);
}

// Helper for smooth scrolling
async function smoothScroll(page, durationMs = 4000) {
  try {
    await page.evaluate(async (duration) => {
      await new Promise((resolve) => {
        const body = document.body || document.documentElement;
        if (!body) return resolve();
        const totalHeight = body.scrollHeight - window.innerHeight;
        if (totalHeight <= 0) return resolve();
        const start = performance.now();
        const step = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
          window.scrollTo(0, ease * totalHeight);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(step);
      });
    }, durationMs);
  } catch (_) {}
}

// Helper for smooth scrolling back to top
async function smoothScrollToTop(page, durationMs = 2500) {
  try {
    await page.evaluate(async (duration) => {
      await new Promise((resolve) => {
        const currentScroll = window.scrollY || window.pageYOffset || 0;
        if (currentScroll <= 0) return resolve();
        const start = performance.now();
        const step = (now) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
          window.scrollTo(0, (1 - ease) * currentScroll);
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };
        requestAnimationFrame(step);
      });
    }, durationMs);
  } catch (_) {}
}

async function captureProject(browser, proj) {
  console.log(`\n========================================`);
  console.log(`Processing: ${proj.id} - ${proj.title}`);
  console.log(`URL: ${proj.url}`);
  console.log(`========================================`);

  const projDir = path.join(RAW_DIR, proj.name);
  fs.mkdirSync(projDir, { recursive: true });

  const tempVideoDirDesktop = path.join(projDir, 'temp_rec_desktop');
  const tempVideoDirMobile = path.join(projDir, 'temp_rec_mobile');
  fs.mkdirSync(tempVideoDirDesktop, { recursive: true });
  fs.mkdirSync(tempVideoDirMobile, { recursive: true });

  // 1. DESKTOP CAPTURE & RECORDING
  console.log(`[${proj.id}] Starting Desktop session (1440x900)...`);
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    recordVideo: {
      dir: tempVideoDirDesktop,
      size: { width: 1440, height: 900 },
    },
    ignoreHTTPSErrors: true,
  });

  const desktopPage = await desktopContext.newPage();
  desktopPage.setDefaultTimeout(60000);
  desktopPage.setDefaultNavigationTimeout(60000);

  try {
    await desktopPage.goto(proj.url, { waitUntil: 'networkidle', timeout: 35000 }).catch(async () => {
      await desktopPage.goto(proj.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    });
  } catch (err) {
    console.error(`[${proj.id}] Failed to load desktop page:`, err.message);
  }

  await waitForProtectionChallenge(desktopPage);
  await desktopPage.waitForTimeout(4500);

  // Four desktop views at increasing scroll depth. The first doubles as
  // the hover preview. The glide between them is what the video records.
  const shotAt = async (frac, idx) => {
    await desktopPage.evaluate((f) => {
      const h = document.body.scrollHeight - window.innerHeight;
      window.scrollTo({ top: Math.max(0, h * f), behavior: 'instant' });
    }, frac).catch(() => {});
    await desktopPage.waitForTimeout(1400);
    const out = path.join(projDir, `${proj.id}-desktop-${String(idx).padStart(2, '0')}.png`);
    await safeScreenshot(desktopPage, out, 22000);
    return out;
  };

  const first = await shotAt(0, 1);
  if (fs.existsSync(first)) {
    fs.copyFileSync(first, path.join(projDir, `${proj.id}-preview.png`));
    console.log(`Saved ${proj.id}-preview.png`);
  }
  console.log(`[${proj.id}] Recording desktop scroll interaction...`);
  await smoothScroll(desktopPage, 3800);
  await shotAt(0.33, 2);
  await shotAt(0.66, 3);
  await shotAt(0.98, 4);
  await smoothScrollToTop(desktopPage, 2000);
  await desktopPage.waitForTimeout(800);

  // Close desktop context to finalize the video, then convert to MP4.
  await desktopContext.close();
  const desktopVideos = fs.readdirSync(tempVideoDirDesktop).filter(f => f.endsWith('.webm'));
  if (desktopVideos.length > 0) {
    convertWebmToMp4(
      path.join(tempVideoDirDesktop, desktopVideos[0]),
      path.join(projDir, `${proj.id}-desktop-rec.mp4`),
    );
  }
  try { fs.rmSync(tempVideoDirDesktop, { recursive: true, force: true }); } catch (_) {}

  // Also copy primary files to public/raw root for standard pipeline convenience
  const createdFiles = fs.readdirSync(projDir).filter(f => !f.startsWith('temp_'));
  for (const f of createdFiles) {
    const src = path.join(projDir, f);
    const dest = path.join(RAW_DIR, f);
    try {
      fs.copyFileSync(src, dest);
    } catch (_) {}
  }

  console.log(`[${proj.id}] Finished! All assets saved to ${projDir} and mirrored to ${RAW_DIR}`);
}

async function main() {
  const targetProjId = process.argv[2];
  const listToRun = targetProjId
    ? PROJECTS.filter(p => p.id.toLowerCase() === targetProjId.toLowerCase())
    : PROJECTS;

  if (listToRun.length === 0) {
    console.error(`No project matched "${targetProjId}". Available: ${PROJECTS.map(p => p.id).join(', ')}`);
    process.exit(1);
  }

  console.log(`Launching Chromium (using system Chrome)...`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({
    executablePath: fs.existsSync(chromePath) ? chromePath : undefined,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (const proj of listToRun) {
    try {
      await captureProject(browser, proj);
    } catch (e) {
      console.error(`Error processing ${proj.id}:`, e);
    }
  }

  await browser.close();
  console.log(`\n========================================`);
  console.log(`ALL SITES COMPLETED!`);
  console.log(`========================================\n`);
}

main().catch(err => {
  console.error('Fatal error in capture script:', err);
  process.exit(1);
});
