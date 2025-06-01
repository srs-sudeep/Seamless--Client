import { RouteObject } from 'react-router-dom';
export function filterNestedRoutesByAvailable(
  allRoutes: RouteObject[],
  availablePaths: string[]
): RouteObject[] {
  return allRoutes.reduce<RouteObject[]>((acc, route) => {
    if (!route.children) return acc;

    const matchedChildren = route.children.filter(
      child =>
        child.path && availablePaths.includes(`/${route.path}/${child.path}`.replace(/\/+/g, '/'))
    );

    if (matchedChildren.length > 0) {
      acc.push({
        ...route,
        children: matchedChildren,
      });
    }

    return acc;
  }, []);
}
