# Project Submission: UrbanPulse AI – India's City Intelligence Dashboard

**Developer Repo**: [GitHub Repository](https://github.com/7H4N05/UrbanPulse-AI-India-s-City-Intelligence-Dashboard.git)  
**Framework**: Next.js 15+ (React 19) with TypeScript  
**Design System**: TailwindCSS v4 with custom glassmorphism overrides and light/dark theme toggles  
**Visualizations**: Recharts + Framer Motion animations

---

## 🎓 Quick Submission Fields

1. **Prototype Link**: [Vercel Live URL](https://urban-pulse-ai-india-s-city-intelligence-d.vercel.app/) (or standard test locally at `http://localhost:3000`)
2. **Public Datasets Used**:
   - Central Pollution Control Board (CPCB) National Air Quality Index (AQI) Dataset
   - Office of the Registrar General & Census Commissioner, India (2011 Census Demographic Dataset)
3. **Data Selection Rationale**:
   The dataset was selected because air quality directly impacts public health and quality of life. Combining AQI with population data enables meaningful comparison between cities, helps municipal officers identify pollution hotspots, and allows citizens to better understand environmental conditions when choosing where to live or work.
4. **Data Cleaning & Transformation**:
   - Removed duplicate city records.
   - Standardized city names across datasets.
   - Converted AQI values into categories (Good, Moderate, Poor, Severe).
   - Merged population and AQI datasets using city names.
   - Calculated AQI per 100,000 population.
   - Generated ranking scores and structured data into JSON format for dashboard consumption.

---

## 📋 Table of Contents
1. [Core Features Checklist](#-core-features-checklist)
2. [Bonus Features Checklist](#-bonus-features-checklist)
3. [Architecture & Folder Structure](#-architecture--folder-structure)
4. [Data & Ranking Logic](#-data--ranking-logic)
5. [Interface Highlights](#-interface-highlights)
6. [How to Run & Verify](#-how-to-run--verify)

---

## ⚡ Core Features Checklist

- [x] **Dashboard Overview KPIs**: Custom HSL cards displaying:
  - Total Cities Monitored
  - National Average AQI
  - Highest AQI City (Delhi) with risk badges
  - Cleanest City (Mysore) with verification indicators
  - Total population covered by sensors (110M+ Census count)
- [x] **City Ranking Table**:
  - Interactive grid displaying Rank, City, State, AQI, Category, Population, and AQI per 100k
  - Search bar matching city or state name
  - Sorting toggles across Rank, City, AQI, Population, and AQI per 100k
  - Pagination (12 entries per page) with adaptive page ranges
  - Filter tabs based on CPCB AQI categories (Good, Moderate, Poor, Severe)
- [x] **City Comparison Tool**:
  - Side-by-side selector to contrast any two of the 100 cities
  - Automated mathematical text summary (e.g., "Delhi is 3.5x more polluted than Bangalore")
  - Clean comparison details (AQI, Population, State, Rank)
  - Color-coded medical advisories (Good to Severe air recommendations)
  - Historical 6-month seasonal trend overlays using a Recharts line chart
- [x] **Analytical Visualizations**:
  - Top 10 Most Polluted Cities (Vibrant Red-Orange Bar Chart)
  - Top 10 Cleanest Cities (Emerald-Teal Bar Chart)
  - State Average AQI indexes (Blue-Indigo Bar Chart)
  - Population vs AQI (Four-color categorized Scatter Plot)
  - AQI Category Distribution (Doughnut/Pie Chart detailing absolute counts and percentages)
- [x] **AI-Style Insights Panel**:
  - Dynamic calculations checking dataset extremes
  - High pollution alerts (ratio comparison to national average)
  - Demographic correlations (Mega-cities > 5M showing higher averages)
  - Sustainability exceptions (Nagpur ecological efficiency index compared to similar-tier cities)
  - Best performing and worst performing regional state aggregates
- [x] **Interactive India Map**:
  - Custom vector SVG outline mathematically projected from real geographic coordinates
  - 100 interactive city nodes color-coded by AQI category
  - Hover tooltips showing name, state, AQI, and rank
  - Interactive click drawer displaying current stats, category health advisories, and a custom Recharts historical area chart

---

## 🎁 Bonus Features Checklist

- [x] **Export CSV**: Generates and downloads the current active table filters as a clean `.csv` spreadsheet.
- [x] **Export PDF / Print Report**: Formatted CSS media rules (`@media print`) that transform the layout into a high-contrast black-and-white vector document, suitable for printer outputs or PDF saving.
- [x] **Download City Report**: Downloads the complete metrics summary and AI insights panel as a structured `.json` data file.
- [x] **Share Comparison Link**: Encodes selected comparison cities into URL query parameters (`?city1=city-1&city2=city-3`) and copies the shareable link to the clipboard.

---

## 📂 Architecture & Folder Structure

All major logic is split into standalone modular files:

```
├── scratch/
│   └── generate-data.js      # Mock dataset generator script (100 cities with seasonal trends)
├── src/
│   ├── app/
│   │   ├── globals.css       # Theme definitions, map paths, animations, print rules
│   │   ├── layout.tsx        # SEO Title, Metadata, layout body
│   │   └── page.tsx          # Main entry (Suspense loader)
│   ├── components/
│   │   ├── DashboardContent.tsx  # Global state coordinator, dark/light toggle, report exports
│   │   ├── DashboardOverview.tsx # KPI summary cards
│   │   ├── InteractiveMap.tsx    # SVG India map, hover handlers, detailed trend overlays
│   │   ├── InsightsPanel.tsx     # Data-driven AI alerts
│   │   ├── Visualizations.tsx    # 5-part Recharts charts
│   │   ├── CityComparisonTool.tsx# Selector dropdown comparison matrix
│   │   └── CityRankingTable.tsx   # Searchable sorted list and CSV exporter
│   ├── data/
│   │   └── cities.json       # Generated dataset of 100 cities
│   └── lib/
│       ├── ranking-engine.ts # Formula logic and dynamic ranking sorters
│       ├── data-processing.ts# Stats aggregations and insights parser
│       └── utils.ts          # Tailwind merge helpers
```

---

## 🧮 Data & Ranking Logic

The **Overall Sustainability Score** for each city is calculated dynamically using a weighted blend:
$$\text{Overall Score} = (70\% \times \text{AQI Score}) + (30\% \times \text{Population-Adjusted Sustainability Score})$$

Where:
1. **AQI Score** ($0$ to $100$):
   $$\text{AQI Score} = \max\left(0, 100 - \frac{\text{AQI}}{500} \times 100\right)$$
   *(Rewards cleaner air with higher scores)*
2. **Population Factor** ($0.2$ to $1.0$):
   $$\text{Population Factor} = 0.2 + 0.8 \times \left(\frac{\log_{10}(\text{Population}) - \log_{10}(\text{Min Pop})}{\log_{10}(\text{Max Pop}) - \log_{10}(\text{Min Pop})}\right)$$
   *(Logarithmic scaling to prevent small cities from dominating or distorting metrics)*
3. **Sustainability Score**:
   $$\text{Sustainability Score} = \text{AQI Score} \times \text{Population Factor}$$
   *(Rewards mega-cities that manage to keep AQI levels low)*

---

## ⚙️ How to Run & Verify

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) on your local browser.
3. **Compile Production Build**:
   ```bash
   npm run build
   ```
   *(Verifies standard static page generation and strict type compliance)*
