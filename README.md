# The Surge: USF Resilience Lab

The Surge is a web-based survival simulation designed for HackUSF 2026. It serves as an educational tool to inform students and residents about proper weather emergency preparation and plans of action through an interactive digital twin of the USF Tampa Campus.

## Overview

In this simulation, players must navigate the USF campus as Category 5 Hurricane Helios approaches. The game is divided into distinct phases:

1.  **Gathering Phase**: Scavenge for essential supplies, complete infrastructure tasks, and consult the Emergency Oracle for guidance.
2.  **Sprint Phase**: Secure your vehicle and choose a final shelter before landfall.
3.  **Gauntlet Phase**: Survive a series of life-threatening events based on your preparations and choices.
4.  **Resilience Audit**: Receive a detailed FEMA-aligned report analyzing your performance and providing real-world preparedness steps.

## Features

- **Dynamic Visuals**: Location images evolve as the storm intensifies, reflecting the increasing danger.
- **Smart Dispatcher**: An AI-powered radio system provides context-aware survival advice and proactive alerts.
- **Educational Integration**: All items and events are based on real FEMA and NFIP guidelines.
- **Immersive Atmosphere**: Includes dynamic weather effects, soundscapes, and a dark, high-stakes aesthetic.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **AI**: Gemini API for the Emergency Oracle and Resilience Audit
- **Audio**: Custom sound system for wind, thunder, and radio effects
- **Voice**: Integrated Text-to-Speech for dispatcher transmissions

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Jascel/The-Surge.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add your API keys (Google TTS optional:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    VITE_GOOGLE_TTS_API_KEY=yout_api_key_here
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```

## License

This project was developed for HackUSF 2026. All rights reserved.
