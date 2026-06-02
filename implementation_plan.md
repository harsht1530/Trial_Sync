# Implementation Plan - Floating Chatbot Alignment & Responsiveness Refinement

This plan details the refinements to make the global floating chatbot open like a standard floating widget with perfect alignment on both mobile and desktop screens.

## Proposed Changes

---

### Layout Components

#### [MODIFY] [GlobalFloatingChatbot.tsx](file:///d:/Harsh/Trial_Sync/src/components/layout/GlobalFloatingChatbot.tsx)
- Re-style the floating container to open as a standard bottom-right anchored card on all screens:
  - Position: `fixed bottom-24 right-4 sm:right-6`
  - Dimensions: `w-[calc(100vw-32px)] xs:w-[380px] sm:w-[420px] h-[520px] sm:h-[600px]`
  - Corners: `rounded-2xl`
- Remove the redundant top-right overlay close button (`X`) to resolve the alignment overlap with the inner `<PatientChatbot>` header controls. 

## Verification Plan

### Manual Verification
1. Inspect the layout in Google Chrome and verify the chatbot floats exactly 16px above the FAB on all screen widths.
2. Confirm the inner chatbot header actions (Phone, Sound, Maximize) are perfectly aligned and have zero overlapping elements.
3. Confirm that tapping the main FAB (which displays a clear close icon while active) toggles visibility cleanly.
