import { URLSearchParams } from 'url';
import CacheInstance from '../core/Cache';
import TIMEOUTS from '../configs/timeouts';
import BlogTransformer from '../transformers/BlogTransformer';
import { cache } from '../configs/services';
import ApiService from './ApiService';
import { makeHttpClientError } from '../errors/make';

export default class Blog extends ApiService {
  /**
   * Create Blog instance.
   */
  constructor() {
    super();

    this.baseUrl = process.env.BLOG_BASE_URL;
    this.http = this._getClient(TIMEOUTS.BLOGS);
    this.http.defaults.headers.common['User-Agent'] = 'Nexus-Composite-Service';

    this.transformer = new BlogTransformer();
    this.cache = CacheInstance;
  }

  /**
   * Return Blog Posts
   * @param numberOfPosts
   * @returns {Promise<*>}
   */
  getPosts(numberOfPosts = -1) {
    const fn = () => new Promise((resolve, reject) => {
      const query = new URLSearchParams([
        ['per_page', numberOfPosts],
      ]);

      this.http.get(`${this.baseUrl}/wp/v2/posts?${query}`)
        .then((posts) => {
          resolve(this.transformer.getPostsTransformer(posts.data));
        })
        .catch(error => reject(makeHttpClientError(error)));
    });

    return this.cache.remember(`get_posts_${numberOfPosts}`, cache.GET_POSTS, fn);
  }
}
