# Security Fixes - 2025-11-13

## Summary
This PR addresses security vulnerabilities in the project dependencies by updating vulnerable packages to their latest secure versions.

## Changes
 - Updated `hono` from 4.8.5 to 4.10.5 to fix CVE-2025-59139 (medium severity)
 - Updated `zod` from 4.0.5 to 4.1.12 for latest bug fixes and improvements
- Auto-updated `jspdf` from 2.5.1 to 3.0.3 via `npm audit fix` (major version change)

## Vulnerabilities Fixed
1. **Medium Severity**: CVE-2025-59139 in Hono - Request body size limit bypass in bodyLimit middleware
2. **Dependencies Updated**: Zod updated to 4.1.12 for latest bug fixes and improvements (note: version 4.0.5 was already patched against CVE-2023-4316)

## Testing
- All existing tests should continue to pass
- No breaking changes expected for the patch updates to hono and zod
- jspdf major version update may require verification of PDF generation functionality

## References
 - CVE-2025-59139: https://nvd.nist.gov/vuln/detail/CVE-2025-59139
