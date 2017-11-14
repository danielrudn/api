import YouTubeService from './youtube';
import SoundCloudService from './soundcloud';
import { BadRequestError } from '../../errors';

export default async function(url) {
  const hostname = url.hostname.toLowerCase();
  if (hostname.endsWith('youtube.com')) {
    return await YouTubeService.fetchTrack(url);
  } else if (hostname.endsWith('soundcloud.com')) {
    return await SoundCloudService.fetchTrack(url);
  } else {
    throw BadRequestError('Provider is not supported.');
  }
}
