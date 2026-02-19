#!/bin/bash

if [ "$VERCEL_ENV" == "production" ]; then
  exit 1
fi

git diff HEAD^ HEAD --quiet -- . ':!docs/' ':!wiki/' ':!prompts/' ':!worker/' ':!*.md' ':!.github/' ':!__tests__/' ':!*.test.ts' ':!*.test.tsx' ':!*.spec.ts' ':!*.spec.tsx'
