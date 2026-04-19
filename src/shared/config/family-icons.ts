export const FAMILY_ICON_BASE_URL = "https://mad.labpro.hmif.dev/assets";

export const ALLOWED_FAMILY_ICON_URLS = [
  `${FAMILY_ICON_BASE_URL}/family_icon_1.png`,
  `${FAMILY_ICON_BASE_URL}/family_icon_2.png`,
  `${FAMILY_ICON_BASE_URL}/family_icon_3.png`,
  `${FAMILY_ICON_BASE_URL}/family_icon_4.png`,
  `${FAMILY_ICON_BASE_URL}/family_icon_5.png`,
  `${FAMILY_ICON_BASE_URL}/family_icon_6.png`,
  `${FAMILY_ICON_BASE_URL}/family_icon_7.png`,
  `${FAMILY_ICON_BASE_URL}/family_icon_8.png`,
];

const allowedFamilyIconNames = new Set(
  ALLOWED_FAMILY_ICON_URLS.map((iconUrl) => iconUrl.slice(FAMILY_ICON_BASE_URL.length + 1))
);

export function normalizeFamilyIconUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  if (ALLOWED_FAMILY_ICON_URLS.includes(value)) return value;

  let iconName = value;
  if (iconName.startsWith(FAMILY_ICON_BASE_URL)) {
    iconName = iconName.slice(FAMILY_ICON_BASE_URL.length);
  }
  if (iconName.startsWith("/")) {
    iconName = iconName.slice(1);
  }

  if (allowedFamilyIconNames.has(iconName)) {
    return `${FAMILY_ICON_BASE_URL}/${iconName}`;
  }

  return null;
}
