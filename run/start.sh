#!/usr/bin/env bash
cd frontend
yarn serve &
cd ../backend
python3 api.py grinev2barleytest.h5
