#!/usr/bin/env python3
"""Render the original four-second gift-scene piano miniature (no voices).
Requires libfluidsynth, the system TimGM6mb soundfont, numpy and ffmpeg.
"""
from pathlib import Path
import ctypes as C
import ctypes.util
import json
import subprocess
import tempfile
import wave
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'cutscenes-v120'
RATE = 48000
DURATION = 4.1
FONT = '/usr/share/sounds/sf2/TimGM6mb.sf2'
# Seconds, MIDI pitch, length, velocity. An original, unhurried D-major phrase.
SCORE = [(0.03,50,2.9,38),(0.07,57,2.2,35),(0.20,66,1.6,43),
         (0.82,69,1.6,42),(1.47,76,1.3,37),(1.54,55,1.7,32),
         (1.58,59,1.7,30),(2.15,74,1.45,40),(2.82,62,0.6,31),
         (2.86,66,0.55,29),(2.90,69,0.5,27)]
lib = C.CDLL(ctypes.util.find_library('fluidsynth'))
def bind(name, result, args):
    fn = getattr(lib, name); fn.restype = result; fn.argtypes = args; return fn
ptr = C.c_void_p
new_settings = bind('new_fluid_settings',ptr,[])
setting_num = bind('fluid_settings_setnum',C.c_int,[ptr,C.c_char_p,C.c_double])
setting_int = bind('fluid_settings_setint',C.c_int,[ptr,C.c_char_p,C.c_int])
new_synth = bind('new_fluid_synth',ptr,[ptr])
load = bind('fluid_synth_sfload',C.c_int,[ptr,C.c_char_p,C.c_int])
program = bind('fluid_synth_program_change',C.c_int,[ptr,C.c_int,C.c_int])
on = bind('fluid_synth_noteon',C.c_int,[ptr,C.c_int,C.c_int,C.c_int])
off = bind('fluid_synth_noteoff',C.c_int,[ptr,C.c_int,C.c_int])
render = bind('fluid_synth_write_float',C.c_int,[ptr,C.c_int,ptr,C.c_int,C.c_int,ptr,C.c_int,C.c_int])
del_synth = bind('delete_fluid_synth',None,[ptr])
del_settings = bind('delete_fluid_settings',None,[ptr])
settings = new_settings()
for key, value in {'synth.sample-rate':RATE,'synth.gain':0.65,'synth.reverb.room-size':0.64,
                   'synth.reverb.damp':0.55,'synth.reverb.level':0.29,'synth.reverb.width':12.0}.items():
    setting_num(settings,key.encode(),value)
setting_int(settings,b'synth.chorus.active',0)
synth = new_synth(settings)
try:
    assert load(synth,FONT.encode(),1) >= 0
    program(synth,0,0)
    count = round(RATE * DURATION)
    left = np.zeros(count,dtype=np.float32); right = np.zeros(count,dtype=np.float32)
    events = sorted([(round(t*RATE),True,p,v) for t,p,d,v in SCORE] +
                    [(round((t+d)*RATE),False,p,0) for t,p,d,v in SCORE])
    cursor = 0
    for sample, start, pitch, velocity in events + [(count,False,0,0)]:
        sample = min(sample,count)
        if sample > cursor:
            render(synth,sample-cursor,left.ctypes.data,cursor,1,right.ctypes.data,cursor,1)
            cursor = sample
        if start: on(synth,0,pitch,velocity)
        else: off(synth,0,pitch)
    stereo = np.column_stack((left,right)); peak = np.max(np.abs(stereo))
    stereo *= 0.82 / max(peak,0.00001)
    with tempfile.TemporaryDirectory(prefix='long-run-cue-') as temp:
        wav = Path(temp) / 'piano.wav'
        with wave.open(str(wav),'wb') as audio:
            audio.setnchannels(2); audio.setsampwidth(2); audio.setframerate(RATE)
            audio.writeframes((np.clip(stereo,-1,1)*32767).astype('<i2').tobytes())
        OUT.mkdir(parents=True,exist_ok=True)
        subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),
            '-af','highpass=f=75,lowpass=f=4800,loudnorm=I=-18.5:TP=-2:LRA=6,afade=t=in:d=0.12,afade=t=out:st=3.30:d=0.72',
            '-ar',str(RATE),'-c:a','libmp3lame','-b:a','256k',
            '-metadata','title=A change of pace','-metadata','artist=The Long Run',
            str(OUT/'a-change-of-pace.mp3')],check=True)
finally:
    del_synth(synth); del_settings(settings)
print(json.dumps({'asset':'assets/cutscenes-v120/a-change-of-pace.mp3','duration':DURATION,
                  'score':SCORE,'instrument':'Acoustic piano, TimGM6mb.sf2, GM program 0'}))
