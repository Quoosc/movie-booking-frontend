# E2E Testing Guide

## Overview
Bộ E2E tests cho movie-booking-frontend sử dụng Playwright. Tests được thiết kế để:
- Chạy độc lập (không phụ thuộc lẫn nhau)
- Skip gracefully khi thiếu dữ liệu (không fail đỏ)
- Robust với môi trường dev/staging

## Structure

```
e2e/
├── helpers/
│   ├── auth.ts          # Login/logout/isLoggedIn helpers
│   ├── seed-guards.ts   # Check data availability (movies, showtimes, seats)
│   └── waits.ts         # Wait for API requests/responses
├── setup/
│   └── auth.setup.ts    # Auth setup for reusable sessions
├── admin-smoke.spec.ts       # Admin dashboard smoke test ✅
├── public-browse.spec.ts     # Public movie browsing ✅
├── checkout-smoke.spec.ts    # Quick checkout flow ✅
├── auth-smoke.spec.ts        # Login/logout tests 🆕
├── route-guard.spec.ts       # Route protection tests 🆕
├── booking-happy.spec.ts     # Full booking flow 🆕
└── payment-callback.spec.ts  # Payment callback tests 🆕
```

## Test Suites

### 1. auth-smoke.spec.ts
Tests login/logout functionality:
- User can login with email/password
- Session persists on page reload
- User can logout and session is cleared
- Wrong credentials show error

**Required env**: E2E_USER_EMAIL, E2E_USER_PASSWORD

### 2. route-guard.spec.ts
Tests route protection and role-based access:
- Guest cannot access /account/* (redirects to login)
- Guest cannot access /admin
- Regular USER cannot access /admin
- ADMIN can access /admin dashboard
- Regular USER can access /account/*

**Required env**: E2E_USER_EMAIL/PASSWORD, E2E_ADMIN_EMAIL/PASSWORD (optional for admin test)

### 3. booking-happy.spec.ts
Tests complete booking flow:
1. Navigate to movie detail
2. Select showtime
3. Select ticket quantity
4. Select seat
5. Proceed to checkout
6. Verify seat lock API call
7. Click payment button
8. Verify payment order creation

**Required env**: E2E_USER_EMAIL/PASSWORD
**Data requirements**: movies, showtimes, available seats

### 4. payment-callback.spec.ts
Tests payment callback routes:
- Success callback redirects to success page
- Failed callback shows error
- Callback page loads without crashing
- Alternative routes work

**No env required** - uses route mocking

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific suite
npx playwright test auth-smoke
npx playwright test booking-happy

# Run in headed mode (see browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Run specific test
npx playwright test -g "User can login"

# Generate HTML report
npm run test:e2e:report
```

## Environment Variables

Create `.env.e2e` file:

```dotenv
E2E_BASE_URL=http://localhost:5173

E2E_USER_EMAIL=user@example.com
E2E_USER_PASSWORD=password123

E2E_ADMIN_EMAIL=admin@example.com
E2E_ADMIN_PASSWORD=admin123
```

## Data Requirements

Tests use **seed-guards** to check data availability:

### ensureHasMovies(page)
Checks if homepage has clickable movie cards.
**Skips** if no movies found.

### ensureHasShowtimes(page)
Checks if movie detail has showtimes (tries 7 days).
**Skips** if no showtimes found.

### ensureCanSelectSeat(page)
Checks if booking page has available seats.
**Skips** if all seats booked/locked.

### ensureHasTicketTypes(page)
Checks if ticket selection panel exists.
**Skips** if no ticket types configured.

## Selector Strategy

Tests use robust selectors in this priority:

1. **data-testid** (best - if available)
2. **Role + Name** (getByRole)
3. **Text content** (stable labels like "ĐẶT VÉ NGAY")
4. **CSS selectors** (last resort)

Example:
```typescript
// Good
page.getByRole('button', { name: /đặt vé ngay/i })
page.locator('[data-testid="movie-card"]')

// Avoid
page.locator('div.card > button:nth-child(2)')
```

## Debugging

### Screenshots
Failed tests auto-capture screenshots to `e2e/.debug/`:
- `no-showtime.png` - No showtimes available
- `no-seat.png` - No seats available
- `checkout-btn-disabled.png` - CTA button disabled

### Logs
Check console output for helpful messages:
```
✓ Seat lock request detected
⚠ No seat-locks request detected (may be already locked)
```

### Playwright Inspector
```bash
npx playwright test --debug
```

## CI/CD Integration

Tests are designed for CI:
- Skip gracefully when data missing
- Use auth setup for faster runs
- Parallel execution safe
- No hardcoded waits (uses smart waits)

Example GitHub Actions:
```yaml
- name: Run E2E tests
  run: npm run test:e2e
  env:
    E2E_BASE_URL: ${{ secrets.STAGING_URL }}
    E2E_USER_EMAIL: ${{ secrets.E2E_USER_EMAIL }}
    E2E_USER_PASSWORD: ${{ secrets.E2E_USER_PASSWORD }}
```

## Troubleshooting

### Test skips with "No movies available"
**Solution**: Seed database with movies

### Test fails on "waitForTimeout"
**Solution**: Check if selectors match current UI

### Admin test skips
**Solution**: Configure E2E_ADMIN_EMAIL/PASSWORD in .env.e2e

### Payment callback fails
**Solution**: Check if backend has proper CORS for callback route

## Best Practices

✅ **Do:**
- Use seed-guards before testing features
- Skip tests when data unavailable
- Use descriptive test names
- Add comments for complex flows
- Take screenshots on skip/fail

❌ **Don't:**
- Hardcode test data (movie IDs, etc.)
- Use long timeouts (>30s)
- Test implementation details
- Modify passing tests without reason
- Depend on test execution order

## Contributing

When adding new tests:
1. Add to appropriate spec file or create new one
2. Use existing helpers (auth, seed-guards, waits)
3. Skip gracefully on missing data
4. Add to this README
5. Ensure tests run in parallel

## Related Files

- `playwright.config.ts` - Playwright configuration
- `e2e/global-setup.ts` - Global setup (auth sessions)
- `.env.e2e` - Environment variables
- `package.json` - Test scripts
