#!/bin/bash
# usage: enhance.sh in.wav out_basename
set -e
CHAIN="highpass=f=80:poles=2,afftdn=nr=6:nf=-65:tn=1,equalizer=f=250:t=q:w=1.2:g=-2,equalizer=f=3800:t=q:w=1.0:g=2.5,equalizer=f=11000:t=h:w=0.7:g=1.5,deesser=i=0.35:m=0.5:f=0.5,acompressor=threshold=-24dB:ratio=3:attack=8:release=160:makeup=4:knee=4,alimiter=limit=0.89:level=false"
J=$(ffmpeg -hide_banner -nostats -y -i "$1" -af "$CHAIN,loudnorm=I=-16:TP=-1.5:LRA=8:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p')
ARGS=$(echo "$J" | python3 -I -c "import json,sys; j=json.load(sys.stdin); print(f\"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}\")")
ffmpeg -hide_banner -loglevel error -y -i "$1" -af "$CHAIN,loudnorm=I=-16:TP=-1.5:LRA=8:linear=true:$ARGS" -ar 48000 -c:a pcm_s24le "$2.wav"
ffmpeg -hide_banner -loglevel error -y -i "$2.wav" -c:a aac -b:a 192k "$2.m4a"
ffmpeg -hide_banner -loglevel error -y -i "$2.wav" -ac 1 -ar 16000 -sample_fmt s16 "${2}_16k.wav"
