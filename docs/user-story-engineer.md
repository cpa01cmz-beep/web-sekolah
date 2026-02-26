# User-Story-Engineer Memory

## Domain

User-story-engineer: Deliver small, safe, measurable improvements strictly inside your domain.

## STRICT PHASE Workflow

1. INITIATE → 2. PLAN → 3. IMPLEMENT → 4. VERIFY → 5. SELF-REVIEW → 6. SELF EVOLVE → 7. DELIVER (PR)

## Initiative Checklist

- [x] Check for existing PR with label user-story-engineer (if exists, update, review, fix, comment)
- [x] Check for issues with user-story-engineer label
- [x] Proactive scan limited to domain if no issues/PRs
- [x] Proactive scan repo health/efficiency if nothing valuable

## PR Requirements

- Label: user-story-engineer
- Linked to issue
- Up to date with default branch
- No conflict
- Build/lint/test success
- ZERO warnings
- Small atomic diff

## Patterns Observed

- Previous PRs focused on: missing API endpoints, analytics utilities, documentation updates
- Backend PUT/DELETE endpoints existed for announcements but frontend was missing updateAnnouncement method
- Service pattern: createAnnouncementService with configurable endpoints
- AdminService uses announcementService for CRUD operations

## Implemented Features (This Session)

- Added UPDATE_ANNOUNCEMENT endpoint to API_ENDPOINTS config
- Added update to AnnouncementEndpoints interface
- Added updateAnnouncement method to AnnouncementService
- Added updateAnnouncement to AdminService contract and implementation

## Files Modified

- src/config/api-endpoints.ts - Added UPDATE_ANNOUNCEMENT
- src/services/announcementService.ts - Added update method to interface and implementation
- src/services/serviceContracts.ts - Added updateAnnouncement to AdminService interface
- src/services/adminService.ts - Added updateAnnouncement endpoint config and method

## Key Learnings

- Always check if backend endpoints exist but frontend is missing corresponding methods
- Service contracts in serviceContracts.ts define the interface
- createAnnouncementService factory pattern allows configurable endpoints
- Need to add both the endpoint config and the service method

## Self-Evolve Notes

- Could proactively scan for other entities (grades, users, etc.) that may have similar gaps
- Could check for any other service methods that exist in backend but not frontend

## Implemented Features (Current Session)

- Added DELETE_MESSAGE endpoint to API_ENDPOINTS for TEACHERS and PARENTS
- Added deleteMessage to MessageEndpoints interface
- Added deleteMessage method to MessageService implementation
- Added deleteMessage to TeacherService and ParentService contracts
- Added deleteMessage method to teacherService.ts and parentService.ts implementations
- Created PR #1206

## Files Modified (Current Session)

- src/config/api-endpoints.ts - Added DELETE_MESSAGE for TEACHERS and PARENTS
- src/services/messageService.ts - Added deleteMessage to interface and implementation
- src/services/serviceContracts.ts - Added deleteMessage to TeacherService and ParentService
- src/services/teacherService.ts - Added deleteMessage endpoint config and method
- src/services/parentService.ts - Added deleteMessage endpoint config and method

## Key Learnings (Current Session)

- Backend has DELETE message endpoints at `/api/teachers/:id/messages/:messageId` and `/api/parents/:id/messages/:messageId`
- MessageService uses a factory pattern with configurable endpoints (MessageEndpoints)
- Message deletion was missing from the frontend but existed in backend - same pattern as announcements

## Implemented Features (Current Session - SEO Fix)

- Fixed absolute URLs for SEO meta tags (og:image, twitter:image) in index.html
- Changed from relative path `/og-image.svg` to absolute URL `https://akademia-pro.vercel.app/og-image.svg`
- Issue #1246 - simple, safe, measurable improvement for social media previews

## Files Modified (Current Session - SEO Fix)

- index.html - Changed og:image and twitter:image to use absolute URLs

## Key Learnings (Current Session - SEO Fix)

- SEO meta tags should use absolute URLs for proper social media previews
- og:url already uses absolute URL, og:image and twitter:image were inconsistent
- JSON-LD schema already uses absolute URLs for logo - this aligns with that pattern

## Implemented Features (Current Session - SEO Meta Tags)

- Added viewport-fit=cover to viewport meta tag for iOS notch handling
- Added robots meta tag with "index, follow" for search engine control
- Issue #1276 - simple, safe, measurable improvement for SEO

## Files Modified (Current Session - SEO Meta Tags)

- index.html - Added viewport-fit=cover and robots meta tags

## Key Learnings (Current Session - SEO Meta Tags)

- viewport-fit=cover ensures content extends into the safe area on iOS devices with notches
- robots meta tag with "index, follow" allows search engines to crawl and index the site
- These are standard SEO best practices for modern web applications
