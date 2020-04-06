const randfloat = (arr, min, max, basePrice, cb = (v) => v) => {
  arr.push(
    [min, max]
      .map((v) => v * basePrice)
      .map((v) => v + 0.99999)
      .map((v) => Math.trunc(v / 1000))
      .map(cb)
  );
};

const pattern0 = (basePrice) => {
  const probabilities = [];
  const current = [];

  for (let decPhaseLen1 = 2; decPhaseLen1 <= 3; decPhaseLen1++) {
    const decPhaseLen2 = 5 - decPhaseLen1;
    for (let hiPhaseLen1 = 0; hiPhaseLen1 <= 6; hiPhaseLen1++) {
      const hiPhaseLen2and3 = 7 - hiPhaseLen1;
      for (let hiPhaseLen3 = 0; hiPhaseLen3 < hiPhaseLen2and3; hiPhaseLen3++) {
        // high phase 1
        for (let i = 0; i < hiPhaseLen1; i++) {
          randfloat(current, 900, 1400, basePrice);
        }
        // decreasing phase 1
        for (let i = 0; i < decPhaseLen1; i++) {
          randfloat(current, 600 - 40 * i - 60 * i, 800 - 40 * i, basePrice);
        }
        // high phase 2
        for (let i = 0; i < hiPhaseLen2and3 - hiPhaseLen3; i++) {
          randfloat(current, 900, 1400, basePrice);
        }

        // decreasing phase 2
        for (let i = 0; i < decPhaseLen2; i++) {
          randfloat(current, 600 - 40 * i - 60 * i, 800 - 40 * i, basePrice);
        }

        // high phase 3
        for (let i = 0; i < hiPhaseLen3; i++) {
          randfloat(current, 900, 1400, basePrice);
        }

        // commit probability
        probabilities.push([...current]);
        current.length = 0;
      }
    }
  }

  return probabilities;
};

const pattern1 = (basePrice) => {
  const probabilities = [];
  const current = [];

  for (let peakStart = 3; peakStart <= 9; peakStart++) {
    let work = 2;
    for (; work < peakStart; work++) {
      randfloat(
        current,
        850 - 30 * (work - 2) - 20 * (work - 2),
        900 - 30 * (work - 2),
        basePrice
      );
    }

    randfloat(current, 900, 1400, basePrice);
    randfloat(current, 1400, 2000, basePrice);
    randfloat(current, 2000, 6000, basePrice);
    randfloat(current, 1400, 2000, basePrice);
    randfloat(current, 900, 1400, basePrice);

    work += 5;
    for (; work < 14; work++) {
      randfloat(current, 400, 900, basePrice);
    }

    // commit probability
    probabilities.push([...current]);
    current.length = 0;
  }

  return probabilities;
};

const pattern2 = (basePrice) => {
  const current = [];

  let work = 2;
  for (; work < 14; work++) {
    randfloat(
      current,
      900 - 50 - 30 * (work - 2) - 20 * (work - 2),
      900 - 30 * (work - 2),
      basePrice
    );
  }

  return [current];
};

const pattern3 = (basePrice) => {
  const probabilities = [];
  const current = [];

  for (let peakStart = 0; peakStart <= 9; peakStart++) {
    let work = 2;
    for (; work < peakStart; work++) {
      randfloat(
        current,
        400 - 30 * (work - 2) - 20 * (work - 2),
        900 - 30 * (work - 2),
        basePrice
      );
    }
    randfloat(current, 900, 1400, basePrice);
    randfloat(current, 900, 1400, basePrice);
    randfloat(current, 1400, 2000, basePrice, (v) => v - 1);
    randfloat(current, 1400, 2000, basePrice);
    randfloat(current, 1400, 2000, basePrice, (v) => v - 1);

    work += 5;
    for (let i = work; work < 14; work++) {
      randfloat(
        current,
        400 - 30 * (work - i) - 20 * (work - i),
        900 - 30 * (work - i),
        basePrice
      );
    }

    probabilities.push([...current]);
    current.length = 0;
  }

  return probabilities;
};

const explodeBasePrices = (fn) => {
  return Array.from({ length: 21 }, (v, i) => i + 90).reduce(
    (prev, basePrice) => [...prev, ...fn(basePrice)],
    []
  );
};

const filterByPattern = (filters) => (pattern) =>
  pattern.every(([min, max], i) =>
    filters[i + 1] ? min <= filters[i + 1] && max >= filters[i + 1] : true
  );

const possiblePatterns = (filters) => {
  const patterns = Array.from({ length: 4 }, (v, i) => i);
  const fns = [pattern0, pattern1, pattern2, pattern3];
  const result = [];

  patterns.forEach((fn) => {
    let posibilities;
    const basePrice = filters[0];
    if (!basePrice || basePrice < 90 || basePrice > 110) {
      posibilities = explodeBasePrices(fns[fn]);
    } else {
      posibilities = fns[fn](filters[0]);
    }
    const filtered = posibilities.filter(filterByPattern(filters));
    result.push(filtered);
  });

  return result;
};

// Take all patternsOptions and make them single [min, max] values.
const minMaxReducer = (prev, current) => {
  return prev.map(([min, max], i) => {
    const [newMin, newMax] = current[i];
    return [min > newMin ? newMin : min, max < newMax ? newMax : max];
  });
};

const averageReducer = (prev, current) => {
  return prev.map(([avg, count, flag], i) => {
    const [min, max] = current[i];
    if (!flag) return [(avg + count + min + max) / 4, 4, true];
    return [(avg * count + min + max) / (count + 2), count + 2, true];
  });
};

const patternReducer = (patternsCategories, reducer = minMaxReducer) => {
  const allPatterns = patternsCategories.reduce(
    (acc, current) => [...acc, ...current],
    []
  );
  if (allPatterns.length === 0) return [];
  if (allPatterns.length === 1)
    return [...allPatterns, ...allPatterns].reduce(reducer);
  return allPatterns.reduce(reducer);
};

module.exports = {
  possiblePatterns,
  patternReducer,
  minMaxReducer,
  averageReducer,
};
