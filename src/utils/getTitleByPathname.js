import appConfig from "@/appConfig";

export const getTitleByPathname = (pathname) => {
  if (pathname.includes("staking")) {
    return appConfig.titles.staking;
  } else if (pathname.includes("market")) {
    return appConfig.titles.market;
  } else if (pathname.includes("about")) {
    return appConfig.titles.about;
  } else if (pathname.includes("faq")) {
    return appConfig.titles.faq;
  }

  return appConfig.titles.default;
}