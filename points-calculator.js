const POINT_VALUES = {
  ALPHA_NUM: 1,
  ROUND_TOTAL: 50,
  MULTIPLE_OF_P25: 25,
  EACH_PAIR_ITEMS: 5,
  ITEM_DESC_MULT_OF_3: 0.2,
  ODD_DATE: 6,
  TIME_BETWEEN_2_4: 10,
}

function alphaNumericRetailerPoints(retailer) {
  const regex = /[a-zA-Z0-9]/g;
  return retailer.match(regex).length * POINT_VALUES.ALPHA_NUM;
}

function roundTotalPoints(total) {
  return total % 1 > 0 ? 0 : POINT_VALUES.ROUND_TOTAL;
}

function multipleOfP25Points(total) {
  return total % 0.25 > 0 ? 0 : POINT_VALUES.MULTIPLE_OF_P25;
}

function itemPairsPoints(numItems) {
  return Math.floor(numItems / 2) * POINT_VALUES.EACH_PAIR_ITEMS;
}

function itemDescriptionPoints(items) {
  return (
    items.reduce((total, item) =>
      total + Math.ceil((item.shortDescription.trim().length % 3 > 0) ? 0 : (item.price * POINT_VALUES.ITEM_DESC_MULT_OF_3))
    , 0)
  )
}

function oddDatePoints(date) {
  const dateArray = date.split('-');
  const day = Number(dateArray[2]);
  return day % 2 === 0 ? 0 : POINT_VALUES.ODD_DATE;
}

function timeBetween2And4Points(time) {
  const timeArray = time.split(':');
  const hour = Number(timeArray[0]);
  return (hour >= 14 && hour < 16) ? POINT_VALUES.TIME_BETWEEN_2_4 : 0;
}

async function calculatePoints(receipt) {
  const { retailer, purchaseDate, purchaseTime, items } = receipt;
  const total = Number(receipt.total);

  try {
    const totalPoints =
      alphaNumericRetailerPoints(retailer) +
      roundTotalPoints(total) +
      multipleOfP25Points(total) +
      itemPairsPoints(items.length) +
      itemDescriptionPoints(items) +
      oddDatePoints(purchaseDate) +
      timeBetween2And4Points(purchaseTime)
    ;

    return totalPoints;
  } catch (err) {
    console.error('Error calculating points: ', err);
  }
}

export { calculatePoints };