\# The Surge: USF Resilience Lab  
**\*\*Target Event:\*\*** HackUSF 2026 (Deadline: Sunday, March 29, 11:30 AM)  
**\*\*Target Tracks:\*\*** Climate Teach-In (CTI) Challenge, Best AI Hack  
**\*\*Core Concept:\*\*** A node-based, gamified emergency preparedness simulator acting as a "Digital Twin" of the USF Tampa campus. It transitions players from reactive survival to proactive civic resilience planning against extreme weather and storm surges.

\---

\#\# 1\. Project Goal & Vibe  
\* **\*\*Purpose:\*\*** To answer the CTI prompt: *\*"How might we help Tampa Bay live by the water in a way that is safer, smarter, more equitable, and more resilient?"\**  
\* **\*\*Vibe:\*\*** Impending Storm & Survival Gloom. Urgent, realistic, and highly educational.  
\* **\*\*User Experience:\*\*** The player is trapped on campus during a Category 5 hurricane. They must gather resources, deploy infrastructure defenses, and consult an AI Emergency Dispatcher to survive the rising waters, ultimately generating a real-world preparedness plan.

\---

\#\# 2\. Technical Architecture  
\* **\*\*Stack:\*\*** Single-page application using React and Tailwind CSS.  
\* **\*\*AI Integration:\*\*** Direct fetch calls to LLM APIs (Claude/Gemini) for the chatbot and final report generation.  
\* **\*\*State Management:\*\*** React \`useState\` and \`useEffect\` hooks to manage a centralized \`gameState\` object (player metrics, inventory, location, \`surgeLevel\`). Components will re-render automatically on state changes.

\---

\#\# 3\. Core Mechanics to Implement

\#\#\# A. The State Machine & Navigation  
The game operates on a node-based movement system representing real USF locations.  
\* **\*\*Nodes:\*\*** Muma College of Business, ChickFilA, USF Library, Marshall Student Center (MSC), Beard Garage.  
\* **\*\*Elevation Logic:\*\*** Each location has a \`baseElevation\`. If the global \`surgeLevel\` exceeds this, the node becomes flooded, causing health/item damage to the player if they are there or attempt to fast-travel through it.

\#\#\# B. The "Emergency Oracle" (Context-Injected AI)  
A built-in chat terminal representing a radio connected to an emergency dispatcher.  
\* **\*\*Implementation:\*\*** The LLM prompt must be injected with the current \`gameState\` (Location, Health, Items, Surge Level) *\*before\** being sent to the API.   
\* **\*\*Function:\*\*** The AI provides real-world FEMA and USF-specific survival advice based on the player's exact situation. It acts as a game master validating choices.  
\* **\*\*Constraint:\*\*** Using the radio drains the \`battery\` stat. If the battery dies, the player loses access to the Oracle. They will also not know exactly when the next surge is coming and will have to plan their next gathering stage around it. 

\#\#\# C. The Dynamic Flood Map (Fast Travel)  
\* Players can fast-travel between nodes, but movement carries a "Risk Check".   
\* As \`surgeLevel\` rises, low-elevation routes become impassable. The player must calculate time vs. safety to reach High Ground (e.g., Beard Garage Levels 3-8) before the 90-second real-time "Surge Warning" timer expires.

\#\#\# D. Exportable "Tampa Bay Readiness Plan"  
Instead of a standard "Game Over" screen, the game ends by sending the final \`gameState\` to the LLM.   
\* The LLM generates a personalized, exportable HTML/PDF report evaluating the player's choices.  
\* It highlights what they did right (e.g., securing vehicles), critical vulnerabilities, and actionable real-world steps for Tampa Bay residents.

\---

\#\# 4\. Game Data Context (For LLM Reference)

**\*\*Locations & Geography:\*\***  
\* \`ChickfilaI\`: The best spot for food and water.  
\* \`USF\_LIBRARY\`: High resource value (Knowledge/Supplies), but the basement is a severe flood trap. The top floor is the elite spot.  
\* \`MSC\` (Marshall Student Center): map, food/water scavenging point.  
\* \`BEARD\_GARAGE\`: Top levels (3-8) represent high-ground safe zone for vertical evacuation and parking your car.

**\*\*Real-World Emergency Data (To enforce in logic/AI prompts):\*\***  
\* **\*\*Water Rationing:\*\*** 1 gallon of clean water per person, per day.  
\* **\*\*Vehicle Protocol:\*\*** Emergency brake set, windows closed, parked in elevation and in reverse/gear to prevent drift.  
\* **\*\*Infrastructure Defense:\*\*** Sandbags. Clearing drains prevents foundation flooding.  
\* **\*\*NFIP Policy:\*\*** Up to $1,000 reimbursement for loss avoidance supplies (sandbags, tarps).  
\* **\*\*Evacuation:\*\*** Pizzo Elementary is the on-campus general shelter. You can find other people there.

\---

\#\# 5\. Development Prompting Guidelines for AI Assistants  
1\. **\*\*Scope:\*\*** Use functional React components with hooks (\`useState\`, \`useEffect\`). Avoid complex state management libraries like Redux; rely on standard state lifting or context for speed given the 24-hour hackathon limit.  
2\. **\*\*Prioritize the UI/UX:\*\*** The "Emergency Terminal" look must be clean, responsive, and intuitive using Tailwind utility classes.  
3\. **\*\*Robust State Updates:\*\*** Ensure all child components (Sidebar, Chat, Map) properly receive the \`gameState\` object to trigger re-renders.   
4\. **\*\*Context over Hallucination:\*\*** When writing API bridge functions for the LLM, rigorously enforce the prompt structure so the AI strictly adheres to the provided USF/FEMA data and does not invent game mechanics that aren't coded.  
