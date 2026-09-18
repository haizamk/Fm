#!/usr/bin/env bash
# ==============================================================================
# Script Kemaskini & Pasang Laman Web Khairul FRESH Food (HestiaCP / VPS)
# ==============================================================================
set -e

echo "--------------------------------------------------------"
echo ">> Memulakan kemaskini Khairul FRESH Food dari GitHub..."
echo "--------------------------------------------------------"

# 1. Tarik kod terkini dari Git
if [ -d .git ]; then
    echo ">> [1/4] Menarik kemaskini kod (git pull)..."
    git pull origin main || git pull origin master || true
else
    echo ">> [1/4] Bukan repo git atau direktori manual. Melangkau git pull."
fi

# 2. Pasang dependencies
echo ">> [2/4] Memasang pakej dependencies (npm install)..."
npm install --no-audit --prefer-offline || npm install

# 3. Bina aset pengeluaran
echo ">> [3/4] Membina laman web pengeluaran (npm run build)..."
npm run build

# 4. Pastikan fail PHP Backend disalin dengan betul dan keizinan fail tepat
echo ">> [4/4] Mengesahkan fail PHP API backend..."
mkdir -p dist/api
cp public/api/hitpay.php dist/api/hitpay.php
cp public/api/hitpay.php dist/hitpay.php

# Berikan keizinan fail yang betul
chmod -R 755 dist/api || true
chmod 644 dist/api/hitpay.php || true
chmod 644 dist/hitpay.php || true

# Jika direktori public_html berada di peringkat atas (standard HestiaCP)
if [ -d "../public_html" ] && [ "$PWD" != "$(readlink -f ../public_html)" ]; then
    echo ">> Menyalin fail binaan ke ../public_html..."
    cp -ru dist/* ../public_html/
fi

echo "--------------------------------------------------------"
echo " Selesai! Laman web dan fail HitPay PHP berjaya dikemaskini."
echo "--------------------------------------------------------"
