#!/usr/bin/env bash

if [ "$TRAVIS_BRANCH" = "master" ] && [ "$TRAVIS_PULL_REQUEST" = "false" ]; then

  git fetch --all --prune &&
  git checkout master &&
  git rebase origin/master &&
  git checkout -B gh-pages &&

  node_modules/.bin/bower install &&
  node_modules/.bin/gulp prod:build &&

  find -maxdepth 1 | grep -vE 'build|.git$' | grep './' | xargs rm -rf
  mv build/* .
  rm -rf build

  git add -fA &&
  git config --global user.email "bot@faloi.com"
  git config --global user.name "bot"
  git commit -m "Deploy: $(date)" &&
  git push --force --quiet "https://${GH_TOKEN}@github.com/faloi/brusca-compras-ventas.git" gh-pages

fi
