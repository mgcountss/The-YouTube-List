//https://www.npmjs.com/package/youtube-search-api
import axios from "axios";
const youtubeEndpoint = `https://www.youtube.com`;

const GetYoutubeInitData = async (url) => {
  var initdata = await {};
  var apiToken = await null;
  var context = await null;
  try {
    const page = await axios.get(encodeURI(url));
    const ytInitData = await page.data.split("var ytInitialData =");
    if (ytInitData && ytInitData.length > 1) {
      const data = await ytInitData[1].split("</script>")[0].slice(0, -1);
      if (page.data.split("innertubeApiKey").length > 0) {
        apiToken = await page.data
          .split("innertubeApiKey")[1]
          .trim()
          .split(",")[0]
          .split('"')[2];
      }
      if (page.data.split("INNERTUBE_CONTEXT").length > 0) {
        context = await JSON.parse(
          page.data.split("INNERTUBE_CONTEXT")[1].trim().slice(2, -2)
        );
      }
      initdata = await JSON.parse(data);
      return await Promise.resolve({ initdata, apiToken, context });
    } else {
      console.error("cannot_get_init_data");
      return await Promise.reject("cannot_get_init_data");
    }
  } catch (ex) {
    await console.error(ex);
    return await Promise.reject(ex);
  }
};

const GetData = async (
  keyword,
  withPlaylist = false,
  limit = 0,
  options = []
) => {
  let endpoint = await `${youtubeEndpoint}/results?search_query=${keyword}`;
  try {
    if (Array.isArray(options) && options.length > 0) {
      const type = options.find((z) => z.type);
      if (typeof type == "object") {
        if (typeof type.type == "string") {
          switch (type.type.toLowerCase()) {
            case "video":
              endpoint = `${endpoint}&sp=EgIQAQ%3D%3D`;
              break;
            case "channel":
              endpoint = `${endpoint}&sp=EgIQAg%3D%3D`;
              break;
            case "playlist":
              endpoint = `${endpoint}&sp=EgIQAw%3D%3D`;
              break;
            case "movie":
              endpoint = `${endpoint}&sp=EgIQBA%3D%3D`;
              break;
          }
        }
      }
    }
    const page = await GetYoutubeInitData(endpoint);
    const sectionListRenderer = await page.initdata.contents
      .twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer;
    let contToken = await {};
    let items = await [];
    await sectionListRenderer.contents.forEach((content) => {
      if (content.continuationItemRenderer) {
        contToken =
          content.continuationItemRenderer.continuationEndpoint
            .continuationCommand.token;
      } else if (content.itemSectionRenderer) {
        content.itemSectionRenderer.contents.forEach((item) => {
          if (item.channelRenderer) {
            let channelRenderer = item.channelRenderer;
            try {
              items.push({
                id: channelRenderer.channelId,
                type: "channel",
                image: channelRenderer.thumbnail.thumbnails[channelRenderer.thumbnail.thumbnails.length - 1].url,
                title: channelRenderer.title.simpleText,
                handle: channelRenderer.subscriberCountText.simpleText ? channelRenderer.subscriberCountText.simpleText : "",
                badges: channelRenderer.ownerBadges ? channelRenderer.ownerBadges[0].metadataBadgeRenderer.style : null,
                subscribers: channelRenderer.videoCountText.simpleText ? channelRenderer.videoCountText.simpleText : 0
              });
            } catch (ex) {
              items.push({
                id: channelRenderer.channelId,
                type: "channel",
                image: channelRenderer.thumbnail.thumbnails[channelRenderer.thumbnail.thumbnails.length - 1].url,
                title: channelRenderer.title.simpleText,
                handle: channelRenderer.subscriberCountText ? channelRenderer.subscriberCountText.simpleText : "",
                badges: channelRenderer.ownerBadges ? channelRenderer.ownerBadges[0].metadataBadgeRenderer.style : null,
                subscribers: 0
              });
            }
          } else {
            let videoRender = item.videoRenderer;
            let playListRender = item.playlistRenderer;
            if (videoRender && videoRender.videoId) {
              items.push(VideoRender(item));
            }
            if (withPlaylist) {
              if (playListRender && playListRender.playlistId) {
                items.push({
                  id: playListRender.playlistId,
                  type: "playlist",
                  thumbnail: playListRender.thumbnails,
                  title: playListRender.title.simpleText,
                  length: playListRender.videoCount,
                  videos: playListRender.videos,
                  videoCount: playListRender.videoCount,
                  isLive: false
                });
              }
            }
          }
        });
      }
    });
    const apiToken = await page.apiToken;
    const context = await page.context;
    const nextPageContext = await { context: context, continuation: contToken };
    const itemsResult = limit != 0 ? items.slice(0, limit) : items;
    return await Promise.resolve({
      items: itemsResult,
      nextPage: { nextPageToken: apiToken, nextPageContext: nextPageContext }
    });
  } catch (ex) {
    await console.error(ex);
    return await Promise.reject(ex);
  }
};

export default {
  GetListByKeyword: GetData
};