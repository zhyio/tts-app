/**
 * TTS App — Document Mode E2E Test
 * Tests: MD upload, chapter parsing, chapter cards rendering,
 *        generate buttons, download naming, mode toggle
 */
import { chromium } from '@playwright/test';

const BASE = 'http://localhost:5175';
const MD_CONTENT = `# 第1章

# 第1章：归乡

雨落在青石板上，发出细密的敲击声。

---

# 第2章

# 第2章：地窖之下

手电筒的光柱切开黑暗，灰尘在光束中翻滚。

---

# 第3章

# 第3章：名单与汉奸

雨水顺着江采萍的银发滴落在老宅门槛上。`;

let browser, page, passed = 0, failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${msg}`);
  } else {
    failed++;
    console.log(`  ✗ ${msg}`);
  }
}

async function setup() {
  browser = await chromium.launch();
  page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
}

async function teardown() {
  await browser.close();
}

// ── Test 1: Page loads ──────────────────────────────────────────
async function testPageLoads() {
  console.log('\n[Test 1] Page loads');
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  const title = await page.title();
  assert(title === 'TTS Studio', `Page title is "${title}"`);

  const header = await page.$('h1');
  assert(header !== null, 'Header h1 exists');
  const headerText = await header.textContent();
  assert(headerText.includes('TTS Studio'), `Header text: "${headerText}"`);
}

// ── Test 2: Document mode toggle ────────────────────────────────
async function testDocModeToggle() {
  console.log('\n[Test 2] Document mode toggle');

  const docBtn = await page.$('button:has-text("文档模式")');
  assert(docBtn !== null, 'Document mode button exists');

  await docBtn.click();
  await page.waitForTimeout(1000);

  const uploadArea = await page.$('text=拖拽 Markdown 文件');
  assert(uploadArea !== null, 'Upload area visible in doc mode');

  const desc = await page.$('text=按章节自动生成配音');
  assert(desc !== null, 'Document mode description visible');

  await docBtn.click();
  await page.waitForTimeout(1000);

  const textMode = await page.$('text=文本转语音');
  assert(textMode !== null, 'Back to text mode after toggle');
}

// ── Test 3: MD file upload & chapter parsing ────────────────────
async function testMdUpload() {
  console.log('\n[Test 3] MD file upload & chapter parsing');

  const docBtn = await page.$('button:has-text("文档模式")');
  await docBtn.click();
  await page.waitForTimeout(1000);

  const fileInput = await page.$('input[type="file"]');
  assert(fileInput !== null, 'File input exists');

  // Dynamically import node modules
  const fs = await import('fs');
  const path = await import('path');
  const os = await import('os');
  const tmpFile = path.join(os.tmpdir(), 'test-chapters.md');
  fs.writeFileSync(tmpFile, MD_CONTENT, 'utf-8');

  await fileInput.setInputFiles(tmpFile);
  await page.waitForTimeout(2000);

  const fileName = await page.$('text=test-chapters.md');
  assert(fileName !== null, 'Uploaded file name displayed');

  const chapterList = await page.$('text=章节列表');
  assert(chapterList !== null, 'Chapter list header appeared');

  const ch1 = await page.$('text=第1章：归乡');
  assert(ch1 !== null, 'Chapter 1 title found');

  const ch2 = await page.$('text=第2章：地窖之下');
  assert(ch2 !== null, 'Chapter 2 title found');

  const ch3 = await page.$('text=第3章：名单与汉奸');
  assert(ch3 !== null, 'Chapter 3 title found');

  const progress = await page.$('text=0/3 已完成');
  assert(progress !== null, 'Progress shows 0/3 completed');

  fs.unlinkSync(tmpFile);
}

// ── Test 4: Chapter card buttons ────────────────────────────────
async function testChapterCardButtons() {
  console.log('\n[Test 4] Chapter card buttons');

  const genButtons = await page.$$('button:has-text("生成配音")');
  assert(genButtons.length === 3, `All 3 chapters have "生成配音" buttons (found ${genButtons.length})`);

  const waitingBadges = await page.$$('text=等待中');
  assert(waitingBadges.length === 3, `All 3 chapters show "等待中" status (found ${waitingBadges.length})`);

  const wordCount = await page.$('text=/字$/');
  assert(wordCount !== null, 'Word count displayed for chapters');
}

// ── Test 5: Generate all button (API key missing error) ─────────
async function testGenerateAllButton() {
  console.log('\n[Test 5] Generate all button');

  const genAllBtn = await page.$('button:has-text("全部生成")');
  assert(genAllBtn !== null, '"全部生成" button exists');

  await genAllBtn.click();
  await page.waitForTimeout(2000);

  const errorMsg = await page.$('text=请先在设置中配置 API Key');
  assert(errorMsg !== null, 'Shows API Key error message');

  const errorBadges = await page.$$('text=失败');
  assert(errorBadges.length >= 1, `At least 1 chapter shows "失败" status (found ${errorBadges.length})`);
}

// ── Test 6: Individual retry after error ────────────────────────
async function testRegenerateButton() {
  console.log('\n[Test 6] Individual retry button');

  const retryBtns = await page.$$('button:has-text("重试")');
  assert(retryBtns.length >= 1, `After error, retry buttons appear (found ${retryBtns.length})`);
}

// ── Test 7: Exit document mode ──────────────────────────────────
async function testExitDocMode() {
  console.log('\n[Test 7] Exit document mode');

  const exitBtn = await page.$('button:has-text("退出文档模式")');
  assert(exitBtn !== null, '"退出文档模式" button exists');

  await exitBtn.click();
  await page.waitForTimeout(1000);

  const textMode = await page.$('text=文本转语音');
  assert(textMode !== null, 'Returned to text mode');

  const chapterList = await page.$('text=章节列表');
  assert(chapterList === null, 'Chapter list cleared after exit');
}

// ── Test 8: Re-enter doc mode ───────────────────────────────────
async function testReenterDocMode() {
  console.log('\n[Test 8] Re-enter doc mode with fresh upload');

  const docBtn = await page.$('button:has-text("文档模式")');
  await docBtn.click();
  await page.waitForTimeout(1000);

  const uploadArea = await page.$('text=拖拽 Markdown 文件');
  assert(uploadArea !== null, 'Upload area fresh after re-enter');
}

// ── Test 9: MD parser edge cases ────────────────────────────────
async function testMdParserEdgeCases() {
  console.log('\n[Test 9] MD parser edge cases');

  const fs = await import('fs');
  const path = await import('path');
  const os = await import('os');

  // Ensure we're in doc mode with a clean upload area.
  // "退出文档模式" only shows when chapters exist; otherwise toggle the doc mode button.
  const exitBtn2 = await page.$('button:has-text("退出文档模式")');
  if (exitBtn2) {
    await exitBtn2.click();
    await page.waitForTimeout(500);
  } else {
    // No chapters showing — just toggle doc mode off then on
    const docBtnToggle = await page.$('button:has-text("文档模式")');
    if (docBtnToggle) {
      await docBtnToggle.click();
      await page.waitForTimeout(500);
    }
  }
  // Now re-enter doc mode
  const docBtn3 = await page.$('button:has-text("文档模式")');
  if (docBtn3) {
    await docBtn3.click();
    await page.waitForTimeout(1000);
  }

  // Test: file without chapters
  const noChapterFile = path.join(os.tmpdir(), 'test-no-chapter.md');
  fs.writeFileSync(noChapterFile, '# Hello\n\nSome text without chapter marks.', 'utf-8');

  let fileInput = await page.$('input[type="file"]');
  assert(fileInput !== null, 'File input available for edge case test');
  await fileInput.setInputFiles(noChapterFile);
  await page.waitForTimeout(2000);

  const noChapterError = await page.$('text=未找到章节标记');
  assert(noChapterError !== null, 'Error shown for file without chapters');

  // Remove and test non-md file — use the X inside the file info card
  const removeBtn = await page.$('.glass-subtle button:has(svg)'); // X button in file info area
  if (!removeBtn) {
    // Fallback: the last small X button
    const allX = await page.$$('button:has(svg)');
    if (allX.length > 0) await allX[allX.length - 1].click();
  } else {
    await removeBtn.click();
  }
  await page.waitForTimeout(1000);

  const txtFile = path.join(os.tmpdir(), 'test.txt');
  fs.writeFileSync(txtFile, 'plain text', 'utf-8');

  fileInput = await page.$('input[type="file"]');
  if (!fileInput) {
    // If input still not found, the component may need a re-render trigger
    // Try clicking the upload area to ensure it's interactive
    const uploadArea = await page.$('text=拖拽 Markdown 文件');
    if (uploadArea) await uploadArea.click();
    await page.waitForTimeout(500);
    fileInput = await page.$('input[type="file"]');
  }
  assert(fileInput !== null, 'File input available after remove');
  await fileInput.setInputFiles(txtFile);
  await page.waitForTimeout(2000);

  const txtError = await page.$('text=仅支持 .md 格式');
  assert(txtError !== null, 'Error shown for non-md file');

  fs.unlinkSync(noChapterFile);
  fs.unlinkSync(txtFile);
}

// ── Test 10: Full state screenshot ──────────────────────────────
async function testFullSnapshot() {
  console.log('\n[Test 10] Final state screenshot');

  const fs = await import('fs');
  const path = await import('path');
  const os = await import('os');

  // Ensure clean doc mode
  const exitBtn3 = await page.$('button:has-text("退出文档模式")');
  if (exitBtn3) {
    await exitBtn3.click();
    await page.waitForTimeout(500);
  } else {
    const docBtnToggle2 = await page.$('button:has-text("文档模式")');
    if (docBtnToggle2) {
      await docBtnToggle2.click();
      await page.waitForTimeout(500);
    }
  }
  const docBtn4 = await page.$('button:has-text("文档模式")');
  if (docBtn4) {
    await docBtn4.click();
    await page.waitForTimeout(1000);
  }

  const tmpFile = path.join(os.tmpdir(), 'test-final.md');
  fs.writeFileSync(tmpFile, MD_CONTENT, 'utf-8');

  const fileInput = await page.$('input[type="file"]');
  assert(fileInput !== null, 'File input available for final screenshot');
  await fileInput.setInputFiles(tmpFile);
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'dist/test-doc-mode.png', fullPage: true });
  console.log('  ✓ Screenshot saved to dist/test-doc-mode.png');

  const cards = await page.$$('.glass-card');
  assert(cards.length >= 4, `Multiple glass cards rendered (found ${cards.length})`);

  fs.unlinkSync(tmpFile);
}

// ── Run all tests ───────────────────────────────────────────────
async function run() {
  console.log('=== TTS App Document Mode E2E Tests ===\n');

  try {
    await setup();
    await testPageLoads();
    await testDocModeToggle();
    await testMdUpload();
    await testChapterCardButtons();
    await testGenerateAllButton();
    await testRegenerateButton();
    await testExitDocMode();
    await testReenterDocMode();
    await testMdParserEdgeCases();
    await testFullSnapshot();
  } catch (err) {
    failed++;
    console.log(`  ✗ Unexpected error: ${err.message}`);
    console.log(err.stack);
  } finally {
    await teardown();
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
