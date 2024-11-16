import { describe, it, expect, beforeEach } from 'vitest';
import { processReceipt, receipts } from '../app.js';

const simpleReceipt = {
  "retailer": "Target",
  "purchaseDate": "2022-01-02",
  "purchaseTime": "13:13",
  "total": "1.25",
  "items": [
      {"shortDescription": "Pepsi - 12-oz", "price": "1.25"}
  ]
};

const morningReceipt = {
  "retailer": "Walgreens",
  "purchaseDate": "2022-01-02",
  "purchaseTime": "08:13",
  "total": "2.65",
  "items": [
      {"shortDescription": "Pepsi - 12-oz", "price": "1.25"},
      {"shortDescription": "Dasani", "price": "1.40"}
  ]
};

describe('processReceipt Tests', () => {
  // clear in-memory receipts before each test
  beforeEach(() => {
    for (const key in receipts) {
      delete receipts[key];
    }
  });

  it('should process a valid receipt and return a unique ID', () => {
    const result = processReceipt(simpleReceipt);
    expect(result).toHaveProperty('id');
    const id = result.id;

    expect(receipts).toHaveProperty(id);
    expect(receipts[id]).toBeGreaterThanOrEqual(0);
  })

  it('should throw an error for invalid receipt', () => {
    const invalidReceipt = null;

    expect(() => processReceipt(invalidReceipt)).toThrow('The receipt is invalid');
  })

  it('should assign a unique ID for each receipt', () => {
    const result1 = processReceipt(simpleReceipt);
    const result2 = processReceipt(morningReceipt);

    expect(result1.id).not.toBe(result2.id);
    expect(receipts).toHaveProperty(result1.id);
    expect(receipts).toHaveProperty(result2.id);
  })

  it('should correctly calculate and store points', () => {
    const receipt = {
      "retailer": "Target",
      "purchaseDate": "2022-01-01",
      "purchaseTime": "13:01",
      "items": [
        {
          "shortDescription": "Mountain Dew 12PK",
          "price": "6.49"
        },{
          "shortDescription": "Emils Cheese Pizza",
          "price": "12.25"
        },{
          "shortDescription": "Knorr Creamy Chicken",
          "price": "1.26"
        },{
          "shortDescription": "Doritos Nacho Cheese",
          "price": "3.35"
        },{
          "shortDescription": "   Klarbrunn 12-PK 12 FL OZ  ",
          "price": "12.00"
        }
      ],
      "total": "35.35"
    };

    const result = processReceipt(receipt);
    const id = result.id;

    const expectedPoints = 28;
    expect(receipts[id]).toEqual(expectedPoints);
  })
})