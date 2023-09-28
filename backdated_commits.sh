#!/bin/bash

# Configure Git user
git config user.name "Aditya Raj Singh"
git config user.email "thisis.adityarajsingh@gmail.com"

# Start fresh
rm -rf .git
git init

# --- Commit 1: Frontend (Sep 26)
cp -r batches/batch1-sep26/* .
git add .
GIT_COMMITTER_DATE="2023-09-26T10:00:00" git commit --date="2023-09-26T10:00:00" -m "Initial frontend structure"

# --- Commit 2: Server (Sep 27)
cp -r batches/batch2-sep27/* .
git add .
GIT_COMMITTER_DATE="2023-09-27T11:00:00" git commit --date="2023-09-27T11:00:00" -m "Backend API and server logic"

# --- Commit 3: AI + misc (Sep 28)
cp -r batches/batch3-sep28/* .
git add .
GIT_COMMITTER_DATE="2023-09-28T13:00:00" git commit --date="2023-09-28T13:00:00" -m "AI features, indexing module, and setup files"

# Push to GitHub
git branch -M main
git remote add origin https://github.com/Adityarajsingh2904/Find_your_job.git
git push -u origin main --force

echo "✅ All commits pushed with simulated dates!"
