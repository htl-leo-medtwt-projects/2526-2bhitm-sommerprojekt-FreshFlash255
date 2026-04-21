let PLAYER = {
    bitcoin: 0,
    money: 200,
    graphicCardsInventory: {},
    rackInventory: {},
    generatingPower: 0,
    energySupply: {},
    energy: 0,
}

let DATA = {
    graphicCards: {
        starterGpu: {
            name: "Starter GPU",
            price: 120,
            power: 1,
            energyUse: 1,
            description: "Low cost and low output."
        },
        budgetGpu: {
            name: "Budget GPU",
            price: 300,
            power: 3,
            energyUse: 2,
            description: "Decent value for early mining."
        },
        midrangeGpu: {
            name: "Midrange GPU",
            price: 650,
            power: 7,
            energyUse: 4,
            description: "Balanced output and efficiency."
        },
        proGpu: {
            name: "Pro GPU",
            price: 1200,
            power: 14,
            energyUse: 7,
            description: "Strong output for serious rigs."
        },
        titanGpu: {
            name: "Titan GPU",
            price: 2200,
            power: 25,
            energyUse: 12,
            description: "Top tier output with high power draw."
        }
    },
    energySupply: {
        bikeGenerator: {
            name: "Bike Generator",
            price: 80,
            output: 1,
            upkeep: 0,
            description: "Manual power, cheap but tiny output."
        },
        solarPanel: {
            name: "Solar Panel",
            price: 400,
            output: 4,
            upkeep: 0,
            description: "Reliable daytime power."
        },
        windTurbine: {
            name: "Wind Turbine",
            price: 900,
            output: 9,
            upkeep: 1,
            description: "Solid output, small maintenance cost."
        },
        hydroTurbine: {
            name: "Hydro Turbine",
            price: 1600,
            output: 16,
            upkeep: 2,
            description: "Stable power with moderate upkeep."
        },
        fusionCore: {
            name: "Fusion Core",
            price: 3000,
            output: 30,
            upkeep: 4,
            description: "Massive output for large operations."
        }
    },
    bitcoinToMoney: 3600,
}