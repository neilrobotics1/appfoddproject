# Project Overview: Fodd Landing Page

## App Concept
"Fodd" is a fully personalized food scanner tailored to a user's specific dietary and health profile. The landing page needs to capture emails for early access/waitlist.

## Tech Stack
*   **Framework:** React (using Vite for easy local hosting)
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React (if needed for the email input arrow/spice)

## Design System
*   **Background Color:** `#FFFFFF` (white).
*   **Primary Text Color:** `#111827` (Near black for high contrast).
*   **Secondary Text Color:** `#4B5563` (Lighter gray for the subtitle).
*   **Accent Color:** Use a vibrant, appetizing accent for the sign-up button (e.g., a warm orange `#EA580C` or the blue from the app mockup `#2BA4CE`).
*   **Typography:** 
    *   **Headers:** "Planc Bold Black" (Set this up as a custom font family in Tailwind. If the font file isn't loaded yet, fallback to `system-ui, -apple-system, sans-serif` with `font-black` and extreme boldness).
    *   **Body:** A clean sans-serif like Inter or standard system font.

## Layout Structure (Hero Section)
Create a responsive, modern split-screen layout (min-height: 100vh).

**Left Column (Content & CTA):**
1. **Motto:** The words "Know what food is right for you", and underline "you". 
2.  **Subtitle:** Below the title, include the text: "Fodd is a fully personalized food scanner build around your dietary & health profile". This should be noticeably smaller (`text-xl` or `text-2xl`) and lighter in font-weight and color.
3.  **Email Capture:** A sleek, modern email input field combined with a "Join Waitlist" or "Sign Up" button. Give the input a subtle shadow and a smooth focus transition.

**Right Column (Visual):**
1.  **Mockup:** Display the iPhone mockup image. 
2.  **Styling:** Display clearly without drop shadows.

## Navigation Bar
* **Height:** 84px.
* **Layout:** Fodd logo on the left (aligned with text below), "Home" link in the center.

## Additional Requirements
*   **Scroll Functionality:** The page must be scrollable. Below the main Hero section, add a simple, clean "Features" or "How it Works" section (just a few placeholder columns) so the user can physically scroll down the page.
*   **Responsive:** On mobile devices, stack the columns (Text on top, iPhone on the bottom).

## Colors

Background Color Hex Code: #279cc9

Egg Yolk Hex Code: #ffdc52

Egg Yolk Shadow Hex Code: #f3c555

White text color: #ffffff 

Black text color: #000000

