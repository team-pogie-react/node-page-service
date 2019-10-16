import { each } from 'lodash';

class BlogTransformer {
  /**
   * Get Posts Transformer
   * @param posts
   * @returns {Array}
   */
  getPostsTransformer(posts) {
    const data = [];
    each(posts, (item) => {
      let blogExcerpt = item.excerpt.rendered;
      blogExcerpt = blogExcerpt.replace(/<a(.*?)\/a>/g, '');
      data.push({
        title: item.title.rendered,
        link: item.link,
        content: blogExcerpt,
        imageSrc: item.featured_image_src,
      });
    });

    return data;
  }
}

export default BlogTransformer;
