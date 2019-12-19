boxesToDelete.forEach(boxToDelete => {
  boxToDelete.productVariants.forEach(productVariant => {
    const storeProduct = get(memoizedOrder, `${productVariant.sku}.${boxToDelete.storeId}`);
    if (storeProduct)
      storeProduct.dispatched -= productVariant.quantity;
  });
});