function updateGeneratingPower() {
    const gpuTotals = calculateGpuTotal();
    const energyTotal = calculateEnergyTotal();
    const energyRatio = gpuTotals.energyUse > 0
        ? Math.min(1, energyTotal.output / gpuTotals.energyUse)
        : 0;
    const usageRatio = energyTotal.output > 0
        ? Math.min(1, gpuTotals.energyUse / energyTotal.output)
        : 0;
    const effectivePower = gpuTotals.power * energyRatio;

    currentPower = effectivePower;
    currentUpkeep = energyTotal.upkeep * usageRatio;
    PLAYER.generatingPower = effectivePower;
    PLAYER.energy = energyTotal.output - gpuTotals.energyUse;
}

function calculateGpuTotal() {
    const rackInventory = PLAYER.rackInventory;
    let power = 0;
    let energyUse = 0;

    const accumulate = (bucket) => {
        if (!bucket || typeof bucket !== 'object') {
            return;
        }
        Object.entries(bucket).forEach(([id, count]) => {
            const amount = Number(count) || 0;
            const gpu = DATA.graphicCards[id];
            if (!gpu || amount <= 0) {
                return;
            }
            power += gpu.power * amount;
            energyUse += gpu.energyUse * amount;
        });
    };

    if (Array.isArray(rackInventory)) {
        rackInventory.forEach((rack) => accumulate(rack));
    } else {
        const inventory = rackInventory || PLAYER.graphicCardsInventory || {};
        accumulate(inventory);
    }

    return { power, energyUse };
}

function calculateEnergyTotal() {
    const sources = PLAYER.energySupply || {};
    let output = 0;
    let upkeep = 0;

    Object.entries(sources).forEach(([id, count]) => {
        const amount = Number(count) || 0;
        const source = DATA.energySupply[id];
        if (!source || amount <= 0) {
            return;
        }
        output += source.output * amount;
        upkeep += source.upkeep * amount;
    });

    return { output, upkeep };
}