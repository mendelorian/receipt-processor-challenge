import { describe, it, beforeEach, expect } from 'vitest';
import { validateReceipt } from '../validators.js';

describe('Receipt Validator', () => {
  let validReceipt;

  beforeEach(() => {
    validReceipt = {
      retailer: 'Target',
      purchaseDate: '2024-01-02',
      purchaseTime: '13:13',
      total: '1.25',
      items: [
        { shortDescription: 'Pepsi - 12-oz', price: '1.25' }
      ]
    };
  });

  it('should accept a valid receipt', () => {
    const error = validateReceipt(validReceipt);
    expect(error).toBeNull();
  })

  it('should reject a receipt with missing required fields', () => {
    delete validReceipt.retailer;
    const error = validateReceipt(validReceipt);
    expect(error).toContain('Missing required field retailer');
  })

  it('should validate retailer name format', () => {
    validReceipt.retailer = 'Target!!!';
    const error = validateReceipt(validReceipt);
    expect(error).toContain('Invalid retailer name format');
  })

  it('should validate purchase date format', () => {
    validReceipt.purchaseDate = '2024/01/02';
    const error = validateReceipt(validReceipt);
    expect(error).toContain('Invalid purchase date format');
  })

  it('should validate purchase time format', () => {
    validReceipt.purchaseTime = '25:00';
    const error = validateReceipt(validReceipt);
    expect(error).toContain('Invalid purchase time format');
  })

  it('should validate total format', () => {
    validReceipt.total = '2.5';
    const error = validateReceipt(validReceipt);
    expect(error).toContain('Invalid total format');
  })

  it('should validate items array format', () => {
    validReceipt.items = [];
    const error = validateReceipt(validReceipt);
    expect(error).toContain('Items must be a non-empty array');
  })

  it('should validate item format', () => {
    validReceipt.items[0].price = '';
    const error = validateReceipt(validReceipt);
    expect(error).toContain('Each item must have shortDescription and price.  One or more missing:');
  })

  it('should validate item price format', () => {
    validReceipt.items[0].price = '2.5';
    const error = validateReceipt(validReceipt);
    expect(error).toContain('Invalid price format:');
  })

  it('should validate item description format', () => {
    validReceipt.items[0].shortDescription = 'Invalid!!!';
    const error = validateReceipt(validReceipt);
    expect(error).toContain('Invalid description format:');
  })
})