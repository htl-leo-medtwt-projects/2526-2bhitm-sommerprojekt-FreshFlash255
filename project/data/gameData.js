let PLAYER = {
    bitcoin: 0,
    money: 200,
    graphicCardsInventory: {},
    rackInventory: [ {}, {}, {}, {}, ],
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
            description: "Low cost and low output.",
            img: "img/gpu/gpu1.png"
        },
        budgetGpu: {
            name: "Budget GPU",
            price: 1000,
            power: 3,
            energyUse: 2,
            description: "Decent value for early mining.",
            img: "img/gpu/gpu2.png"
        },
        midrangeGpu: {
            name: "Midrange GPU",
            price: 7000,
            power: 7,
            energyUse: 4,
            description: "Balanced output and efficiency.",
            img: "img/gpu/gpu3.png"
        },
        proGpu: {
            name: "Pro GPU",
            price: 20_000,
            power: 14,
            energyUse: 7,
            description: "Strong output for serious rigs.",
            img: "img/gpu/gpu4.png"
        },
        titanGpu: {
            name: "Titan GPU",
            price: 400_000,
            power: 25,
            energyUse: 12,
            description: "Top tier output with high power draw.",
            img: "img/gpu/gpu5.png"
        }
    },
    energySupply: {
        bikeGenerator: {
            name: "Bike Generator",
            price: 80,
            output: 1,
            upkeep: 0,
            description: "Manual power, cheap but tiny output.",
            img: "img/energy/bikeGenerator.png"
        },
        solarPanel: {
            name: "Solar Panel",
            price: 900,
            output: 4,
            upkeep: 0,
            description: "Reliable daytime power.",
            img: "img/energy/solar.png"
        },
        windTurbine: {
            name: "Wind Turbine",
            price: 9500,
            output: 9,
            upkeep: 1,
            description: "Solid output, small maintenance cost.",
            img: "img/energy/windTurbine.png"
        },
        hydroTurbine: {
            name: "Hydro Turbine",
            price: 20_000,
            output: 16,
            upkeep: 2,
            description: "Stable power with moderate upkeep.",
            img: "img/energy/hydroTurbine.png"
        },
        fusionCore: {
            name: "Fusion Core",
            price: 100_000,
            output: 30,
            upkeep: 4,
            description: "Massive output for large operations.",
            img: "img/energy/fusionCore.png"
        },
        gigafusionCore: {
            name: "Giga Fusion Core",
            price: 100_000_000,
            output: 5000,
            upkeep: 70,
            description: "Giga massive output for large operations.",
            img: "img/energy/fusionCore_epic.png"
        }
    },
    bitcoinToMoney: 3600,
    stats: {
        playTimeSeconds: 0,
        totalBtcMined: 0,
        totalMoneyEarned: 0,
        totalMoneySpent: 0,
        btcRateMin: 3600,
        btcRateMax: 3600,
        btcRateSum: 0,
        btcRateSamples: 0,
        currentMoney: 200,
        currentBitcoin: 0,
        currentEnergy: 0,
        currentPower: 0,
        currentUpkeep: 0,
        gpuOwnedCount: 0,
        gpuInstalledCount: 0,
        energySupplyCount: 0,
        energyOutput: 0,
        energyUse: 0,
        energyUpkeep: 0,
    },
    racks: [
        {
            price: 0,
            multiplier: 1.00,
            capacity: 5,
            unlocked: true,
        },
        {
            price: 10_000,
            multiplier: 1.00,
            capacity: 5,
            unlocked: false,
        },
        {
            price: 90_000,
            multiplier: 1.00,
            capacity: 5,
            unlocked: false,
        },
        {
            price: 1_000_000,
            multiplier: 1.00,
            capacity: 5,
            unlocked: false,
        }
    ]
}