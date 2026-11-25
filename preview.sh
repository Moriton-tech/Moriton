#!/bin/bash
# Морьтон вэбийн ШИНЭ хувилбарыг (v2) тусдаа туршилтын хаягаар гаргана.
# Эмч нарын ашиглаж буй систем (main) өөрчлөгдөхгүй. Туршилтын хаяг БОДИТ дата дээр ажиллана.
#   bash <(curl -fsSL https://raw.githubusercontent.com/Moriton-tech/Moriton/v2/preview.sh)
set -euo pipefail
say()  { printf "\n▸ %s\n" "$1"; }
fail() { printf "\n✗ %s\n" "$1"; exit 1; }
REPO="https://github.com/Moriton-tech/Moriton"
BRANCH="${BRANCH:-v2}"
SRC="$HOME/moriton-emch"

command -v firebase >/dev/null || fail "Firebase CLI олдсонгүй. Суулгах: npm install -g firebase-tools — дараа нь: firebase login"

say "Кодыг татаж байна ($BRANCH)"
if [ -d "$SRC/.git" ]; then
  git -C "$SRC" fetch -q --depth 1 origin "$BRANCH"
  git -C "$SRC" checkout -q -B "$BRANCH" FETCH_HEAD
else
  rm -rf "$SRC"
  git clone -q --depth 1 -b "$BRANCH" "$REPO" "$SRC"
fi
cd "$SRC"

say "Туршилтын хаяг руу гаргаж байна (30 хоног хүчинтэй)"
firebase hosting:channel:deploy v2 --expires 30d --project moriton-4ecc0 || \
  fail "Гаргаж чадсангүй. «firebase login» хийсэн эсэхээ шалгаад дахин ажиллуулна уу. Дээрх алдааг Claude-д илгээж болно."
say "Болсон. Дээрх «Channel URL» хаягаар шинэ хувилбарыг нээнэ. Эмч нарын систем хэвээр."
