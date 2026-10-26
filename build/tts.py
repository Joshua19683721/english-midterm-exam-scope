import json, os, subprocess, sys, tempfile
import win32com.client

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(os.path.join(ROOT, "..", "assets", "audio"))
MANIFEST = os.path.join(ROOT, "audio-manifest.json")

with open(MANIFEST, encoding="utf-8") as f:
    items = json.load(f)

os.makedirs(OUT, exist_ok=True)
speaker = win32com.client.Dispatch("SAPI.SpVoice")
for v in speaker.GetVoices():
    if "Zira" in v.GetDescription():
        speaker.Voice = v
        break

stream = win32com.client.Dispatch("SAPI.SpFileStream")
tmp = os.path.join(tempfile.gettempdir(), "eng200_tts.wav")

done = 0
for it in items:
    mp3 = os.path.join(OUT, it["file"])
    if os.path.exists(mp3) and os.path.getsize(mp3) > 500:
        done += 1
        continue
    stream.Open(tmp, 3)
    speaker.AudioOutputStream = stream
    speaker.Rate = int(it.get("rate", -1))
    speaker.Speak(it["text"])
    stream.Close()
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", tmp, "-ac", "1", "-ar", "22050", "-b:a", "64k", mp3
    ], check=True)
    done += 1
    if done % 10 == 0 or done == len(items):
        print(f"{done}/{len(items)}", flush=True)

try:
    os.remove(tmp)
except OSError:
    pass
print("DONE", len(items))
