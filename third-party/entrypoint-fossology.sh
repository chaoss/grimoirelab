#!/bin/bash

echo "Starting container:" $(hostname)

echo "Getting FOSSology source package..."
dget -u https://mentors.debian.net/debian/pool/main/f/fossology/fossology_3.6.0-1.dsc

echo "Building packages..."
cd fossology-3.6.0
/usr/bin/debuild -us -uc
echo "If FOSSology packages were built, look for them where you mounted /build"

