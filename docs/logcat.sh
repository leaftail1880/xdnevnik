#!/bin/bash
while :; do 
    adb $@ logcat | sed \
    -e 's/ V /\x00\x1b[0;35m V /g'  \
    -e 's/ D /\x00\x1b[0;36m D /g'  \
    -e 's/ I /\x00\x1b[0;32m I /g'  \
    -e 's/ W /\x00\x1b[0;33m W /g'  \
    -e 's/ E /\x00\x1b[0;31m E /g'  \
    -e 's/ F /\x00\x1b[0;31m F /g'  \
    -e '/Unexpected value from nativeGetEnabledTags/d' \
    -e '/The application may be/d' \
    -e '/onBiometricErrorln_/d'
   sleep 1
done
