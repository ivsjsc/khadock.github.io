import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

// AI Design API endpoint
app.post('/api/khadock-gemini-proxy', async (req, res) => {
    try {
        const { prompt, targetLanguage, requestType } = req.body;

        if (!prompt) {
            return res.status(400).json({ 
                error: { message: 'Prompt is required' } 
            });
        }

        // For demo purposes, return a mock response
        // In production, this would call the actual Gemini API
        const mockResponse = generateMockDesignResponse(prompt, requestType);
        
        res.json({ text: mockResponse });
    } catch (error) {
        console.error('Error in AI proxy:', error);
        res.status(500).json({ 
            error: { message: 'Internal server error occurred' } 
        });
    }
});

// Mock response generator for demo purposes
function generateMockDesignResponse(prompt, requestType) {
    if (requestType === 'maintenanceTips') {
        return `**🔧 Maintenance Tips for Your Florida Dock:**

**Monthly Inspections:**
- Check for loose bolts and hardware corrosion
- Inspect decking for cracks, splinters, or damage
- Clear debris from around pilings and structures

**Seasonal Maintenance:**
- Apply marine-grade sealant annually to protect wood
- Check electrical connections and lighting systems
- Inspect dock lines and fenders for wear

**Storm Preparation:**
- Remove loose items and furniture before storms
- Check piling stability and structural integrity
- Ensure proper drainage to prevent water damage

**Florida-Specific Care:**
- Regular cleaning to prevent saltwater corrosion
- Monitor for marine growth and barnacle buildup
- Protect metal components with anti-corrosion treatments`;
    }
    
    if (requestType === 'accessorySuggestions') {
        return `**✨ Recommended Accessories for Your Dock:**

**Essential Additions:**
• **Solar LED Lighting** - Eco-friendly lighting perfect for Florida's sunny climate
• **Dock Cleats & Bumpers** - Heavy-duty hardware for secure boat mooring
• **Weather Station** - Monitor local conditions for safety

**Comfort Features:**
• **Marine-Grade Furniture** - Weather-resistant seating and tables
• **Retractable Awning** - Shade protection from Florida sun
• **Rod Holders** - For the fishing enthusiasts

**Safety Equipment:**
• **Life Ring Station** - Essential safety equipment for water activities
• **Non-Slip Decking** - Enhanced grip surface for wet conditions`;
    }

    // Default design concept response
    const concepts = [
        {
            name: "Florida Coastal Haven",
            vision: "A modern 40-foot dock featuring natural cypress decking with a charming gazebo centerpiece, designed to withstand Florida's marine environment while providing elegant entertaining space.",
            features: [
                "Spacious 12x12 gazebo with hurricane-rated construction",
                "Built-in seating with weather-resistant cushions",
                "Integrated boat lift with 10,000 lb capacity",
                "LED lighting system with smart controls",
                "Storage compartments for marine equipment"
            ],
            materials: [
                "Pressure-treated cypress decking for durability",
                "Marine-grade aluminum railings",
                "Composite materials for low maintenance"
            ],
            style: "Contemporary coastal design with clean lines and natural finishes that complement Florida's waterfront lifestyle.",
            bestFor: "Perfect for families who love entertaining guests while enjoying boating activities in Florida's beautiful coastal waters."
        },
        {
            name: "Executive Waterfront Retreat",
            vision: "A sophisticated 50-foot dock with premium amenities, featuring a covered pavilion and modern boat lift system, designed for luxury waterfront living.",
            features: [
                "Covered pavilion with ceiling fans and lighting",
                "Premium composite decking with slip-resistant surface",
                "Dual boat lift system for multiple watercraft",
                "Built-in bar area with marine-grade appliances",
                "Electrical outlets with GFCI protection"
            ],
            materials: [
                "Premium composite decking materials",
                "Stainless steel hardware throughout",
                "Aluminum frame construction"
            ],
            style: "Upscale modern design with sophisticated finishes and attention to detail.",
            bestFor: "Ideal for discerning homeowners seeking a luxury dock experience with premium amenities."
        }
    ];

    const selectedConcept = concepts[Math.floor(Math.random() * concepts.length)];
    
    return `**${selectedConcept.name}**

**Overall Vision:** ${selectedConcept.vision}

**Key Features & Functionality:**
${selectedConcept.features.map(feature => `• ${feature}`).join('\n')}

**Suggested Materials:**
${selectedConcept.materials.map(material => `• ${material}`).join('\n')}

**Aesthetic Style:** ${selectedConcept.style}

**Best Suited For:** ${selectedConcept.bestFor}

*This concept is optimized for Florida's coastal environment, considering sun exposure, saltwater conditions, and hurricane preparedness.*`;
}

app.listen(PORT, () => {
    console.log(`KhaDock server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to view the website`);
});