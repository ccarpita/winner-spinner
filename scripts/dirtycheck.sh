#!/usr/bin/env bash

C_RED="\e[91m"
C_BOLD="\e[1m"
C_RESET="\e[0;99m"
C_DIM="\e[2m"

echo -ne "${C_DIM}"
if git status --porcelain | grep -E ' ?[AMC]'; then
  echo -e "${C_RESET}${C_RED}${C_BOLD}Error:${C_RESET}${C_RED} One or more files were modified by a previous command (see above).${C_RESET}"
  echo "To pass this check, run \`npm run build\` and add any newly generated or modified files."
  exit 1
fi
echo -ne "${C_RESET}"
