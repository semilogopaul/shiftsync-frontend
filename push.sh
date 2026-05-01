#!/usr/bin/env bash
# Stage, commit, and push the frontend repo in one go.
# Usage:
#   ./push.sh                       # uses default commit message
#   ./push.sh "your commit message" # custom message
set -euo pipefail

cd "$(dirname "$0")"

MSG="${1:-chore: sync frontend}"

echo "▶ git status"
git status -sb

echo
echo "▶ staging all changes"
git add -A

if git diff --cached --quiet; then
  echo "Nothing to commit. Pushing anyway in case local commits are ahead."
else
  echo "▶ committing: $MSG"
  git commit -m "$MSG"
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo
echo "▶ pushing to origin/$BRANCH"
git push -u origin "$BRANCH"

echo
echo "✔ done"
