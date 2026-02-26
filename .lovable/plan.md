

# Add Stagger Delay to Count-Up Stats

## File: `src/components/sections/Hero.tsx`

## What stays unchanged
Everything except the `CountUpStat` component and its usage.

## Change
Pass an `index` prop to each `CountUpStat` and add a stagger delay of 150ms per item before starting the count-up animation.

- `CountUpStat` receives `delay` prop (index * 150ms)
- After `IntersectionObserver` triggers visibility, a `setTimeout` with the delay is used before setting `shouldStart = true`
- Result: stat 0 starts immediately, stat 1 at 150ms, stat 2 at 300ms, stat 3 at 450ms

### Technical detail
- Add `delay` prop to `CountUpStat`
- In the `useEffect` with IntersectionObserver, wrap `setVisible(true)` in `setTimeout(() => setVisible(true), delay)`
- In the map call, pass `delay={i * 150}` to each `CountUpStat`

