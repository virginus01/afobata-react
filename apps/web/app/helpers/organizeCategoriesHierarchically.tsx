export function organizeCategoriesHierarchically(categories: any[]) {
  // Create a map to quickly lookup categories by their ID
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  // Function to trace the full hierarchy path
  function getHierarchyPath(categoryId: string): string[] {
    const path: string[] = [];
    let currentCategory = categoryMap.get(categoryId);

    while (currentCategory) {
      path.unshift(currentCategory.id);
      currentCategory = currentCategory.category ? categoryMap.get(currentCategory.category) : null;
    }

    return path;
  }

  // Function to calculate depth
  function getDepth(categoryId: string): number {
    return getHierarchyPath(categoryId).length - 1;
  }

  // Organize categories hierarchically
  return categories
    .map((category) => ({
      ...category,
      value: category.id,
      depth: getDepth(category.id),
      hierarchyPath: getHierarchyPath(category.id).join('/'),
      label: `${'-'.repeat(getDepth(category.id))} ${category.title}`,
      index: getHierarchyPath(category.id).join('_'),
    }))
    .sort((a, b) => {
      // Sort by hierarchy path to maintain correct order
      return a.hierarchyPath.localeCompare(b.hierarchyPath);
    });
}
