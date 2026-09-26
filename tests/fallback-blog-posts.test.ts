import assert from "node:assert/strict";
import test from "node:test";
import { getFallbackBlogPost } from "../src/lib/fallback-blog-posts";

test("missing fuel-system guide slugs have indexable editorial fallbacks", () => {
  for (const slug of ["fuel-system-revival-guide", "xado-atomex-energy-drive-guide", "octane-booster-vs-fuel-system-cleaner"]) {
    const post = getFallbackBlogPost(slug);
    assert.ok(post, `expected fallback article for ${slug}`);
    assert.equal(post.slug, slug);
    assert.ok(post.title.length > 10);
    assert.ok(post.content.length > 500);
    assert.ok(post.seoDescription.length > 50);
    assert.equal(post.relatedProducts.length, 0);
  }
});

test("unrecognized article slugs do not receive fallback content", () => {
  assert.equal(getFallbackBlogPost("not-a-real-article"), null);
});
