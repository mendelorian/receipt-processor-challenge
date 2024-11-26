function validateReceipt(receipt) {
  const requiredFields = ['retailer', 'purchaseDate', 'purchaseTime', 'items', 'total'];
  for (const field of requiredFields) {
    if (!receipt[field]) {
      return `Missing required field ${field}`;
    }
  }

  // Validate retailer
  if (!receipt.retailer.match(/^[\w\s\-&]+$/)) {
    return 'Invalid retailer name format';
  }

  // Validate purchase date (YYYY-MM-DD)
  if (!receipt.purchaseDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return 'Invalid purchase date format';
  }

  // Validate purchase time (HH:SS)
  if (!receipt.purchaseTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
    return 'Invalid purchase time format';
  }

  // Validate items array
  if (!Array.isArray(receipt.items) || receipt.items.length === 0) {
    return 'Items must be a non-empty array';
  }

  // Validate total
  if (!receipt.total.match(/^\d+\.\d{2}$/)) {
    return 'Invalid total format';
  }

  // Validate each item
  for (const item of receipt.items) {
    if (!item.shortDescription || !item.price) {
      return `Each item must have shortDescription and price.  One or more missing: ${item}`
    }
    if (!item.shortDescription.match(/^[\w\s-]+$/)) {
      return `Invalid format for item description: ${item}`;
    }
    if (!item.price.match(/^\d+\.\d{2}$/)) {
      return `Invalid format for item price: ${item}`;
    }
  }

  return null;
}

export { validateReceipt };