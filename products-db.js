// products-db.js - Host this on GitHub Pages alongside your site
// Adds a small static product catalog that the recommendation engine will prefer over fetching Blogger
const VINOCENT_PRODUCTS = [
    {
        id: "prod-001",
        name: "Pace System Herbicide 4L",
        categories: ["herbicide", "crop-protection", "weed-control"],
        price: 15400,
        icon: "fa-bottle-droplet",
        description: "Non-selective systemic weed killer for pre-plant land clearing and stubble management."
    },
    {
        id: "prod-002",
        name: "Beta Granular NPK 50kg",
        categories: ["fertilizer", "soil-nutrition", "crop-nutrition"],
        price: 83000,
        icon: "fa-sack-dollar",
        description: "Balanced nutrient blend optimized for cereals, maize, and commercial vegetable crops."
    },
    {
        id: "prod-003",
        name: "Extreme Insecticide 30L",
        categories: ["pesticide", "crop-protection", "pest-control"],
        price: 100500,
        icon: "fa-shield-virus",
        description: "Broad-spectrum knockdown formula against chewing and sucking agricultural pests."
    },
    {
        id: "prod-004",
        name: "Hydraulic Fluid 4L",
        categories: ["equipment-fluid", "machinery", "maintenance"],
        price: 78500,
        icon: "fa-oil-can",
        description: "High-performance hydraulic lubricant for heavy farm machinery, tractors, and pumps."
    },
    // ... You can scale this array up to 1,000+ items seamlessly
];
