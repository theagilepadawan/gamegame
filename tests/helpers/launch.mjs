// Older gameplay/gesture tests deliberately choose Skip on the opening call.
// The conversation itself is exercised end-to-end by story-briefing.mjs.
export async function skipOpeningCall(page) {
  if(await page.evaluate(()=>window.LR_BRIEFING?.inspect().active))
    await page.locator('.briefing-skip').click();
}
