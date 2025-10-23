# 🧪 Testing Guide - Auraluxe Jewelry Store

## Pre-Testing Setup

### 1. Database Setup
Run these SQL scripts in Supabase SQL Editor:
- `seed-products.sql` - Initial 24 products
- `seed-products-extended.sql` - Additional 50 products
- `add-product-media.sql` - Add YouTube and 360° view columns
- `fix-cart-rls.sql` - Disable RLS for testing

### 2. Create Test User
1. Go to `/auth/signup`
2. Create account: test@example.com / password123
3. Verify you're logged in

---

## Milestone 1: Authentication & User Management ✅

### Authentication Tests
- [ ] Sign up with email/password
- [ ] Sign in with email/password
- [ ] Sign in with Google OAuth
- [ ] Sign out
- [ ] Protected routes redirect to login

### Profile Tests
- [ ] View profile page
- [ ] Edit name
- [ ] Edit address
- [ ] Save changes
- [ ] Profile persists after refresh

### Navigation Tests
- [ ] Header displays correctly
- [ ] Dropdown menus work (Shop, Collections, Services)
- [ ] Mobile menu toggles
- [ ] Theme toggle (light/dark)
- [ ] Breadcrumbs show correct path

---

## Milestone 2: Product Catalog Enhancement ✅

### Shop Page Tests
- [ ] Products display in grid
- [ ] Search by product name works
- [ ] Filter by category (ring, necklace, bracelet, earring)
- [ ] Filter by material
- [ ] Price range sliders work
- [ ] Sort by name (A-Z)
- [ ] Sort by price (low to high)
- [ ] Sort by price (high to low)
- [ ] Active filter badges appear
- [ ] Clear individual filters
- [ ] Clear all filters
- [ ] Results count updates
- [ ] Empty state shows when no results

### Product Card Tests
- [ ] Product images display
- [ ] Hover shows image gallery (cycles every 1s)
- [ ] Dot indicators show current image
- [ ] Favorite button appears on hover
- [ ] Click favorite toggles heart icon
- [ ] Favorite persists after refresh
- [ ] Stock indicators show (Limited/Sold Out)

### Product Detail Tests
- [ ] Product gallery displays
- [ ] Thumbnail navigation works
- [ ] Click thumbnail changes main image
- [ ] Breadcrumb navigation works
- [ ] Product name, price, description display
- [ ] Material and stock status show
- [ ] Quantity selector works
- [ ] Add to cart button works
- [ ] Favorite button toggles
- [ ] Related products display (same category)
- [ ] Related product links work

### Gallery Tabs Tests
- [ ] Images tab shows photo gallery
- [ ] Video tab shows YouTube embed (if available)
- [ ] 360° View tab shows interactive view (if available)
- [ ] Drag left/right rotates 360° view
- [ ] Frame counter displays (e.g., "3 / 12")

---

## Milestone 3: Shopping Cart & Checkout ✅

### Cart Tests
- [ ] Add item to cart from product page
- [ ] Toast notification appears
- [ ] Cart sidebar slides in from right
- [ ] Cart count badge updates in header
- [ ] View cart page shows all items
- [ ] Product images display in cart
- [ ] Increase quantity with + button
- [ ] Decrease quantity with - button
- [ ] Remove item from cart
- [ ] Subtotal calculates correctly
- [ ] Empty cart shows empty state
- [ ] Continue shopping button works

### Checkout Tests
- [ ] Proceed to checkout from cart
- [ ] All address fields required
- [ ] Select Standard Delivery (Free)
- [ ] Select Express Delivery ($15)
- [ ] Select Overnight Delivery ($35)
- [ ] Shipping cost updates in summary
- [ ] Select Stripe payment
- [ ] Select Credit/Debit Card payment
- [ ] Select Paystack payment
- [ ] Select Bitcoin payment
- [ ] Order summary shows all items
- [ ] Subtotal calculates correctly
- [ ] Tax calculates (8%)
- [ ] Total = Subtotal + Shipping + Tax
- [ ] Place order button works
- [ ] Redirects to order confirmation

### Order Confirmation Tests
- [ ] Order number displays
- [ ] Success checkmark shows
- [ ] Order items list correctly
- [ ] Quantities match
- [ ] Prices match
- [ ] Shipping address displays
- [ ] Order total matches
- [ ] Order date shows
- [ ] Continue shopping button works
- [ ] Cart is empty after order

### Cart Sidebar Tests
- [ ] Opens when item added to cart
- [ ] Shows last 5 items
- [ ] Product images display
- [ ] Quantities show
- [ ] Subtotal calculates
- [ ] View Cart button works
- [ ] Checkout button works
- [ ] Close button works
- [ ] Click outside closes sidebar

---

## Milestone 4: Reviews, Favorites & AI ✅

### Reviews Tests
- [ ] View reviews on product page
- [ ] Average rating displays
- [ ] Review count shows
- [ ] Individual reviews display
- [ ] Star ratings show correctly
- [ ] User names display
- [ ] Review dates show
- [ ] Submit review form appears
- [ ] Select star rating (1-5)
- [ ] Write review text
- [ ] Submit review
- [ ] New review appears in list
- [ ] Average rating updates
- [ ] Review count increments

### Favorites Tests
- [ ] Navigate to /favorites
- [ ] All favorited items display
- [ ] Product images show
- [ ] Product names and prices display
- [ ] Item count shows in header
- [ ] Add to cart from favorites
- [ ] Remove from favorites
- [ ] Item disappears from list
- [ ] Empty state shows when no favorites
- [ ] Explore Products button works

### AI Style Advisor Tests
- [ ] Navigate to /style-advisor
- [ ] Upload photo interface shows
- [ ] Click to select image
- [ ] Image preview displays
- [ ] Analyze My Style button appears
- [ ] Click analyze button
- [ ] Loading animation shows
- [ ] AI summary text displays
- [ ] 6 product recommendations show
- [ ] Product images display
- [ ] Product names and prices show
- [ ] Click product goes to detail page
- [ ] Upload Different Photo works
- [ ] State resets correctly

---

## Responsive Design Tests

### Mobile (< 768px)
- [ ] Header collapses to mobile menu
- [ ] Mobile menu toggle works
- [ ] Product grid shows 1 column
- [ ] Cart page is readable
- [ ] Checkout form stacks vertically
- [ ] Product gallery works on touch
- [ ] All buttons are tappable
- [ ] Text is readable

### Tablet (768px - 1024px)
- [ ] Product grid shows 2 columns
- [ ] Navigation is accessible
- [ ] Cart sidebar width appropriate
- [ ] Checkout layout works

### Desktop (> 1024px)
- [ ] Product grid shows 3-4 columns
- [ ] All dropdowns work
- [ ] Hover effects work
- [ ] Layout is balanced

---

## Performance Tests

- [ ] Pages load in < 3 seconds
- [ ] Images load progressively
- [ ] No console errors
- [ ] Smooth animations (60fps)
- [ ] Cart updates quickly
- [ ] Search is responsive

---

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Security Tests

- [ ] Protected routes require login
- [ ] Can't access other users' carts
- [ ] Can't access other users' orders
- [ ] Can't submit reviews without login
- [ ] SQL injection prevented
- [ ] XSS attacks prevented

---

## Edge Cases

- [ ] Add 100 items to cart
- [ ] Search with special characters
- [ ] Very long product names
- [ ] Products with no images
- [ ] Products out of stock
- [ ] Empty search results
- [ ] Network errors handled
- [ ] Slow connection works

---

## Known Issues / Limitations

1. **Payment**: Mock implementation only (no real transactions)
2. **AI**: Random product recommendations (no real AI)
3. **Email**: No email notifications
4. **Images**: Using Unsplash placeholders
5. **RLS**: Disabled for testing (enable for production)

---

## Bug Reporting Template

```
**Bug Title**: [Short description]

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. See error

**Expected Behavior**: 
[What should happen]

**Actual Behavior**: 
[What actually happens]

**Browser**: Chrome 120
**Device**: Desktop / Mobile
**Screenshot**: [If applicable]
```

---

## Test Data

### Test Products
- 74 total products (24 initial + 50 extended)
- Categories: rings, necklaces, bracelets, earrings
- Price range: $119 - $3,299
- Stock levels: 2 - 35 items

### Test User
- Email: test@example.com
- Password: password123

### Test Cards (Mock)
- Stripe: Any card number
- Credit Card: 4242 4242 4242 4242
- Expiry: Any future date
- CVV: Any 3 digits

---

## Success Criteria

✅ All critical paths work without errors
✅ User can complete full purchase flow
✅ All data persists correctly
✅ UI is responsive on all devices
✅ No console errors
✅ Performance is acceptable
✅ Design is consistent throughout

---

## Next Steps After Testing

1. Fix any bugs found
2. Enable RLS policies
3. Add real payment integration
4. Implement real AI
5. Add email notifications
6. Deploy to production
7. Monitor analytics
8. Gather user feedback
