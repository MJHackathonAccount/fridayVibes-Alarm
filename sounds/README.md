# 🎵 Backend Sound Files Directory

## 🚨 How It Works

The alarm clock automatically loads sound files from this folder! Just drop your audio files here and they'll be used during the alarm.

## 💼 Expected File Names

The system looks for these specific files:
- `alarm1.mp3` - Primary brutal wake-up sound
- `alarm2.mp3` - Secondary annoying sound
- `alarm3.mp3` - Third layer of audio chaos
- `siren.mp3` - Emergency siren sound
- `airhorn.mp3` - Air horn blasts

**Note**: If a file doesn't exist, it's simply skipped. No errors!

## 🚀 Quick Start

1. **Find brutal wake-up sounds** (see recommendations below)
2. **Rename them to match the expected names** (alarm1.mp3, alarm2.mp3, etc.)
3. **Drop them in this `sounds/` folder**
4. **Reload the alarm clock** - sounds are loaded automatically!
5. **Test the alarm** - all sounds play simultaneously with generated audio

## 💥 Recommended Sound Types

### Ultimate Wake-Up Sounds:
- **Air horns** - Classic, loud, effective
- **Emergency sirens** - Triggers natural wake-up response  
- **Construction noises** - Jackhammer, drilling, power tools
- **Baby crying** - Biological response to wake up
- **Smoke detector beeping** - Urgent, repetitive
- **Rooster crowing** - Natural alarm sound
- **Train horns** - Deep, penetrating
- **Screaming sounds** - Pure audio torture
- **Heavy metal music** - Loud and jarring
- **Motorcycle revving** - Engine sounds

### Technical Requirements:
- **File size**: Under 10MB each for best performance
- **Length**: 30 seconds to 2 minutes (will loop automatically)
- **Volume**: Make sure they're loud enough!
- **Format**: MP3 works best, but WAV, OGG also supported

## 🎯 Where to Find Sounds

1. **Freesound.org** - Free Creative Commons sounds
   - Search: "air horn", "siren", "alarm", "emergency"
2. **YouTube Audio Library** - Google's free collection
   - Filter by "Sound Effects"
3. **Record your own** - Use your phone to record:
   - Vacuum cleaner
   - Blender at full speed
   - Fire alarm
   - Car horn
4. **Stock audio sites** - Zapsplat, AudioJungle, Epidemic Sound

## 💾 File Structure

```
sounds/
├── alarm1.mp3          ← Your primary brutal sound
├── alarm2.mp3          ← Secondary layer of chaos  
├── alarm3.mp3          ← Third annoying sound
├── siren.mp3           ← Emergency siren
├── airhorn.mp3         ← Air horn blasts
└── README.md           ← This file
```

## ⚙️ Technical Notes

- Files are loaded when the alarm clock starts
- All available files play **simultaneously** during alarm
- Backend sounds play **in addition to** generated sounds (siren, buzz, etc.)
- Volume is set to 70% to prevent speaker damage
- Files loop automatically during alarm
- Missing files are skipped gracefully

## 📝 Example Setup

1. **Download an air horn sound** → rename to `alarm1.mp3`
2. **Find a siren sound** → rename to `siren.mp3` 
3. **Get construction noise** → rename to `alarm2.mp3`
4. **Record a smoke detector** → rename to `alarm3.mp3`
5. **Find fog horn sound** → rename to `airhorn.mp3`

Now you have a **5-layer audio assault** that will wake the dead! 😈

---

**Pro Tip**: Test different combinations to find what works best for you. Some people respond better to high-pitched sounds, others to deep bass. Mix and match for maximum effectiveness! 🎯