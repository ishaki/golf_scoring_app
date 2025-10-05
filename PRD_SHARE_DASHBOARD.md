# Product Requirements Document: Share Dashboard Feature

## 1. Overview

### Feature Name
Public Dashboard Sharing

### Description
Allow users to share their completed game dashboards with anyone via a public link, without requiring the viewer to have an account or be logged in.

### User Story
**As a** golf player who just completed a game
**I want to** share my game results with friends/family
**So that** they can see the scores, leaderboard, and statistics without needing to log in

## 2. Goals & Objectives

### Primary Goals
- Enable easy sharing of game results
- Allow viewing without authentication
- Maintain data privacy (only shared games visible)

### Success Metrics
- Users can generate shareable links
- Shared links work without login
- Shared dashboards display correctly
- Copy link functionality works

## 3. User Flow

### Happy Path
1. User completes a golf game
2. User views dashboard for completed game
3. User clicks "Share" button
4. System generates unique public link
5. User copies link
6. User shares link (text, email, social media)
7. Recipient opens link (no login required)
8. Recipient sees full dashboard with:
   - Leaderboard
   - Hole-by-hole breakdown
   - Transaction matrix
   - Game summary

### Alternative Flows
- **Un-share**: User can disable public sharing
- **Re-share**: User can re-enable previously shared link
- **View shared**: User can open their own shared link

## 4. Functional Requirements

### 4.1 Share Button
- **Location**: Dashboard page, top-right corner
- **Visibility**: Only shown for completed games
- **States**:
  - Not shared (default)
  - Shared (active link exists)

### 4.2 Share Modal/Dialog
When user clicks "Share":
- Display modal with:
  - Public link URL
  - Copy button
  - QR code (optional)
  - Privacy notice
  - Unshare option

### 4.3 Public Link Generation
- **Format**: `https://app.com/shared/{public_token}`
- **Token**: UUID v4, stored in `games.public_token`
- **Automatic**: Generated when game is created
- **Toggle**: `is_public` flag controls visibility

### 4.4 Public Dashboard View
- **Route**: `/shared/:token`
- **No Auth**: Accessible without login
- **Read-only**: No editing allowed
- **Components**:
  - Leaderboard
  - Hole breakdown
  - Transaction matrix
  - Game summary
  - Footer: "View only - Create your own game"

### 4.5 Privacy & Security
- Only explicitly shared games accessible
- Token required (not guessable)
- RLS policy: `is_public = true` only
- No user data exposed (only game data)
- Cannot see other user's games

## 5. Technical Requirements

### 5.1 Database Changes
```sql
-- Already exists in schema:
games.is_public (BOOLEAN)
games.public_token (UUID)
```

### 5.2 API Endpoints
- `GET /shared/:token` - Fetch public game data
- `POST /games/:id/share` - Enable sharing (set is_public = true)
- `DELETE /games/:id/share` - Disable sharing (set is_public = false)

### 5.3 New Routes
```javascript
/shared/:token - Public dashboard view (no auth)
```

### 5.4 Components
```
- ShareButton.jsx - Toggle share button
- ShareModal.jsx - Share dialog with link
- PublicDashboard.jsx - Public view of dashboard
```

### 5.5 Supabase Queries
```javascript
// Get public game
async function getPublicGame(token) {
  return supabase
    .from('games')
    .select('*')
    .eq('public_token', token)
    .eq('is_public', true)
    .single();
}

// Toggle sharing
async function toggleSharing(gameId, isPublic) {
  return supabase
    .from('games')
    .update({ is_public: isPublic })
    .eq('id', gameId)
    .eq('created_by', user.id);
}
```

## 6. UI/UX Requirements

### 6.1 Share Button Design
```
┌─────────────────────┐
│ 🔗 Share Dashboard  │
└─────────────────────┘
```

When shared:
```
┌─────────────────────┐
│ ✓ Dashboard Shared  │
└─────────────────────┘
```

### 6.2 Share Modal Design
```
┌──────────────────────────────────────────┐
│  Share Your Game Dashboard          [X]  │
├──────────────────────────────────────────┤
│                                          │
│  Anyone with this link can view:        │
│                                          │
│  https://localhost:5177/shared/abc-123  │
│  ┌────────────────────────────────────┐ │
│  │  📋 Copy Link                      │ │
│  └────────────────────────────────────┘ │
│                                          │
│  ☑️ Share publicly                      │
│                                          │
│  [QR Code]                              │
│                                          │
│  ⓘ This link shows the final scores    │
│     and statistics. No login required.  │
│                                          │
│  ┌────────────┐  ┌──────────────────┐  │
│  │ Unshare    │  │ Done             │  │
│  └────────────┘  └──────────────────┘  │
└──────────────────────────────────────────┘
```

### 6.3 Public Dashboard Design
- Same layout as authenticated dashboard
- Add banner: "Public View - Read Only"
- Add footer CTA: "Create your own golf game"
- Remove edit/delete buttons
- Show game metadata (date, course, players)

## 7. Non-Functional Requirements

### Performance
- Public dashboard loads in < 2 seconds
- Copy link instant feedback
- QR code generated on-demand

### Scalability
- Supports unlimited shared links
- No impact on authenticated users

### Compatibility
- Works on all browsers
- Mobile-responsive
- QR codes scannable

### Security
- Token-based access only
- No enumeration attacks possible
- Rate limiting on public endpoint

## 8. Out of Scope (Future)

- Social media sharing buttons
- Password-protected links
- Expiring links
- View analytics (who viewed)
- Embedded dashboard (iframe)
- Custom share messages
- Share individual holes only

## 9. Acceptance Criteria

### Must Have
- [ ] Share button on dashboard page
- [ ] Generate unique public link
- [ ] Copy link to clipboard
- [ ] Public dashboard accessible without login
- [ ] Public dashboard shows all game data correctly
- [ ] Unshare functionality works
- [ ] RLS policies prevent unauthorized access

### Should Have
- [ ] QR code generation
- [ ] Visual feedback when link copied
- [ ] Share modal with instructions
- [ ] Privacy notice in modal

### Nice to Have
- [ ] Share directly to clipboard from button
- [ ] Preview of what recipients see
- [ ] Share count (how many views)

## 10. Timeline & Effort

### Estimated Effort
- **Design**: 1 hour
- **Implementation**: 3-4 hours
- **Testing**: 1 hour
- **Total**: 5-6 hours

### Implementation Phases
1. **Phase 1**: Database queries & API functions (30 min)
2. **Phase 2**: Public dashboard route & component (1.5 hours)
3. **Phase 3**: Share button & modal (1.5 hours)
4. **Phase 4**: Testing & polish (1 hour)
5. **Phase 5**: Documentation (30 min)

## 11. Dependencies

- Supabase schema already has `is_public` and `public_token`
- React Router for public route
- Clipboard API for copy functionality
- (Optional) QR code library

## 12. Risks & Mitigations

### Risk 1: Privacy concerns
**Mitigation**: Clear UI indicating public status, easy unshare

### Risk 2: Token exposure
**Mitigation**: UUID v4 = 2^122 possible values (not guessable)

### Risk 3: Database load from public access
**Mitigation**: Add caching, rate limiting

## 13. Success Criteria

### Launch Criteria
- All "Must Have" acceptance criteria met
- No console errors
- Works on mobile & desktop
- Passes security review

### Post-Launch
- Monitor sharing usage
- Gather user feedback
- Track public link clicks
- Monitor for abuse

## 14. Open Questions

1. Should we show who created the game on public view?
   - **Decision**: Yes, show creator's display name only

2. Should we allow comments on shared games?
   - **Decision**: No (future feature)

3. Should we show live games publicly?
   - **Decision**: No, only completed games

4. Should we allow editing is_public via API directly?
   - **Decision**: Yes, but only by game owner

## 15. References

- Database schema: `supabase-schema-clean.sql`
- Dashboard component: `src/pages/Dashboard.jsx`
- Supabase RLS: Already configured for public access

---

**Status**: Ready for Implementation
**Priority**: Medium-High
**Assigned to**: Development Team
**Estimated Completion**: 1 day
