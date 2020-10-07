#!/bin/bash

if [ -z "$(git status --porcelain)" ]; then
  # Working directory clean
  remotes=`git remote`
  printf "Which remote:\n"
  select r in $remotes ; do test -n "$r" && break; echo ">>> Invalid Selection"; done

  # deploy
  git branch -D gh-pages
  git push $r --delete gh-pages
  git checkout -b gh-pages
  npm run build
  mv build deploy
  git add .
  git commit -m 'deploy'
  git subtree push --prefix deploy $r gh-pages
  git checkout master
else
  # Uncommitted changes
  echo 'DOES NOT COMPUTE: You have uncommitted/untracked changes. Deal with it.'
fi
