#!/bin/bash

echo "Starting container:" $(hostname)

echo "Getting FOSSology source package..."
dget -u http://mirrors.kernel.org/fossology/releases/3.0.0/debian/7.0/fossology_3.0.0-1.dsc

echo "Building packages..."
cd fossology-3.0.0
/usr/bin/debuild -us -uc
echo "If FOSSology packages were built, look for them where you mounted /build"

