import axios from 'axios';

const { YOUTUBE_API_KEY } = process.env;

class YouTubeService {
  async fetchTrack(url) {
    const id = url.searchParams.get('v');
    const response = await axios.get(
      `https://content.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`
    );
    const data = response.data.items[0];
    return {
      title: data.snippet.title,
      artworkUrl: data.snippet.thumbnails.high.url,
      poster: data.snippet.channelTitle,
      duration: this.__parseDuration(data.contentDetails.duration),
      provider: 'YouTube',
      url: url.toString()
    };
  }

  __parseDuration(duration) {
    return eval(
      duration
        .substring(2)
        .replace('H', '* 60000 * 60 +')
        .replace('M', '* 60000 +')
        .replace('S', ' * 1000')
        .replace(/\+$/, '')
    );
  }
}

export default new YouTubeService();
