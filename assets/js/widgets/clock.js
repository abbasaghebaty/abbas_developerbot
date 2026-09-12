export function initClock(el, timezone) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  function tick() {
    el.textContent = formatter.format(new Date());
  }

  tick();
  return setInterval(tick, 1000);
}
