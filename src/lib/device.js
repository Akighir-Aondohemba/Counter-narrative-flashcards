// Browser helpers: clipboard, sharing and reading aloud. Each one fails quietly where unsupported.

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older phones: copy through a hidden text box.
    try {
      const box = Object.assign(document.createElement("textarea"), { value: text });
      box.setAttribute("readonly", "");
      box.style.cssText = "position:fixed;opacity:0";
      document.body.append(box);
      box.select();
      const ok = document.execCommand("copy");
      box.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

// Opens the phone's share menu where there is one, otherwise copies the link.
// Returns "shared", "copied" or "failed".
export async function shareLink(url, title) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return "shared";
    } catch (e) {
      if (e?.name === "AbortError") return "shared"; // the user closed the share menu
    }
  }
  return (await copyText(url)) ? "copied" : "failed";
}

export const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;

// Reads the texts aloud one after another, preferring a Nigerian, then British, English voice.
export function speak(texts, { onEnd } = {}) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const voices = synth.getVoices();
  const voice =
    voices.find((v) => v.lang === "en-NG") ||
    voices.find((v) => v.lang === "en-GB") ||
    voices.find((v) => v.lang?.startsWith("en"));
  const parts = texts.filter(Boolean);
  parts.forEach((text, i) => {
    const u = new SpeechSynthesisUtterance(speakable(text));
    if (voice) u.voice = voice;
    u.rate = 0.95;
    if (i === parts.length - 1 && onEnd) {
      u.onend = onEnd;
      u.onerror = onEnd;
    }
    synth.speak(u);
  });
}

// "₦1.93tn" reads as "1.93 trillion naira"; "$50bn" as "50 billion dollars".
export function speakable(text) {
  const scale = { tn: " trillion", bn: " billion", m: " million", trillion: " trillion", billion: " billion", million: " million" };
  return text.replace(
    /([₦$])\s?(\d+(?:[,.]\d+)*)(?:\s?(trillion|billion|million|tn|bn|m)\b)?/g,
    (_, sign, n, unit) => `${n}${unit ? scale[unit] : ""} ${sign === "₦" ? "naira" : "dollars"}`,
  );
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
