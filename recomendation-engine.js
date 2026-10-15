/**
 * Vinocent Agro-Chemical Resources - Smart Product Recommendation & Sorting Engine
 * Designed for GitHub Pages & Blogger Integration
 */

class AgroRecommendationEngine {
    constructor(options = {}) {
        this.apiKey = options.apiKey || '';
        this.products = options.products || [];
    }

    /**
     * Compute similarity score between a clicked product and target product
     * Based on: Category match (highest weight), Keyword similarity, and Use case overlap.
     */
    calculateSimilarity(clickedProduct, targetProduct) {
        if (clickedProduct.id === targetProduct.id) return -1; // Don't match self first

        let score = 0;

        // 1. Category exact match (High Weight)
        if (clickedProduct.category === targetProduct.category) {
            score += 50;
        }

        // 2. Keyword / Name token overlap
        const clickedTokens = clickedProduct.name.toLowerCase().split(/\s+/);
        const targetTokens = targetProduct.name.toLowerCase().split(/\s+/);
        const commonTokens = clickedTokens.filter(token => targetTokens.includes(token));
        score += (commonTokens.length * 20);

        // 3. Description / Use case semantic keyword match
        const clickedDesc = clickedProduct.description.toLowerCase();
        const targetDesc = targetProduct.description.toLowerCase();
        
        if (clickedDesc.includes('weed') && targetDesc.includes('weed')) score += 30;
        if (clickedDesc.includes('soil') && targetDesc.includes('soil')) score += 30;
        if (clickedDesc.includes('pest') && targetDesc.includes('pest')) score += 30;
        if (clickedDesc.includes('fluid') && targetDesc.includes('fluid')) score += 30;

        // 4. Fallback slight randomization if AI key is active to simulate neural preference sorting
        if (this.apiKey) {
            score += Math.random() * 10;
        }

        return score;
    }

    /**
     * Sort catalogue items dynamically based on the clicked product item
     */
    sortCatalogue(clickedProductId) {
        const clickedProduct = this.products.find(p => p.id === clickedProductId);
        if (!clickedProduct) return this.products;

        // Sort items descending by similarity score
        const sorted = [...this.products].sort((a, b) => {
            const scoreA = this.calculateSimilarity(clickedProduct, a);
            const scoreB = this.calculateSimilarity(clickedProduct, b);
            return scoreB - scoreA;
        });

        return sorted;
    }
}

// Export for browser global usage
window.AgroRecommendationEngine = AgroRecommendationEngine;
