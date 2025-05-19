const getCurrencySymbol = (currency) => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'CAD': return 'C$';
    case 'INR': return '₹';
    case 'GBP': return '£';
    case 'AUD': return 'A$';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'CHF': return 'CHF';
    case 'NZD': return 'NZ$';
    case 'ZAR': return 'R';
    case 'BRL': return 'R$';
    case 'MXN': return '$';
    case 'SGD': return 'S$';
    case 'HKD': return 'HK$';
    case 'KRW': return '₩';
    case 'SEK': return 'kr';
    case 'NOK': return 'kr';
    case 'DKK': return 'kr';
    case 'PLN': return 'zł';
    case 'RUB': return '₽';
    case 'TRY': return '₺';
    case 'THB': return '฿';
    case 'IDR': return 'Rp';
    case 'MYR': return 'RM';
    case 'PHP': return '₱';
    case 'VND': return '₫';
    case 'EGP': return '£';
    case 'ARS': return '$';
    case 'CLP': return '$';
    case 'COP': return '$';
    case 'PEN': return 'S/.';
    case 'UYU': return '$U';
    default: return currency;
  }
};

module.exports = { getCurrencySymbol };