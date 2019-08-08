#!/usr/bin/env bash
cd backend
# python3 api.py fake_data.json barley_randomized.h5
# python3 api.py real_data.json barley101GrineV2.h5
# python3 api.py real_data.json kidneyGrineV2.h5
# python3 api.py real_data.json vibrissaeGrineV2.h5
python3 api.py real_data.json dimreduce_example.h5 barley101GrineV2.h5 kidneyGrineV2.h5 vibrissaeGrineV2.h5
