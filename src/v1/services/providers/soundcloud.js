import axios from 'axios';

const { SOUNDCLOUD_API_KEY } = process.env;

class SoundCloudService {
  async fetchTrack(url) {
    const response = await axios.get(
      `https://api.soundcloud.com/resolve?url=${url.toString()}&client_id=${SOUNDCLOUD_API_KEY}`
    );
    const { data } = response;
    return {
      title: data.title,
      artworkUrl: data.artwork_url,
      poster: data.user.username,
      duration: data.duration,
      provider: 'SoundCloud',
      url: url.toString()
    };
  }
}

export default new SoundCloudService();
