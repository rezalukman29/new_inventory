import { STORAGE_BOOQABLE } from "./config";

export const noImage =
  "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png";

export const isValidUrl = (urlString: string) => {
  var urlPattern = new RegExp(
    "^(https?:\\/\\/)?" + // validate protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // validate domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // validate OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // validate port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // validate query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // validate fragment locator
  return !!urlPattern.test(urlString);
};

export const convertBase64Inventory = async (arr: any) => {
  try {
    const finalData: any = [];
    const mappingBase64 = new Promise<void>((resolve) => {
      arr
        // .sort(function (a: any, b: any) {
        //   if (a.area_name > b.area_name) return 1;
        //   if (a.area_name < b.area_name) return -1;
        //   return 0;
        // })
        .forEach(async (item: any, index: number) => {
          const base64: any = await toDataURL(
            isValidUrl(item.photo) &&
              item.photo.includes("http://66.42.48.163:9000")
              ? item?.photo?.replace(
                  "http://66.42.48.163:9000/booqable/",
                  STORAGE_BOOQABLE
                )
              : item.photo
              ? `https://democreation.site/home/public/${item.photo}`
              : noImage
          );
          finalData.push({ ...item, base64: base64 });
          if (finalData.length == arr.length) resolve();
        });
    });
    await Promise.all([mappingBase64]); //.then((response) => { });
    return Promise.resolve(finalData);
  } catch (error: any) {}
};

export const convertBase64Event = async (arr: any) => {
  try {
    const finalData: any = [];
    const mappingBase64 = new Promise<void>((resolve) => {
      arr
        // .sort(function (a: any, b: any) {
        //   if (a.area_name > b.area_name) return 1;
        //   if (a.area_name < b.area_name) return -1;
        //   return 0;
        // })
        .forEach(async (item: any, index: number) => {
          const base64: any = await toDataURL(
            isValidUrl(item.images) &&
              item.images.includes("http://66.42.48.163:9000")
              ? item?.images?.replace(
                  "http://66.42.48.163:9000/booqable/",
                  STORAGE_BOOQABLE
                )
              : item.images
              ? `https://democreation.site/home/public/${item.images}`
              : noImage
          );
          finalData.push({ ...item, base64: base64 });
          if (finalData.length == arr.length) resolve();
        });
    });
    await Promise.all([mappingBase64]); //.then((response) => { });
    return Promise.resolve(finalData);
  } catch (error: any) {}
};

const toDataURL = (url: string) =>
  fetch(url)
    .then((response) => response.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );
