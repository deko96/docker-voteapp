#!/bin/bash

[[ "${APP_ENV}" == "production" ]] && npm start || npm run dev