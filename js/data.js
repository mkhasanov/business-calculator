(function () {
  const calculators = [
    {
      id: 'profit-loss',
      title: 'Foyda va zarar kalkulyatori',
      category: 'Moliyaviy',
      description: 'Daromad, tannarx va boshqa xarajatlardan sof foydani hisoblang.',
      formula: 'Jami xarajat = tannarx + boshqa xarajatlar. Sof foyda = daromad - jami xarajat.',
      fields: [
        { name: 'revenue', label: 'Daromad', type: 'number', step: '0.01', value: 1500000 },
        { name: 'cost', label: 'Mahsulot tannarxi', type: 'number', step: '0.01', value: 900000 },
        { name: 'expenses', label: 'Boshqa xarajatlar', type: 'number', step: '0.01', value: 250000 }
      ],
      hints: ['Natija qiymati nol yoki manfiy bo‘lishi mumkin.', 'Foyda marjasi daromadga nisbatan hisoblanadi.']
    },
    {
      id: 'roi',
      title: 'ROI kalkulyatori',
      category: 'Moliyaviy',
      description: 'Investitsiyalangan mablag‘ning yakuniy qaytimi foizda aniqlanadi.',
      formula: 'ROI = ((yakuniy daromad - boshlang‘ich investitsiya) / boshlang‘ich investitsiya) × 100.',
      fields: [
        { name: 'initialInvestment', label: 'Boshlang‘ich investitsiya', type: 'number', step: '0.01', value: 500000 },
        { name: 'finalRevenue', label: 'Yakuniy daromad', type: 'number', step: '0.01', value: 700000 }
      ],
      hints: ['Investitsiya nol bo‘lsa, hisoblash mumkin emas.', 'Qaytim musbat bo‘lsa foyda, manfiy bo‘lsa zarar ko‘rinadi.']
    },
    {
      id: 'discount',
      title: 'Chegirma kalkulyatori',
      category: 'Savdo',
      description: 'Asl narx va chegirma foizi asosida yakuniy narxni hisoblang.',
      formula: 'Chegirma summasi = asl narx × chegirma foizi / 100.',
      fields: [
        { name: 'price', label: 'Asl narx', type: 'number', step: '0.01', value: 500000 },
        { name: 'percent', label: 'Chegirma foizi', type: 'number', step: '0.01', value: 15 }
      ],
      hints: ['Chegirma foizi 0 dan 100 gacha bo‘lishi kerak.', 'Natija qiymati har doim bo‘lib, foizni hisoblashda app yorliqlarini tekshiring.']
    },
    {
      id: 'tax',
      title: 'Soliq kalkulyatori',
      category: 'Soliq',
      description: 'Summa va soliq foiziga ko‘ra soliq summasi va umumiy qiymatni hisoblang.',
      formula: 'Soliq summasi = summa × soliq foizi / 100. Jami = summa + soliq summasi.',
      fields: [
        { name: 'amount', label: 'Summa', type: 'number', step: '0.01', value: 1000000 },
        { name: 'rate', label: 'Soliq foizi', type: 'number', step: '0.01', value: 15 }
      ],
      hints: ['Foiz qiymati foydalanuvchi tomonidan o‘zgartirilishi mumkin.', 'Bu umumiy hisob-kitob bo‘lib, amaldagi qonunchilik bilan solishtiriladi.']
    },
    {
      id: 'qqs',
      title: 'QQS kalkulyatori',
      category: 'Soliq',
      description: 'QQS qiymati va umumiy to‘lov miqdorini aniqlang.',
      formula: 'QQS summasi = summa × QQS foizi / 100. Jami = summa + QQS.',
      fields: [
        { name: 'amount', label: 'Summa', type: 'number', step: '0.01', value: 1200000 },
        { name: 'rate', label: 'QQS foizi', type: 'number', step: '0.01', value: 12 }
      ],
      hints: ['Foiz qiymati o‘zgartirilishi mumkin bo‘lib, qonunchilikka qarab farq qilishi mumkin.', 'Natijalar umumiy hisob-kitob bo‘lib, amaldagi maqsadlar uchun ishlatiladi.']
    },
    {
      id: 'salary',
      title: 'Ish haqi kalkulyatori',
      category: 'Ish haqi',
      description: 'Yillik yoki oylik ish haqi, bonus va ushlanmalar asosida aniq to‘lovni hisoblang.',
      formula: 'Umumiy daromad = asosiy ish haqi + bonus. Yashirin holda ushlanma = umumiy daromad × soliq foizi / 100. To‘lov = umumiy daromad - ushlanmalar - boshqa ushlanmalar.',
      fields: [
        { name: 'baseSalary', label: 'Asosiy ish haqi', type: 'number', step: '0.01', value: 5000000 },
        { name: 'bonus', label: 'Bonus / qo‘shimcha', type: 'number', step: '0.01', value: 600000 },
        { name: 'deductions', label: 'Boshqa ushlanmalar', type: 'number', step: '0.01', value: 200000 },
        { name: 'taxRate', label: 'Soliq foizi', type: 'number', step: '0.01', value: 12 }
      ],
      hints: ['Bu kalkulyator umumiy hisob uchun mo‘ljallangan.', 'Amaldagi ish haqi qonunchiligi tashkilot siyosatiga qarab farq qilishi mumkin.']
    },
    {
      id: 'credit',
      title: 'Kredit kalkulyatori',
      category: 'Moliyaviy',
      description: 'Annuitet usuli bo‘yicha oylik to‘lovni va umumiy foiz xarajatini hisoblang.',
      formula: 'Oylik to‘lov = P × r / (1 - (1 + r)^(-n)).',
      fields: [
        { name: 'loanAmount', label: 'Kredit summasi', type: 'number', step: '0.01', value: 25000000 },
        { name: 'annualRate', label: 'Yillik foiz', type: 'number', step: '0.01', value: 18 },
        { name: 'months', label: 'Muddat (oy)', type: 'number', step: '1', value: 24 },
        { name: 'repaymentType', label: 'To‘lov turi', type: 'select', options: ['annuitet'], value: 'annuitet' }
      ],
      hints: ['Foydalanuvchi kiritgan ma’lumotlar bo‘yicha hisoblanadi.', 'Annuitet modeli uchun hisoblash amaliy dalillar asosida bajariladi.']
    },
    {
      id: 'interest',
      title: 'Foiz kalkulyatori',
      category: 'Moliyaviy',
      description: 'Asosiy summa, foiz va muddat bo‘yicha foiz summasini hisoblang.',
      formula: 'Foiz summasi = asosiy summa × foiz × muddat / 100.',
      fields: [
        { name: 'principal', label: 'Asosiy summa', type: 'number', step: '0.01', value: 1000000 },
        { name: 'rate', label: 'Foiz', type: 'number', step: '0.01', value: 12 },
        { name: 'period', label: 'Muddat (yil)', type: 'number', step: '0.01', value: 2 }
      ],
      hints: ['Muddat yillar bilan belgilanadi.', 'Yakuniy summa asosiy summa + foiz summasi.']
    },
    {
      id: 'break-even',
      title: 'Break-even kalkulyatori',
      category: 'Biznes',
      description: 'Doimiy xarajatlar va birlik qiymatiga asoslanib, zararsiz qiymatni hisoblang.',
      formula: 'Break-even miqdori = doimiy xarajatlar / (birlik narxi - o‘zgaruvchan xarajat).',
      fields: [
        { name: 'fixedCosts', label: 'Doimiy xarajatlar', type: 'number', step: '0.01', value: 2000000 },
        { name: 'unitPrice', label: 'Bir birlik narxi', type: 'number', step: '0.01', value: 120000 },
        { name: 'variableCost', label: 'Bir birlik o‘zgaruvchan xarajati', type: 'number', step: '0.01', value: 70000 }
      ],
      hints: ['Bir birlik narxi o‘zgaruvchan xarajatdan katta bo‘lishi kerak.', 'Natija birliklar soni va daromadda ko‘rsatiladi.']
    },
    {
      id: 'margin',
      title: 'Marja kalkulyatori',
      category: 'Savdo',
      description: 'Sotuv narxi va tannarx bo‘yicha foyda va marja qiymatini hisoblang.',
      formula: 'Foyda = sotuv narxi - tannarx. Marja = (foyda / sotuv narxi) × 100.',
      fields: [
        { name: 'salePrice', label: 'Sotuv narxi', type: 'number', step: '0.01', value: 800000 },
        { name: 'cost', label: 'Tannarx', type: 'number', step: '0.01', value: 540000 }
      ],
      hints: ['Mariy va ustama hisoblashda natijalar faqat foyda bo‘yicha ko‘rsatiladi.', 'Miqdor manfiy bo‘lmasa daromad aniq hisoblanadi.']
    },
    {
      id: 'selling-price',
      title: 'Sotuv narxi kalkulyatori',
      category: 'Savdo',
      description: 'Mahsulot tannarxi va kerakli foyda foizi asosida tavsiya etilgan sotuv narxini aniqlang.',
      formula: 'Tavsiya etilgan sotuv narxi = tannarx / (1 - foyda foizi / 100).',
      fields: [
        { name: 'cost', label: 'Tannarx', type: 'number', step: '0.01', value: 500000 },
        { name: 'profitPercent', label: 'Kerakli foyda foizi', type: 'number', step: '0.01', value: 30 }
      ],
      hints: ['Foyda foizi 0 dan 100 gacha bo‘lishi kerak.', 'Sotuv narxi ko‘rsatilgan iqtisodiy maqsadga mos keladi.']
    },
    {
      id: 'currency',
      title: 'Valyuta hisoblagichi',
      category: 'Biznes',
      description: 'Uzs, USD, EUR, GBP va RUB orasidagi namuna kursini hisoblang.',
      formula: 'Konvertatsiya = summa × kurs(mahalliy) / kurs(yo‘nalish).',
      fields: [
        { name: 'amount', label: 'Summa', type: 'number', step: '0.01', value: 1000000 },
        { name: 'fromCurrency', label: 'Dastlabki valyuta', type: 'select', options: ['UZS', 'USD', 'EUR', 'GBP', 'RUB'], value: 'UZS' },
        { name: 'toCurrency', label: 'Qaysi valyutaga', type: 'select', options: ['UZS', 'USD', 'EUR', 'GBP', 'RUB'], value: 'USD' }
      ],
      hints: ['Bu namuna kursi bo‘lib, o‘zgaruvchan kurslar uchun maxsus sozlamalar ishlatilishi mumkin.', 'Kurslar foydalanuvchi tomonidan o‘zgartirilishi mumkin.']
    },
    {
      id: 'revenue',
      title: 'Daromad kalkulyatori',
      category: 'Savdo',
      description: 'Mahsulot narxi, sotilgan miqdor va qo‘shimcha daromadni hisobga olib umumiy daromadni baholang.',
      formula: 'Jami daromad = mahsulot narxi × sotilgan miqdor + qo‘shimcha daromad.',
      fields: [
        { name: 'price', label: 'Mahsulot narxi', type: 'number', step: '0.01', value: 120000 },
        { name: 'quantity', label: 'Sotilgan miqdor', type: 'number', step: '1', value: 18 },
        { name: 'extraRevenue', label: 'Qo‘shimcha daromad', type: 'number', step: '0.01', value: 150000 }
      ],
      hints: ['Miqdor musbat son bo‘lishi kerak.', 'Jami daromad ham summa, ham takliflarni kiritishda ko‘rsatiladi.']
    },
    {
      id: 'expense',
      title: 'Xarajat kalkulyatori',
      category: 'Savdo',
      description: 'Ijara, ish haqi, reklama, transport, kommunal va boshqa xarajatlarni birga hisoblang.',
      formula: 'Jami xarajat = barcha xarajatlar yig‘indisi. Ulush = xarajat / jami xarajat × 100.',
      fields: [
        { name: 'rent', label: 'Ijara', type: 'number', step: '0.01', value: 1800000 },
        { name: 'salary', label: 'Ish haqi', type: 'number', step: '0.01', value: 3500000 },
        { name: 'ad', label: 'Reklama', type: 'number', step: '0.01', value: 600000 },
        { name: 'transport', label: 'Transport', type: 'number', step: '0.01', value: 450000 },
        { name: 'utilities', label: 'Kommunal', type: 'number', step: '0.01', value: 320000 },
        { name: 'other', label: 'Boshqa', type: 'number', step: '0.01', value: 280000 }
      ],
      hints: ['Har bir maydonni to‘ldirish shart emas; bo‘sh bo‘lsa nol hisoblanadi.', 'Ushbu diagramma har bir kategoriya ulushini ko‘rsatadi.']
    },
    {
      id: 'investment',
      title: 'Investitsiya kalkulyatori',
      category: 'Investitsiya',
      description: 'Boshlang‘ich investitsiya, oylik qo‘shimcha va yillik daromadlilik bo‘yicha kelajakdagi qiymatni taxmin qiling.',
      formula: 'Kelajakdagi qiymat = har yili va oyiga qarab kompozitsion hisob-kitob.',
      fields: [
        { name: 'initialInvestment', label: 'Boshlang‘ich investitsiya', type: 'number', step: '0.01', value: 8000000 },
        { name: 'monthlyContribution', label: 'Oylik qo‘shimcha investitsiya', type: 'number', step: '0.01', value: 500000 },
        { name: 'annualReturn', label: 'Yillik daromadlilik (%)', type: 'number', step: '0.01', value: 12 },
        { name: 'years', label: 'Muddat (yil)', type: 'number', step: '0.01', value: 5 }
      ],
      hints: ['Natija taxminiy bo‘lib, bozor sharoitiga qarab farq qilishi mumkin.', 'Kompozitsion hisob-kitobda oylik qo‘shimcha kiritiladi.']
    }
  ];

  const categoryGroups = [
    {
      id: 'financial',
      title: 'Moliyaviy',
      calculatorIds: ['profit-loss', 'roi', 'interest', 'investment', 'credit']
    },
    {
      id: 'retail',
      title: 'Savdo',
      calculatorIds: ['discount', 'selling-price', 'margin', 'revenue', 'expense']
    },
    {
      id: 'tax',
      title: 'Soliq',
      calculatorIds: ['tax', 'qqs']
    },
    {
      id: 'salary',
      title: 'Ish haqi',
      calculatorIds: ['salary']
    },
    {
      id: 'business',
      title: 'Biznes',
      calculatorIds: ['break-even', 'currency']
    },
    {
      id: 'investment',
      title: 'Investitsiya',
      calculatorIds: ['investment']
    }
  ];

  const defaultRates = {
    UZS: 1,
    USD: 12500,
    EUR: 13600,
    GBP: 15800,
    RUB: 208
  };

  const defaultSettings = {
    theme: 'light',
    currency: 'UZS',
    numberFormat: 'space',
    rates: Object.assign({}, defaultRates)
  };

  window.BusinessCalcData = { calculators, categoryGroups, defaultRates, defaultSettings };
}());
