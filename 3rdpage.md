# Page 3: Audience Functionality

## 3rd page section
The third page of the website follows the features section and features a distinctive visual style and interactive element.

### Visual Style & Background
* **Background Color:** #b8fb3cff
* **Header Text:** "Fodd is for:"
    * **Alignment:** Center aligned.
    * **Color:** White text with a thin black outline.
    * **Typography:** Must match the **Font**, **Text Style**, and **Boldness** of the "Motto Text" from the first page.

### Interactive Functionality: "The Generator"
The center of this page contains an interactive area with approximately 500-600px of empty vertical space for dynamic content.

#### 1. The Trigger Button
* **Label:** "People"
* **Position:** Located at the bottom of the section.
* **Shape:** Fully rounded edge rectangle (Pill shape).
* **Size:** Approximately double the size of the "bubble checkmark" buttons.
* **Styling:** White background, black outline, black text. Font and boldness must match the site's "regular text" standard.
* **Hover Effect:** Must utilize the exact same "Button hover" animation as the "bubble checkmark" buttons on the first page.
* **Click Constraint:** The button is rate-limited; it can only be clicked once every **1.3 seconds** to sync with the animation sequence.

#### 2. The Loading Sequence
Upon clicking the "People" button:
* **Step 1:** A small-ish white loading wheel appears in the center of the empty space for **1 second**.
* **Step 2:** The wheel fades out quickly to reveal the result.

#### 3. The Result (Dynamic Text)
* **Content:** A random string representing a dietary, health, or food allergy profile.
* **Data Pool:** The system pulls from a library of 300–500 unique preferences to ensure variety (e.g., "Lactose Free Pescatarians," "Low-FODMAP," "Kosher diet," "Gluten-Free," "Vegetarians," or "No Drawbacks!").
* **Style:** White text, double the size of the "Motto Text," centered in the space.
* **Animation:** A rapid "reveal" lasting **0.2–0.3 seconds** where the text fades from 0% to 100% opacity while "blowing up" (scaling up) in size.

### Footer Section
Below the interactive area (accessible via scroll, maintaining the same #ADFF14 background):
* **Text:** "SOUND LIKE YOU?"
* **Style:** All caps, matching the established theme.
* **Icon:** An arrow pointing downward located directly beneath the text.