# 🌆 UrbanPulse AI: India's City Intelligence Dashboard

[![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js%2015%2F16-000000?style=flat-flat&logo=nextdotjs)](https://nextjs.org/)
[![Style: TailwindCSS v4](https://img.shields.io/badge/CSS-TailwindCSS%20v4-38bdf8?style=flat-flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Graphics: Recharts](https://img.shields.io/badge/Charts-Recharts-22c55e?style=flat-flat)](https://recharts.org/)
[![Animations: Framer Motion](https://img.shields.io/badge/Animations-Framer%20Motion-f43f5e?style=flat-flat&logo=framer)](https://www.framer.com/motion/)

UrbanPulse AI is a state-of-the-art interactive dashboard designed to cross-reference environmental and demographic datasets for 100 prominent Indian cities. By combining CPCB (Central Pollution Control Board) Air Quality Index (AQI) data with Census demographic figures, UrbanPulse AI helps city planners, environmental officers, and citizens analyze sustainability, pollution loads, and population risks through a premium visual experience.

🔗 **Live Prototype**: [UrbanPulse AI on Vercel](https://urban-pulse-ai-india-s-city-intelli.vercel.app)

---

## 🌟 Key Features

### 1. 🗺️ Interactive Coordinate-Projected India Map
- Custom vector SVG outline mathematically projected from real geographic coordinates.
- 100 interactive city nodes color-coded by CPCB AQI health category.
- Rich tooltips and slide-out analytics drawers with historical trend charts.

### 2. 📊 High-Fidelity Analytics & Visualizations
- **Top Polluted & Cleanest Cities**: Bar charts highlighting extreme performance.
- **State-by-State Aggregates**: Visual comparison of average state air quality.
- **Demographic Scatter Plot**: Population vs. AQI mapping to observe size-to-pollution correlations.
- **AQI Distribution**: Doughnut charts displaying the proportion of cities in each safety tier.

### 3. 🔍 Smart Grid Table & Filters
- Real-time search by city name or state.
- Sortable headers (Rank, City, AQI, Population, AQI per 100k).
- Filter tabs for specific air quality classifications (Good, Moderate, Poor, Severe).
- Pagination (12 items per page) with page-range helpers.

### 4. ⚖️ Multi-City Comparison Tool
- Side-by-side metric comparison of any two cities.
- Automated mathematical comparison summary (e.g., *"Delhi is 3.5x more polluted than Bangalore"*).
- Color-coded medical advisories and seasonal historical line-chart trends.

### 5. 🤖 AI-Style Insights Engine
- Dynamically calculated insights scanning city datasets for extremes, sustainability anomalies, and regional aggregates.
- Environmental warnings based on national averages and demographic thresholds.

### 6. 💾 Export & Share Capabilities
- **Export CSV**: Download filtered search results directly as a spreadsheet.
- **PDF Report**: Custom `@media print` styling to format reports for high-contrast saving/printing.
- **Download City Report**: Export individual city profiles as a structured JSON file.
- **Share Link**: Direct URL query parameter sharing (`?city1=city-1&city2=city-3`) to share comparisons instantly.

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
   *(Logarithmic scaling to prevent small cities from distorting metrics)*
3. **Sustainability Score**:
   $$\text{Sustainability Score} = \text{AQI Score} \times \text{Population Factor}$$
   *(Rewards larger cities that successfully maintain lower pollution levels)*

---

## 📂 Project Architecture

```
├── scratch/
│   └── generate-data.js      # Mock dataset generator script (100 cities with seasonal trends)
├── src/
│   ├── app/
│   │   ├── globals.css       # Global styles, Tailwind v4 imports, map coordinates, custom animations, print rules
│   │   ├── layout.tsx        # App layout and SEO meta tags
│   │   └── page.tsx          # Dashboard page wrapper (Suspense fallback loader)
│   ├── components/
│   │   ├── DashboardContent.tsx  # Master state coordinator, theme toggle, and export buttons
│   │   ├── DashboardOverview.tsx # KPI metric summary cards
│   │   ├── InteractiveMap.tsx    # SVG India map, hover handlers, detailed trend overlays
│   │   ├── InsightsPanel.tsx     # Data-driven AI alerts
│   │   ├── Visualizations.tsx    # Recharts layouts
│   │   ├── CityComparisonTool.tsx# Comparison selector interface
│   │   └── CityRankingTable.tsx   # Paginated grid and CSV export utility
│   ├── data/
│   │   └── cities.json       # Generated dataset of 100 cities
│   └── lib/
│       ├── ranking-engine.ts # Math formula ranking logic
│       ├── data-processing.ts# Data aggregates and insights parsing
│       └── utils.ts          # Classnames utility
```

---

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/7H4N05/UrbanPulse-AI-India-s-City-Intelligence-Dashboard.git
   cd "UrbanPulse AI – India's City Intelligence Dashboard"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🛡️ License

This project is open-source and available under the MIT License.
