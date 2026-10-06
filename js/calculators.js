(function () {
  const { formatMoney, formatPercent, parseNumber, formatNumber } = window.BusinessCalcUtils;

  function addResultBlock(label, value) {
    return { label: label, value: value };
  }

  function toNumber(value) {
    const result = parseNumber(value);
    return Number.isFinite(result) ? result : 0;
  }

  function getErrorMessage(message) {
    return { success: false, message: message };
  }

  function calculateProfitLoss(values) {
    const revenue = toNumber(values.revenue);
    const cost = toNumber(values.cost);
    const expenses = toNumber(values.expenses);

    if (revenue < 0 || cost < 0 || expenses < 0) {
      return getErrorMessage('Iltimos, barcha qiymatlar nol yoki musbat bo‘lishi kerak.');
    }

    const totalCost = cost + expenses;
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return {
      success: true,
      rows: [
        addResultBlock('Jami xarajat', formatMoney(totalCost, 'UZS')),
        addResultBlock('Sof foyda', formatMoney(profit, 'UZS')),
        addResultBlock('Foyda marjasi', formatPercent(margin))
      ],
      summary: `Sof foyda ${formatMoney(profit, 'UZS')}`,
      formula: 'Jami xarajat = tannarx + boshqa xarajatlar. Sof foyda = daromad - jami xarajat.'
    };
  }

  function calculateRoi(values) {
    const initial = toNumber(values.initialInvestment);
    const final = toNumber(values.finalRevenue);

    if (initial <= 0) {
      return getErrorMessage('Boshlang‘ich investitsiya nol yoki manfiy bo‘lishi mumkin emas.');
    }

    const roi = ((final - initial) / initial) * 100;

    return {
      success: true,
      rows: [
        addResultBlock('ROI', formatPercent(roi)),
        addResultBlock('Foyda / zarar', formatMoney(final - initial, 'UZS'))
      ],
      summary: `ROI ${formatPercent(roi)}`,
      formula: 'ROI = ((yakuniy daromad - boshlang‘ich investitsiya) / boshlang‘ich investitsiya) × 100.'
    };
  }

  function calculateDiscount(values) {
    const price = toNumber(values.price);
    const percent = toNumber(values.percent);

    if (price < 0 || percent < 0 || percent > 100) {
      return getErrorMessage('Narx va chegirma foizi to‘g‘ri kiritilishi kerak.');
    }

    const discountAmount = price * (percent / 100);
    const discountedPrice = price - discountAmount;

    return {
      success: true,
      rows: [
        addResultBlock('Chegirma summasi', formatMoney(discountAmount, 'UZS')),
        addResultBlock('Yakuniy narx', formatMoney(discountedPrice, 'UZS'))
      ],
      summary: `Chegirma ${formatMoney(discountAmount, 'UZS')}`,
      formula: 'Chegirma summasi = asl narx × chegirma foizi / 100.'
    };
  }

  function calculateTax(values) {
    const amount = toNumber(values.amount);
    const rate = toNumber(values.rate);

    if (amount < 0 || rate < 0 || rate > 100) {
      return getErrorMessage('Summa va soliq foizi to‘g‘ri kiritilishi kerak.');
    }

    const taxAmount = amount * (rate / 100);
    const total = amount + taxAmount;

    return {
      success: true,
      rows: [
        addResultBlock('Soliq summasi', formatMoney(taxAmount, 'UZS')),
        addResultBlock('Soliq bilan jami', formatMoney(total, 'UZS')),
        addResultBlock('Soliqsiz summa', formatMoney(amount, 'UZS'))
      ],
      summary: `Jami ${formatMoney(total, 'UZS')}`,
      formula: 'Soliq summasi = summa × soliq foizi / 100. Jami = summa + soliq summasi.'
    };
  }

  function calculateQqs(values) {
    const amount = toNumber(values.amount);
    const rate = toNumber(values.rate);

    if (amount < 0 || rate < 0 || rate > 100) {
      return getErrorMessage('Summa va QQS foizi to‘g‘ri kiritilishi kerak.');
    }

    const qqsAmount = amount * (rate / 100);
    const total = amount + qqsAmount;

    return {
      success: true,
      rows: [
        addResultBlock('QQS summasi', formatMoney(qqsAmount, 'UZS')),
        addResultBlock('QQS bilan jami', formatMoney(total, 'UZS')),
        addResultBlock('QQSsiz summa', formatMoney(amount, 'UZS'))
      ],
      summary: `QQS ${formatMoney(qqsAmount, 'UZS')}`,
      formula: 'QQS summasi = summa × QQS foizi / 100. Jami = summa + QQS.'
    };
  }

  function calculateSalary(values) {
    const baseSalary = toNumber(values.baseSalary);
    const bonus = toNumber(values.bonus);
    const deductions = toNumber(values.deductions);
    const taxRate = toNumber(values.taxRate);

    if (baseSalary < 0 || bonus < 0 || deductions < 0 || taxRate < 0 || taxRate > 100) {
      return getErrorMessage('Ish haqi va foizlar to‘g‘ri kiritilishi kerak.');
    }

    const gross = baseSalary + bonus;
    const tax = gross * (taxRate / 100);
    const net = gross - deductions - tax;

    return {
      success: true,
      rows: [
        addResultBlock('Umumiy daromad', formatMoney(gross, 'UZS')),
        addResultBlock('Jami ushlanmalar', formatMoney(deductions + tax, 'UZS')),
        addResultBlock('Olingan summa', formatMoney(net, 'UZS'))
      ],
      summary: `To‘lov ${formatMoney(net, 'UZS')}`,
      formula: 'Umumiy daromad = asosiy ish haqi + bonus. To‘lov = umumiy daromad - ushlanmalar - soliq.'
    };
  }

  function calculateCredit(values) {
    const principal = toNumber(values.loanAmount);
    const annualRate = toNumber(values.annualRate);
    const months = toNumber(values.months);

    if (principal <= 0 || annualRate < 0 || months <= 0) {
      return getErrorMessage('Kredit summasi va muddat to‘g‘ri kiritilishi kerak.');
    }

    const monthlyRate = (annualRate / 100) / 12;
    const payment = monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
    const total = payment * months;
    const interest = total - principal;

    return {
      success: true,
      rows: [
        addResultBlock('Oylik to‘lov', formatMoney(payment, 'UZS')),
        addResultBlock('Jami to‘lov', formatMoney(total, 'UZS')),
        addResultBlock('Jami foiz', formatMoney(interest, 'UZS'))
      ],
      summary: `Oylik to‘lov ${formatMoney(payment, 'UZS')}`,
      formula: 'Oylik to‘lov = P × r / (1 - (1 + r)^(-n)).'
    };
  }

  function calculateInterest(values) {
    const principal = toNumber(values.principal);
    const rate = toNumber(values.rate);
    const period = toNumber(values.period);

    if (principal < 0 || rate < 0 || period < 0) {
      return getErrorMessage('Asosiy summa, foiz va muddat to‘g‘ri kiritilishi kerak.');
    }

    const interestAmount = principal * (rate / 100) * period;
    const finalValue = principal + interestAmount;

    return {
      success: true,
      rows: [
        addResultBlock('Foiz summasi', formatMoney(interestAmount, 'UZS')),
        addResultBlock('Yakuniy summa', formatMoney(finalValue, 'UZS'))
      ],
      summary: `Yakuniy summa ${formatMoney(finalValue, 'UZS')}`,
      formula: 'Foiz summasi = asosiy summa × foiz × muddat / 100.'
    };
  }

  function calculateBreakEven(values) {
    const fixedCosts = toNumber(values.fixedCosts);
    const unitPrice = toNumber(values.unitPrice);
    const variableCost = toNumber(values.variableCost);

    if (fixedCosts < 0 || unitPrice < 0 || variableCost < 0) {
      return getErrorMessage('Xarajatlar va narxlar nol yoki musbat bo‘lishi kerak.');
    }

    if (unitPrice <= variableCost) {
      return getErrorMessage('Bir birlik narxi o‘zgaruvchan xarajatlardan yuqori bo‘lishi kerak.');
    }

    const breakEvenQty = fixedCosts / (unitPrice - variableCost);
    const breakEvenRevenue = breakEvenQty * unitPrice;

    return {
      success: true,
      rows: [
        addResultBlock('Break-even miqdori', formatNumber(breakEvenQty, 2)),
        addResultBlock('Break-even daromad', formatMoney(breakEvenRevenue, 'UZS'))
      ],
      summary: `Break-even ${formatNumber(breakEvenQty, 2)} birlik`,
      formula: 'Break-even miqdori = doimiy xarajatlar / (birlik narxi - o‘zgaruvchan xarajat).'
    };
  }

  function calculateMargin(values) {
    const salePrice = toNumber(values.salePrice);
    const cost = toNumber(values.cost);

    if (salePrice < 0 || cost < 0) {
      return getErrorMessage('Sotuv narxi va tannarx nol yoki musbat bo‘lishi kerak.');
    }

    const profit = salePrice - cost;
    const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    const markup = cost > 0 ? (profit / cost) * 100 : 0;

    return {
      success: true,
      rows: [
        addResultBlock('Foyda', formatMoney(profit, 'UZS')),
        addResultBlock('Foyda marjasi', formatPercent(margin)),
        addResultBlock('Ustama', formatPercent(markup))
      ],
      summary: `Foyda ${formatMoney(profit, 'UZS')}`,
      formula: 'Foyda = sotuv narxi - tannarx. Marja = (foyda / sotuv narxi) × 100.'
    };
  }

  function calculateSellingPrice(values) {
    const cost = toNumber(values.cost);
    const profitPercent = toNumber(values.profitPercent);

    if (cost < 0 || profitPercent < 0 || profitPercent >= 100) {
      return getErrorMessage('Tannarx va foyda foizi qabul qilinadigan qiymatga ega bo‘lishi kerak.');
    }

    const sellingPrice = cost / (1 - (profitPercent / 100));
    const profitAmount = sellingPrice - cost;

    return {
      success: true,
      rows: [
        addResultBlock('Tavsiya etilgan sotuv narxi', formatMoney(sellingPrice, 'UZS')),
        addResultBlock('Foyda summasi', formatMoney(profitAmount, 'UZS'))
      ],
      summary: `Sotuv narxi ${formatMoney(sellingPrice, 'UZS')}`,
      formula: 'Tavsiya etilgan sotuv narxi = tannarx / (1 - foyda foizi / 100).'
    };
  }

  function calculateCurrency(values) {
    const amount = toNumber(values.amount);
    const fromCurrency = values.fromCurrency || 'UZS';
    const toCurrency = values.toCurrency || 'USD';

    if (amount < 0) {
      return getErrorMessage('Summa nol yoki musbat bo‘lishi kerak.');
    }

    const rates = window.BusinessCalcData.defaultRates || { UZS: 1, USD: 12500, EUR: 13600, GBP: 15800, RUB: 208 };
    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;
    const converted = amount * (fromRate / toRate);

    return {
      success: true,
      rows: [
        addResultBlock('Konvertatsiya natijasi', formatMoney(converted, toCurrency)),
        addResultBlock('Namunaviy kurs', `${fromCurrency} → ${toCurrency}`)
      ],
      summary: `${formatMoney(amount, fromCurrency)} = ${formatMoney(converted, toCurrency)}`,
      formula: 'Konvertatsiya = summa × kurs(mahalliy) / kurs(yo‘nalish).'
    };
  }

  function calculateRevenue(values) {
    const price = toNumber(values.price);
    const quantity = toNumber(values.quantity);
    const extraRevenue = toNumber(values.extraRevenue);

    if (price < 0 || quantity < 0 || extraRevenue < 0) {
      return getErrorMessage('Barcha qiymatlar nol yoki musbat bo‘lishi kerak.');
    }

    const totalRevenue = price * quantity + extraRevenue;

    return {
      success: true,
      rows: [
        addResultBlock('Jami daromad', formatMoney(totalRevenue, 'UZS'))
      ],
      summary: `Daromad ${formatMoney(totalRevenue, 'UZS')}`,
      formula: 'Jami daromad = mahsulot narxi × sotilgan miqdor + qo‘shimcha daromad.'
    };
  }

  function calculateExpense(values) {
    const categories = ['rent', 'salary', 'ad', 'transport', 'utilities', 'other'];
    const expenseValues = {};

    let total = 0;
    categories.forEach(function (key) {
      const amount = toNumber(values[key]);
      expenseValues[key] = amount;
      total += amount;
    });

    if (total < 0) {
      return getErrorMessage('Xarajatlar nol yoki musbat bo‘lishi kerak.');
    }

    const names = {
      rent: 'Ijara',
      salary: 'Ish haqi',
      ad: 'Reklama',
      transport: 'Transport',
      utilities: 'Kommunal',
      other: 'Boshqa'
    };

    const rows = [
      addResultBlock('Jami xarajat', formatMoney(total, 'UZS'))
    ];

    Object.keys(expenseValues).forEach(function (key) {
      const share = total > 0 ? (expenseValues[key] / total) * 100 : 0;
      rows.push(addResultBlock(`${names[key]} ulushi`, formatPercent(share)));
    });

    return {
      success: true,
      rows: rows,
      summary: `Jami xarajat ${formatMoney(total, 'UZS')}`,
      formula: 'Jami xarajat = barcha xarajatlar yig‘indisi. Ulush = xarajat / jami xarajat × 100.',
      chartData: expenseValues
    };
  }

  function calculateInvestment(values) {
    const initial = toNumber(values.initialInvestment);
    const monthly = toNumber(values.monthlyContribution);
    const annualReturn = toNumber(values.annualReturn);
    const years = toNumber(values.years);

    if (initial < 0 || monthly < 0 || annualReturn < 0 || years < 0) {
      return getErrorMessage('Investitsiya parametrlari nol yoki musbat bo‘lishi kerak.');
    }

    const monthlyRate = (annualReturn / 100) / 12;
    const months = years * 12;
    let futureValue = initial;

    if (months > 0) {
      futureValue = initial * Math.pow(1 + monthlyRate, months);
      if (monthlyRate !== 0) {
        futureValue += monthly * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate));
      } else {
        futureValue += monthly * months;
      }
    }

    return {
      success: true,
      rows: [
        addResultBlock('Taxminiy kelajak qiymati', formatMoney(futureValue, 'UZS')),
        addResultBlock('Taxminiy foyda', formatMoney(futureValue - initial - monthly * months, 'UZS'))
      ],
      summary: `Taxminiy joy ${formatMoney(futureValue, 'UZS')}`,
      formula: 'Kelajakdagi qiymat = boshlang‘ich investitsiya + oylik qo‘shimcha investitsiya bo‘yicha kompozitsion hisob-kitob.',
      estimate: true
    };
  }

  function calculateById(id, values) {
    const calculators = {
      'profit-loss': calculateProfitLoss,
      roi: calculateRoi,
      discount: calculateDiscount,
      tax: calculateTax,
      qqs: calculateQqs,
      salary: calculateSalary,
      credit: calculateCredit,
      interest: calculateInterest,
      'break-even': calculateBreakEven,
      margin: calculateMargin,
      'selling-price': calculateSellingPrice,
      currency: calculateCurrency,
      revenue: calculateRevenue,
      expense: calculateExpense,
      investment: calculateInvestment
    };

    const handler = calculators[id];
    if (!handler) {
      return getErrorMessage('Kalkulyator topilmadi.');
    }

    return handler(values);
  }

  window.BusinessCalcCalculators = { calculateById };
}());
