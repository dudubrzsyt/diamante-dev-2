export const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://novabill.com.br";
export const SITE_NAME = "BLL do Brasil";
export const SITE_DESCRIPTION = "Soluções em corte, dobra e fabricação de estruturas metálicas para indústria, logística, construção civil e postos de combustíveis.";
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, position) => ({
      "@type": "ListItem",
      position: position + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function serviceSchema(name: string, description: string, path: string) {
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(path)}#service`,
    name,
    description,
    url: absoluteUrl(path),
    provider: { "@id": ORGANIZATION_ID },
    areaServed: { "@type": "Country", name: "Brasil" },
    serviceType: name,
  };
}

export function itemListSchema(items: { name: string; description: string }[], path: string) {
  return {
    "@type": "ItemList",
    "@id": `${absoluteUrl(path)}#catalog`,
    name: "Catálogo de produtos BLL do Brasil",
    numberOfItems: items.length,
    itemListElement: items.map((item, position) => ({
      "@type": "ListItem",
      position: position + 1,
      item: { "@type": "Product", name: item.name, description: item.description, url: absoluteUrl(path) },
    })),
  };
}

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}
